async function pesquisarPedidosV3(ACCESS_TOKEN, url_params) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${ACCESS_TOKEN}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders
    };

    return fetch(`https://api.tiny.com.br/public-api/v3/pedidos?${url_params}`, requestOptions)
        .then(response => response.text())
        // .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

export default pesquisarPedidosV3;
