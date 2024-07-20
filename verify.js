import * as deepl from 'deepl-node';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const keys = [
        'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX:fx',
    ];
    
    let active = []
    for (let key of [...new Set(keys)]) {
        try {
            const translator = new deepl.Translator(key, { maxRetries: 3, minTimeout: 10000 });
            const usage = await translator.getUsage();
            console.log(key, JSON.stringify(usage));
            active.push({
                key: key,
                usage: usage
            });
        } catch (e) {
            console.log(key, e.message);
        }
    }

    active.sort((a, b) => a.usage.character.count - b.usage.character.count);

    console.log("Active accounts:");
    active.forEach(account => console.log(`API_KEY=${account.key} # ${account.usage.character.count} characters`));
    // let response = await translate2("Hello, world!");
    // console.log(response);
}

async function translate2(text) {
    await sleep(1 * 1000);
    const result = await translator.translateText(text, null, 'uk', {
        preserve_formatting: true,
    });
    return result.text;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

await main();