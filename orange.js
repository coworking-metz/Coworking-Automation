import * as pennylane from './libs/pennylane.js';
import * as downloads from './libs/downloads.js';
import * as orange from './libs/orange.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();


await orange.telechargerDerniereFacture();

console.log('Envoi des documents vers Pennylane')
const documents = await downloads.list('orange')
if (documents.length > 0) {
    console.log(documents.length + ' document(s) à envoyer')

    await pennylane.sendDocuments(documents)

    for (const document of documents) {
        await downloads.treated('orange', document.path)
    }
} else {
    console.log('Aucun document à envoyer')
}
process.exit()