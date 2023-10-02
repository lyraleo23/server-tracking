const TOKEN = process.env.WHATSAPP_TOKEN;
const version = 'v15.0';
const phone_number_id = '105079962312664';

function sendTrackingStatus(templateObj) {
    const url = `https://graph.facebook.com/${version}/${phone_number_id}/messages`;

    let myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

    let raw = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": templateObj.phone,
        "type": "template",
        "template": {
            "name": templateObj.templateName,
            "language": {
                "code": "pt_BR",
                "policy": "deterministic"
            },
            "components": [{
                "type": "body",
                "parameters": templateObj.templateParameters
            }]
        }
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

export default sendTrackingStatus;
