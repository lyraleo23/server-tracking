function updateStatusMiliApp(invoice_number, tracking_code, tracking_url, shipment_order_volume_state_localized) {
    const url = `https://api.fmiligrama.com/vendas/rastreamento`;

    let myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
        numero_nota_fiscal: invoice_number,
        status_entrega: shipment_order_volume_state_localized,
        codigo_rastreamento: tracking_code,
        url_rastreamento: tracking_url
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw
    };

    return fetch(url, requestOptions)
        .then(response => response.text())
        .catch(error => console.log('error', error));
}

export default updateStatusMiliApp;
