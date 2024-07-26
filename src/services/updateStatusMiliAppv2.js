function updateStatusMiliAppv2(raw) {
    const url = `https://api.fmiligrama.com/vendas/rastreamento/v2`;

    let myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(raw)
    };

    return fetch(url, requestOptions)
        .then(response => response.text())
        .catch(error => console.log('error', error));
}

export default updateStatusMiliAppv2;
