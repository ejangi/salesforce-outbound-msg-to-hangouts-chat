const request = require('request'),
      xml2js = require('xml2js'),
      xmlParser = new xml2js.Parser();



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
        xml = Buffer.from(req.body, 'base64').toString();

    if (url == undefined || xml == undefined) res.status(400).send('Bad Request');

    let body = xmlParser.parseStringPromise(xml)
        .then((result) => {
            processNotifications(result, url);
        })
        .catch(function(err) {
            console.error(err);  
        });

    // If we don't have a URL, there's not much we can do:
    if (url == undefined) res.status(400).send('Bad Request');

    // Salesforce doesn't need any response from us, but we'll put this here anyway:
    res.status(200).send();
};



/**
 * Process the Salesforce notifications node(s).
 * Salesforce sends an XML Buffer that we transform to JSON and has the format:
 * 
 * {
 *     "soapenv:Envelope": {
 *         "$": {
 *             "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
 *             "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
 *             "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
 *         },
 *         "soapenv:Body": [{
 *             "notifications": [{
 *                 "$": {
 *                     "xmlns": "http://soap.sforce.com/2005/09/outbound"
 *                 },
 *                 "OrganizationId": ["00D7F00000107XsUAI"],
 *                 "ActionId": ["04k7F0000008V3hQAE"],
 *                 "SessionId": [{
 *                     "$": {
 *                         "xsi:nil": "true"
 *                     }
 *                 }],
 *                 "EnterpriseUrl": ["https://ap5.salesforce.com/services/Soap/c/47.0/00D7F00000107Xs"],
 *                 "PartnerUrl": ["https://ap5.salesforce.com/services/Soap/u/47.0/00D7F00000107Xs"],
 *                 "Notification": [{
 *                     "Id": ["04l7F000008aePZQAY"],
 *                     "sObject": [{
 *                         "$": {
 *                             "xsi:type": "sf:Opportunity",
 *                             "xmlns:sf": "urn:sobject.enterprise.soap.sforce.com"
 *                         },
 *                         "sf:Id": ["0067F000003pmdQQAQ"],
 *                         "sf:AccountId": ["0017F000007ydJgQAI"],
 *                         "sf:Amount": ["50000.0"],
 *                         "sf:CloseDate": ["2017-04-29"],
 *                         "sf:LeadSource": ["Web"],
 *                         "sf:Name": ["Edge Installation"],
 *                         "sf:StageName": ["Closed Won"]
 *                     }]
 *                 }]
 *             }]
 *         }]
 *     }
 * }
 * 
 * @param {Object} notifications 
 * @param {String} hangoutsUrl
 * 
 *
 */
function processNotifications(notifications, hangoutsUrl) {
    if (notifications['soapenv:Envelope']['soapenv:Body'][0]['notifications'] == undefined) {
        console.error('Notifications format was unexpected: ', JSON.stringify(notifications));
    }
    
    notifications['soapenv:Envelope']['soapenv:Body'][0]['notifications'].forEach((notification) => {
        let note,
            url;

        if (notification['Notification'][0]['sObject'][0] == undefined) {
            console.error('Notification format was unexpected: ', JSON.stringify(notification));
            return;
        }

        if (notification['EnterpriseUrl'] !== undefined) {
            url = notification['EnterpriseUrl'][0].replace(/\/services\/Soap\/c\/[0-9\.]+\/[a-zA-Z0-9]{15,18}/g, '');
        }

        note = notification['Notification'][0]['sObject'][0];

        Object.keys(note).forEach((key) => {
            if (key.indexOf('sf:') !== -1) {
                let k = key.replace('sf:', '');
                note[k] = note[key][0];
                delete note[key];
            }
        });

        if (notification['Notification'][0]['sObject'][0]['$']['xsi:type'] != undefined) {
            note['RecordType'] = notification['Notification'][0]['sObject'][0]['$']['xsi:type'].replace('sf:', '');
        }

        if (Object.keys(note).includes('$')) {
            delete note['$'];
        }

        note['url'] = url;

        let card = formatHangoutsChatCard(note);

        if (hangoutsUrl == undefined) res.status(400).send('Bad Request');

        request.post({
            url: hangoutsUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(card)
        }, function (error, response, body) {
            if (error) {
                console.error('error:', error);
            }
        });
    });
    
}



/**
 * Format the Salesforce data into a Hangouts Chat Card
 * 
 * @param {String} msg
 */
function formatHangoutsChatCard(msg) {
    if (msg == undefined) return null;
    let ignoredKeys = [ 'Name', 'RecordType', 'Id', 'url' ];

    let title = 'Salesforce Record',
        subtitle = 'Record',
        id = '',
        fields = [];

    if (msg.Name !== undefined) title = msg.Name;
    if (msg.RecordType !== undefined) subtitle = msg.RecordType;    
    if (msg.Id !== undefined) id = msg.Id;

    Object.keys(msg).forEach((key) => {
        if (ignoredKeys.includes(key)) return;

        fields.push({
            "keyValue" : {
                "topLabel": key.replace(/([A-Z])/g, ' $1'),
                "content": formatField(msg[key], key)
            }
        });
    });


    let card = {
        "cards": [
            {
            "header": {
                "title": title,
                "subtitle": subtitle,
                "imageUrl": "https://c1.sfdcstatic.com/content/dam/web/en_us/www/images/nav/salesforce-cloud-logo-sm.png"
            },
            "sections": [
                {
                    "widgets": fields
                },
                {
                "widgets": [
                    {
                        "buttons": [
                            {
                            "textButton": {
                                "text": "OPEN IN SALESFORCE",
                                "onClick": {
                                "openLink": {
                                    "url": msg.url + "/lightning/r/sObject/" + id + "/view"
                                }
                                }
                            }
                            }
                        ]
                    }
                ]
                }
            ]
            }
        ]
    };
      
    return card;
}



/**
 * Format Salesforce fields for output
 * 
 * @param {String} field 
 */
function formatField(field, key) {
    // Detect dates:
    if (field.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/)) {
        let d = new Date(field);
        return d.toString();
    }

    // Detect decimals:
    if (field.match(/^([0-9]+)(\.)([0-9]+)/)) {
        let n = field.replace(/\.([0-9]{1})$/, '.$10');
        n = n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return n;
    }

    return field;
}