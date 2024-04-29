import puppeteer from 'puppeteer';
import path from 'path';
import * as downloads from './downloads.js';

export async function telechargerDerniereFacture() {

    const downloadPath = path.resolve(downloads.DOWNLOADS_DIR);



    const headless = process.env.HEADLESS == 'false' ? false : true;
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless });
    const page = await browser.newPage();

    // Get the CDP session to set download behavior
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
    });
    // Navigate the page to a URL
    await page.goto('https://dro.orange.fr/authentification?TARGET=https://dro.orange.fr/detrompeur/B2B%3FcodeContexte%3DOPUS');

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    console.log('CMP')

    // Check if the 'didomi-notice-agree-button' exists and click it if present
    const agreeButton = await page.$('#didomi-notice-agree-button');
    if (agreeButton) {
        console.log("Found the CMP agree button. Clicking...");
        await agreeButton.click();
    }


    console.log('Connexion')
    // Wait for the input element to be ready
    await page.waitForSelector('#username', { visible: true });

    console.log(' - Username')
    // Set the value of the input field
    await page.evaluate((login) => {
        document.querySelector('#username').value = login;
    }, process.env.ORANGE_LOGIN);

    await page.waitForSelector('#submit-button');
    await Promise.all([
        page.waitForNavigation(), // Wait for the page to load
        await page.click('#submit-button')
    ]);

    await page.waitForSelector('#password', { visible: true });
    console.log(' - Password')
    await page.focus('#password');
    await page.keyboard.type(process.env.ORANGE_PASSWORD);

    console.log(' - Validation du formulaire')
    await page.waitForSelector('#btnSubmit', { visible: true });
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }), // Waits for the network to be idle
        await page.click('#btnSubmit')
    ]);

    await page.waitForSelector('[title="Télécharger la dernière facture en PDF"]', { visible: true });
    await page.click('[title="Télécharger la dernière facture en PDF"]')


    // Optional: Wait for a specific file to be downloaded
    console.log("Waiting for the download to complete...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds or use a better signal for completion
    console.log("Download should be complete.");

    console.log(' - Terminé')

    await browser.close();

}