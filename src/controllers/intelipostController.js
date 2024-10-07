import consultarPedidoNotaFiscal from '../services/consultarPedidoNotaFiscal.js';
import sendTrackingStatus from '../services/sendTrackingStatus.js';
import getTemplate from '../services/getTemplate.js';
import updateStatusMiliApp from '../services/updateStatusMiliApp.js';
import obterTokenTiny from '../services/MiliApp/obterTokenTiny.js';
import pesquisarPedidoPorFiltro from '../services/MiliApp/pesquisarPedidoPorFiltro.js';
import pesquisarPedidosV3 from '../services/Tiny_V3/pesquisarPedidosV3.js';
import atualizarDespachoV3 from '../services/Tiny_V3/atualizarDespachoV3.js';
import atualizarSituacaoPedidoV3 from '../services/Tiny_V3/atualizarSituacaoPedidoV3.js';

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
            if (request.estimated_delivery_date.logistic_provider.current_iso) {
                estimated_delivery_date = request.estimated_delivery_date.logistic_provider.current;
            }
        }

        let pedidoIntelipostObj = await consultarPedidoNotaFiscal(invoice_number);
        pedidoIntelipostObj = JSON.parse(pedidoIntelipostObj);

        let sales_channel = pedidoIntelipostObj.content[0].sales_channel;
        console.log(`sales_channel = ${sales_channel}`);

        if (sales_channel === 'Miligrama Nordeste Farmácia de Manipulação') {
            var origin = 'miligrama_nordeste';
            var cnpj = '56982667000191';
        }
        else {
            var origin = 'miligrama';
            var cnpj = '07413904000198';
        }
        console.log(`origin = ${origin}`);

        // Busca token tiny
        try {
            let token_response = await obterTokenTiny();
            token_response = JSON.parse(token_response);
            
            for (let k = token_response.length - 1; k >= 0; k--) {
                let token_origin = token_response[k].origin;
                if (token_origin === origin) {
                    var access_token = token_response[k].access_token;
                }
            }
        }
        catch(e) {
            console.error(`Erro ao buscar token: ${e.message}`);
        }

        try {
            // let token_response = await obterTokenTiny();
            // token_response = JSON.parse(token_response);
            // let access_token = token_response[token_response.length - 1].access_token;
            let url_params;

            try {
                // url_params = `numero_ecommerce=${sales_order_number}&cnpj=${cnpj}`;
                url_params = `numero_ecommerce=${sales_order_number}`;
                var response_pesquisa = await pesquisarPedidoPorFiltro(url_params);
                response_pesquisa = JSON.parse(response_pesquisa);
                var tiny_id = response_pesquisa.data[0].idPedidoTiny;
            }
            catch(e) {
                console.error(`Erro ao pesquisar pelo numero_ecommerce: ${e.message}`);
                try {
                    // url_params = `numero_nota_fiscal=${invoice_number}&cnpj=${cnpj}`;
                    url_params = `numero_nota_fiscal=${invoice_number}`;
                    var response_pesquisa = await pesquisarPedidoPorFiltro(url_params);
                    response_pesquisa = JSON.parse(response_pesquisa);
                    var tiny_id = response_pesquisa.data[0].idPedidoTiny;
                }
                catch(e) {
                    console.error(`Erro ao pesquisar pelo numero_nota_fiscal: ${e.message}`);
                }
            }
            console.log(`tiny_id = ${tiny_id}`);

            if (tiny_id) {
                switch (shipment_order_volume_state) {
                    // case 'NEW':
                    //     var situacao = 1;
                    //     break;
                    // case 'CREATED':
                    //     var situacao = 7;
                    //     break;
                    case 'SHIPPED':
                        var situacao = 7;
                        break;
                    case 'IN_TRANSIT':
                        var situacao = 5;
                        break;
                    case 'TO_BE_DELIVERED':
                        var situacao = 5;
                        break;
                    case 'DELIVERED':
                        var situacao = 6;
                        break;
                    default:
                        break;
                }
                console.log(`Id: ${tiny_id} - ${shipment_order_volume_state} - situação: ${situacao}`);
    
                let despacho = {
                    'codigoRastreamento': tracking_code,
                    'urlRastreamento': tracking_url
                }
    
                let response_despacho = await atualizarDespachoV3(access_token, tiny_id, despacho)
                console.log(`response_despacho = ${response_despacho}`);
                if (situacao) {
                    let response_situacao = await atualizarSituacaoPedidoV3(access_token, tiny_id, situacao)
                }
                console.log(`Id: ${tiny_id} - Atualizado pela API V3!`);
            }
        }
        catch(e) {
            console.error(`Erro ao atualizar pela API V3: ${e.message}`);
        }

        // Atualiza despacho no miliapp
        try {
            let raw = {
                'numero_nota_fiscal': invoice_number,
                'status_entrega': shipment_order_volume_state_localized,
                'codigo_rastreamento': tracking_code,
                'url_rastreamento': tracking_url,
                'data_prevista': new Date(estimated_delivery_date),
                'volume_number': volume_number,
                'shipment_volume_micro_state': shipment_volume_micro_state,
                'provider_message': provider_message
            };
            await updateStatusMiliApp(raw);
            console.log(`numero_nota_fiscal: ${invoice_number} - Atualizado MiliApp!`);
        } catch (e) {
            console.log(`Erro ao atualizar status no MiliApp: ${e.message}`);
        }

        //  Envio de Status pelo WhatsApp
        if ((shipment_order_volume_state === 'SHIPPED' ||
            // shipment_order_volume_state === 'IN_TRANSIT' ||
            shipment_order_volume_state === 'TO_BE_DELIVERED' ||
            shipment_order_volume_state === 'DELIVERED') &&
            (sales_channel === 'Miligrama Farmácia de Manipulação' || sales_channel === 'Miligrama Nordeste Farmácia de Manipulação')) {

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
