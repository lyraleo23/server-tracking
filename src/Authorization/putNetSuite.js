import https from "https";

function putNetSuite(authorization, data, res){
          
  var options = {
    'method': 'PUT',
    'hostname': '5240409.restlets.api.netsuite.com',
    'path': '/app/site/hosting/restlet.nl?script=2521&deploy=1',
    'headers': {
      'Authorization': authorization,
      'Content-Type': 'application/json',
      'Cookie': 'NS_ROUTING_VERSION=LAGGING'
    },
    'maxRedirects': 20
  };
          
  var request = https.request(options, function (response) {
    var chunks = [];
        
    response.on("data", function (chunk) {
      chunks.push(chunk);
    });
          
    response.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
      return res.status(200).send(body.toString());
    });
          
    response.on("error", function (error) {
      console.error(error);
      return error
    });
  });

  var postData = JSON.stringify(data);
        
  request.write(postData);

  request.end();
}

export default putNetSuite;