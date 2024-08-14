async function atualizarSituacaoPedidoV3(ACCESS_TOKEN, id, situacao) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${ACCESS_TOKEN}`);

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify({
            'situacao': Number(situacao)
        }),
    };

    return fetch(`https://api.tiny.com.br/public-api/v3/pedidos/${id}/situacao`, requestOptions)
        .then(response => response.text())
        // .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

export default atualizarSituacaoPedidoV3;
