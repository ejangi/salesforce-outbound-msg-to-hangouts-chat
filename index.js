const request = require('request');

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.salesforceOutboundMessagesToHangoutsChat = (req, res) => {
    let url = decodeURIComponent(req.query.url),
        body = req.body;

    if (url == undefined) res.status(400).send('Bad Request');

    body = { "text": body };

    request.post(url, body, function (error, response, body) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    });

    // Salesforce doesn't need any response from us, but we'll put this here anyway:
    res.status(200).send();
};