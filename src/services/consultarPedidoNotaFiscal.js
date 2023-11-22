const INTELIPOST_TOKEN = process.env.INTELIPOST_TOKEN;

function consultarPedidoNotaFiscal(numero_da_notafiscal) {
    const url = `https://api.intelipost.com.br/api/v1/shipment_order/invoice/${numero_da_notafiscal}`;

    let myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("api-key", INTELIPOST_TOKEN);

    let requestOptions = {
        method: 'GET',
        headers: myHeaders
    };

    return fetch(url, requestOptions)
        .then(response => response.text())
        // .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

export default consultarPedidoNotaFiscal;
