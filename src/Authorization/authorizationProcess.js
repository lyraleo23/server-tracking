import jsSHA from "jssha";
import crypto from "crypto";

function getAuthorization(method) {
  const oauth_timestamp = Math.round(new Date().getTime() / 1000.0);

  const nonceObj = new jsSHA('SHA-1', 'TEXT', { encoding: 'UTF8' });
  nonceObj.update(Math.round(new Date().getTime() / 1000.0));
          
  const oauth_nonce = nonceObj.getHash('HEX');

  let oauth_signature = getSignature(method, oauth_timestamp, oauth_nonce);
  // console.log('oauth_signature ' + oauth_signature);

  return `OAuth realm="5240409",oauth_consumer_key="11072424f8bad127ef1502535a884d72b4793ae5496855ef25b231586341fa25",oauth_token="f58b380a0d93f04025189a3d86adb98f0357499694527722cb4bb296a01491b5",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${oauth_timestamp}",oauth_nonce="${oauth_nonce}",oauth_version="1.0",oauth_signature="${oauth_signature}"`;
}

function getSignature(method, oauth_timestamp, oauth_nonce) {

  // const method = 'POST';
  const realm = '5240409';
  const oauth_consumer_key = '11072424f8bad127ef1502535a884d72b4793ae5496855ef25b231586341fa25';
  const oauth_token = 'f58b380a0d93f04025189a3d86adb98f0357499694527722cb4bb296a01491b5';
  const oauth_signature_method = 'HMAC-SHA256';
  const oauth_version = '1.0'

  let baseURL = 'https://5240409.restlets.api.netsuite.com/app/site/hosting/restlet.nl';

  let urlParams = `deploy=1&oauth_consumer_key=${oauth_consumer_key}&oauth_nonce=${oauth_nonce}&oauth_signature_method=${oauth_signature_method}&oauth_timestamp=${oauth_timestamp}&oauth_token=${oauth_token}&oauth_version=${oauth_version}&script=2521`;

  var baseString = method + '&' + encodeURIComponent(baseURL) + '&' + encodeURIComponent(urlParams);

  // console.log('baseString ' + baseString);
         
  let signatureKey = encodeURIComponent('c4b6eee4101a388d3823683751d1abd2e884a3e7b4cb9817c644d854cf8c883a') + '&' + encodeURIComponent('521136a76c81bade16485089279420f163751107d5ca213606343dab9b1d613b');

  // console.log('signatureKey ' + signatureKey);

  return encodeURIComponent(signKey(signatureKey, baseString))
}

function signKey (signatureKey, baseString) {
  const key = Buffer.from(signatureKey, 'utf8');
  return crypto.createHmac('sha256', key).update(baseString).digest().toString('base64');
}

export default getAuthorization;