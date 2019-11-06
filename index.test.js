const { salesforceOutboundMessagesToHangoutsChat } = require('./index.js');
const sinon = require('sinon');

describe('salesforceOutboundMessagesToHangoutsChat', () => {

    test('that we receive a 200 response', () => {
        // Mock ExpressJS 'req' and 'res' parameters

        const req = {
            query: { url: 'https%3A%2F%2Fchat.googleapis.com%2Fv1%2Fspaces%2FAAAA6K0MZ28%2Fmessages%3Fkey%3DAIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI%26token%3Dm_uePjLEZVEfkioST9iVdQNyAczHaNbMnnq6cIKmGlA%253D' },
            body: Buffer.from('<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><notifications xmlns="http://soap.sforce.com/2005/09/outbound"><OrganizationId>00D7F00000107XsUAI</OrganizationId><ActionId>04k7F0000008V3hQAE</ActionId><SessionId xsi:nil="true"/><EnterpriseUrl>https://ap5.salesforce.com/services/Soap/c/47.0/00D7F00000107Xs</EnterpriseUrl><PartnerUrl>https://ap5.salesforce.com/services/Soap/u/47.0/00D7F00000107Xs</PartnerUrl><Notification><Id>04l7F000008aeAyQAI</Id><sObject xsi:type="sf:Opportunity" xmlns:sf="urn:sobject.enterprise.soap.sforce.com"><sf:Id>0067F000003pmdWQAQ</sf:Id><sf:AccountId>0017F000007ydJmQAI</sf:AccountId><sf:Amount>120000.0</sf:Amount><sf:CloseDate>2017-04-03</sf:CloseDate><sf:LeadSource>Phone Inquiry</sf:LeadSource><sf:Name>Express Logistics SLA</sf:Name><sf:StageName>Perception Analysis</sf:StageName></sObject></Notification></notifications></soapenv:Body></soapenv:Envelope>')
        };
        let Response = function() {
            this.status = (n) => {
                this.statusCode = n;
                return this;
            },
            this.send = (s) => {
                return this;
            }
        }

        let res = new Response();

        const sf = salesforceOutboundMessagesToHangoutsChat(req, res);
    
        expect(res.statusCode).toBe(200);
    });

});