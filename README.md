# Salesforce Outbound Messages to Hangouts Chat

> This Google Cloud Function takes Salesforce Outbound Messages and forwards them to a (given) Hangouts Chat webhook with formatting applied.

## Usage

1. Deploy this function:

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

OR:

```
gcloud functions deploy salesforceOutboundMessagesToHangoutsChat --trigger-http --allow-unauthenticated --runtime nodejs10 --region asia-northeast1
```

2. Create a webhook in an existing Hangouts Chat room:



*TIP: Use the following for your avatar URL: https://c1.sfdcstatic.com/content/dam/web/en_us/www/images/nav/salesforce-cloud-logo-sm.png*

3. [URLEncode](https://www.urlencoder.org/) your webhook URL and append it to your Cloud Function as value for the `url` querystring parameter:

`https://my-great-cloud-function.com/salesforceOutboundMessagesToHangoutsChat?url=<urlencoded-string-here>`

4. Add a Salesforce Outbound Message action to a Workflow Rule:

https://asia-northeast1-lunar-nuance-251922.cloudfunctions.net/salesforceOutboundMessagesToHangoutsChat?url=https%3A%2F%2Fchat.googleapis.com%2Fv1%2Fspaces%2FAAAA6K0MZ28%2Fmessages%3Fkey%3DAIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI%26token%3Dm_uePjLEZVEfkioST9iVdQNyAczHaNbMnnq6cIKmGlA%253D

https://chat.googleapis.com/v1/spaces/AAAA6K0MZ28/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=m_uePjLEZVEfkioST9iVdQNyAczHaNbMnnq6cIKmGlA%3D

*NOTE: Add the querystring variables from the webhook to your outbound message URL*