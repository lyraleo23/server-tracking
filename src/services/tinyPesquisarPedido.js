const TOKEN = process.env.TINY_TOKEN;

function tinyPesquisarPedido(numero) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    var raw = '';

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return fetch(`https://api.tiny.com.br/api2/pedidos.pesquisa.php?token=${TOKEN}&numero=${numero}&formato=JSON`, requestOptions)
        .then(response => response.text())
        .catch(error => console.log('error', error));
}

export default tinyPesquisarPedido;
