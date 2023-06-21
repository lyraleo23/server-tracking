import getAuthorization from "../Authorization/authorizationProcess.js"
import putNetSuite from "../Authorization/putNetSuite.js"


class IntelipostController {

    static receiveNotification = (req, res) => {
        console.log('Recebendo o POST da intelipost');
        let request = req.body
        
        // req.body.checkout_cielo_order_number;
        let type = 'PUT';

        console.log('Autorizando o PUT');
        let authorization = getAuthorization(type);

        console.log('Enviando ao NetSuite');
        putNetSuite(authorization, request, res);
    }
}

export default IntelipostController