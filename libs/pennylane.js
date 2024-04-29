import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import SibApiV3Sdk from '@getbrevo/brevo';

/**
 * Envoie des documents par e-mail.
 * 
 * @param {Array<string>} documents - Les chemins des documents à envoyer.
 * @returns {Promise<void>} - Une promesse résolue une fois que tous les documents sont envoyés.
 */
export async function sendDocuments(documents) {


    const attachment = [];
    for (const document of documents) {
        const fileContent = fs.readFileSync(document.path, { encoding: 'base64' });
        const fileName = path.basename(document.path);
        attachment.push({
            content: fileContent,
            name: fileName,
            contentType: mime.lookup(document)
        })
    }

    const data = {
        sender: { name: 'Coworking Metz', email: 'contact@coworking-metz.fr' },
        // to: [{ email: 'achats@pennylane.cowo.ovh', name: 'Pennylane' }],
        to: [{ email: 'gilles@lesfrancois.com', name: 'Pennylane' }],
        subject: 'Documents envoyés',
        htmlContent: `This email contains ${attachment.length} attachment(s)`,
        attachment
    };


    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Envoi de documents";
    sendSmtpEmail.htmlContent = `${attachment.length} document(s) attached`;
    sendSmtpEmail.sender = { "name": "Coworking Metz", "email": "contact@coworking-metz.fr" };
    sendSmtpEmail.to = [{ "email": process.env.PENNYLANE_EMAIL_ACHATS, "name": "Pennylane Achats" }];
    // sendSmtpEmail.bcc = [{ "email": "coworkingmetz@fmail.com", "name": "Coworking Metz" }];
    sendSmtpEmail.attachment = attachment
    return apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
        console.log(attachment.length+' documents envoyés à Pennylane')
        // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    }, function (error) {
        console.error(error);
    });
}