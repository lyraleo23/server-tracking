import consultarPedidoNotaFiscal from '../services/consultarPedidoNotaFiscal.js';
import sendTrackingStatus from '../services/sendTrackingStatus.js';
import getTemplate from '../services/getTemplate.js';
import updateStatusMiliApp from '../services/updateStatusMiliApp.js';

class IntelipostController {

    static receiveNotification = async (req, res) => {
        console.log('----------------------------------------------');
        console.log('Recebendo o POST da intelipost');
        let request = req.body
        // console.log(req.body);

        //  Main
        const sales_order_number = request.sales_order_number;
        const tracking_code = request.tracking_code;
        const tracking_url = request.tracking_url;
        const invoice_number = request.invoice.invoice_number;
        const volume_number = request.volume_number;

        //  Macro Status
        const shipment_order_volume_state_localized = request.history.shipment_order_volume_state_localized;
        const shipment_order_volume_state = request.history.shipment_order_volume_state;
        const provider_message = request.history.provider_message;

        //  Micro status
        const shipment_volume_micro_state = request.history.shipment_volume_micro_state;

        //  Delivery date
        let estimated_delivery_date;

        if (request.estimated_delivery_date &&
        request.estimated_delivery_date.logistic_provider) {
            // console.log(request.estimated_delivery_date);
            if (request.estimated_delivery_date.logistic_provider.current_iso) {
                // console.log(`timestamp: ${request.estimated_delivery_date.logistic_provider.current}`);
                // console.log(request.estimated_delivery_date.logistic_provider.current_iso);
                estimated_delivery_date = request.estimated_delivery_date.logistic_provider.current;
            }
            else if (request.estimated_delivery_date.logistic_provider.original_iso) {
                // console.log(`timestamp: ${request.estimated_delivery_date.logistic_provider.original}`);
                // console.log(request.estimated_delivery_date.logistic_provider.original_iso);
            }
        }

        let pedidoIntelipostObj = await consultarPedidoNotaFiscal(invoice_number);
        pedidoIntelipostObj = JSON.parse(pedidoIntelipostObj);

        if (shipment_order_volume_state !== 'CREATED') {
            try {
                let raw = {
                    numero_nota_fiscal: invoice_number,
                    status_entrega: shipment_order_volume_state_localized,
                    codigo_rastreamento: tracking_code,
                    url_rastreamento: tracking_url,
                    data_prevista: new Date(estimated_delivery_date),
                    volume_number: volume_number,
                    shipment_volume_micro_state: shipment_volume_micro_state,
                    provider_message: provider_message
                };
    
                await updateStatusMiliApp(raw);
            } catch (e) {
                console.log(`Erro ao atualizar status no MiliApp: ${e.message}`);
            }
        }

        //  Envio de Status pelo WhatsApp
        let sales_channel = pedidoIntelipostObj.content[0].sales_channel;

        if ((shipment_order_volume_state === 'IN_TRANSIT' ||
            shipment_order_volume_state === 'TO_BE_DELIVERED' ||
            shipment_order_volume_state === 'DELIVERED') &&
            (sales_channel === 'Miligrama Farmácia de Manipulação')) {

            try {
                let phone;

                if (pedidoIntelipostObj &&
                pedidoIntelipostObj.content &&
                pedidoIntelipostObj.content[0] &&
                pedidoIntelipostObj.content[0].end_customer) {
                    if (pedidoIntelipostObj.content[0].end_customer.phone) {
                        phone = pedidoIntelipostObj.content[0].end_customer.phone;
                    } 
                    else if (pedidoIntelipostObj.content[0].end_customer.cellphone) {
                        phone = pedidoIntelipostObj.content[0].end_customer.cellphone;
                    }
                    else {
                        // console.log('Sem telefone ou celular');
                    }
                }

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
                    // console.log(`phone: ${phone}`);
    
                    let messageObj = {
                        shipment_order_volume_state: shipment_order_volume_state,
                        customerOrderNumber: sales_order_number,
                        trackingUrl: tracking_url,
                        expectedDeliveryDate: estimated_delivery_date,
                        phone: phone
                    }

                    let templateObj = await getTemplate(messageObj);
                    let messageStatus = await sendTrackingStatus(templateObj);

                    // console.log(`messageStatus`);
                    // console.log(messageStatus);
                    // console.log('----------------------------------------------');
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

export default IntelipostController
