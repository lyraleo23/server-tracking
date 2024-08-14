async function atualizarDespachoV3(ACCESS_TOKEN, id, payload) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${ACCESS_TOKEN}`);

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(payload),
    };

    return fetch(`https://api.tiny.com.br/public-api/v3/pedidos/${id}/despacho`, requestOptions)
        .then(response => response.text())
        // .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

export default atualizarDespachoV3;
