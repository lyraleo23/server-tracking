function getTemplate(messageObj) {
    let templateObj;

    switch (messageObj.shipment_order_volume_state) {
        // case 'IN_TRANSIT':
        case 'SHIPPED':
            templateObj = {
                phone: messageObj.phone,
                templateName: '_pedido_enviado_v3',
                templateParameters: [
                    {
                        "type": "text",
                        "text": messageObj.customerOrderNumber
                    },
                    {
                        "type": "text",
                        "text": messageObj.trackingUrl
                    }
                ]
            }
            break;
        case 'TO_BE_DELIVERED':
            templateObj = {
                phone: messageObj.phone,
                templateName: '_saiu_entrega_imili',
                templateParameters: [
                    {
                        "type": "text",
                        "text": messageObj.customerOrderNumber
                    },
                    {
                        "type": "text",
                        "text": messageObj.trackingUrl
                    }
                ]
            }
            break;
        case 'DELIVERED':
            templateObj = {
                phone: messageObj.phone,
                templateName: '_pedido_entregue_imili',
                templateParameters: [
                    {
                        "type": "text",
                        "text": messageObj.customerOrderNumber
                    }
                ]
            }
            break;
        default:
            break;
    }

    return templateObj;
}

export default getTemplate;
