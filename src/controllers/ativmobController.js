import updateStatusMiliAppv2 from '../services/updateStatusMiliAppv2.js';
import getTemplate from '../services/getTemplate.js';
import sendTrackingStatus from '../services/sendTrackingStatus.js';

import obterTokenTiny from '../services/MiliApp/obterTokenTiny.js';
import pesquisarPedidosV3 from '../services/Tiny_V3/pesquisarPedidosV3.js';
import atualizarDespachoV3 from '../services/Tiny_V3/atualizarDespachoV3.js';
import atualizarSituacaoPedidoV3 from '../services/Tiny_V3/atualizarSituacaoPedidoV3.js';

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
                var nome_situacao = 'entregue';
                var situacao = 6;
                var shipment_order_volume_state = 'DELIVERED';
                break;
            case 'Despachado':
                var nome_situacao = 'enviado';
                var situacao = 5;
                var shipment_order_volume_state = 'TO_BE_DELIVERED'
                break;
            default:
                break;
        }

        if (nome_situacao === 'enviado' || nome_situacao === 'entregue') {
            try {
                console.log('Tentando pela API V3')
                let token_response = await obterTokenTiny();
                token_response = JSON.parse(token_response);
                let access_token = token_response[token_response.length - 1].access_token;

                let url_params = `numero=${package_id}`;
                var response_pesquisa = await pesquisarPedidosV3(access_token, url_params);
                response_pesquisa = JSON.parse(response_pesquisa);
                let tiny_id = response_pesquisa.itens[0].id;
                
                let despacho = {
                    'codigoRastreamento': package_id,
                    'urlRastreamento': rastreio
                }

                let response_despacho = await atualizarDespachoV3(access_token, tiny_id, despacho);
                console.log(response_despacho);
                let response_situacao = await atualizarSituacaoPedidoV3(access_token, tiny_id, situacao);
                console.log(response_situacao);
                console.log(`Id: ${tiny_id} - Atualizado pela API V3!`);
            }
            catch(e) {
                console.error(`Erro ao atualizar o pedido pela API V3: ${e.message}`);

                let raw = {
                    numero: package_id,
                    situacao: nome_situacao,
                    url_rastreamento: rastreio,
                };
                let response = await updateStatusMiliAppv2(raw);
                console.log(response);
                console.log(`package_id: ${package_id} - Atualizado pela api V2`);
            }
            

            try {
                let phone = response_pesquisa.itens[0].cliente.telefone;

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
