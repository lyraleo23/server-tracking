import tinyPesquisarPedido from '../services/tinyPesquisarPedido.js';
import atualizarSituacaoPedido from '../services/atualizarSituacaoPedido.js';
import updateStatusMiliAppv2 from '../services/updateStatusMiliAppv2.js'

class AtivmobController {

    static receiveNotification = async (req, res) => {
        console.log('----------------------------------------------');
        console.log('Recebendo o POST da ativmob');
        let request = req.body;
        console.log(request);

        let package_id = request.package_id;
        let event_dt = request.event_dt;
        let event_desc = request.event_desc;
        let event_code = request.event_code;
        let rastreio = request.attachments_urls.rastreio

        console.log(`package_id: ${package_id} - ${event_desc} - ${rastreio}`);

        switch (event_desc) {
            case 'Entregue':
                var situacao = 'entregue';
                var shipment_order_volume_state = 'DELIVERED';
                break;
            case 'Despachado':
                var situacao = 'enviado';
                var shipment_order_volume_state = 'TO_BE_DELIVERED'
                break;
            default:
                break;
        }

        try {
            let raw = {
                numero: package_id,
                situacao: situacao,
                url_rastreamento: rastreio,
            };
            let response = await updateStatusMiliAppv2(raw);
            console.log(response);
        } catch(e) {
            console.error(`Erro ao atualizar o pedido tiny: ${e.message}`);
        }

        if (situacao === 'enviado' || situacao === 'entregue') {
            try {
                let phone = '5541992545324';

                if (phone) {
                    phone = phone.replace(/[^a-zA-Z0-9]/g,"");
                    phone = phone.replace(/\s/g,"");
    
                    if (startsWith('0', phone, 1)) {
                        phone = phone.slice(1);
                    }
                    if (startsWith('55', phone, 2) && phone.length == 13) {
                        phone = phone;
                    }
                    if (startsWith('55', phone, 2) && phone.length == 12) {
                        phone = phone.slice(0,4) + '9' + phone.slice(4);
                    }
                    if ((!startsWith('55', phone, 2)) && phone.length == 11) {
                        phone = '55' + phone;
                    }
                    if ((!startsWith('55', phone, 2)) && phone.length == 10) {
                        phone = '55' + phone.slice(0,2) + '9' + phone.slice(2);
                    }

                    let messageObj = {
                        shipment_order_volume_state: shipment_order_volume_state,
                        customerOrderNumber: package_id,
                        trackingUrl: rastreio,
                        expectedDeliveryDate: '',
                        phone: phone
                    }
    
                    let templateObj = await getTemplate(messageObj);
                    let messageStatus = await sendTrackingStatus(templateObj);
                }
            } catch (e) {
                console.log(`Erro ao enviar mensagem ao cliente: ${e.message}`);
            }
        }

        res.status(200).send('OK');
    }
}

function startsWith(string, word, length) {
    let result = word.slice(0,length);
    return result == string;
}

export default AtivmobController
