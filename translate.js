import * as deepl from 'deepl-node';
import dotenv from 'dotenv';
import pc from "picocolors";
import fs from 'fs';
import progresify from './utils/progress.js';

dotenv.config();

let files = {
    dialogues: 'DialoguesLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200--6359132067312534950.json',
    general: 'GeneralLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200-6207927063058028102.json'
};
// * cfg
const config = {
    folder_in: './resources/Translated/',
    folder_out: './resources/Translated/',
    target: files.general,
    // ---
    max_char_limit: 500_000,
    max_usage_limit: 75.00,
    batch_size: 10,
    // client
    api_key: process.env.API_KEY,
    max_retry: 3,
    min_timeout: 10_000,
};
// * utils
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    let input = read(config.folder_in + config.target);
    let items = input.mSource.mTerms.Array;

    const translator = new Translator(config);
    await translator.configure();

    let progress = progresify(items.length);

    for (let i = 0, lines = 0; i < items.length; i++) {
        if (translator.usage() > config.max_usage_limit) {
            console.log(translator.status());
            console.log(pc.red("⚠️ Usage limit exceeded!"));
            break;
        }

        let item = items[i];
        let term = item.Term;
        let text = item.Languages.Array[0];

        console.log();
        progress();

        // skip if already translated
        if (!text || text.includes("[***]") || text.includes("ORB")) {
            console.log(pc.gray(`[-] Skipping: ${term}`));
            continue;
        }
        // skip if not cyrillic
        if (/[a-zA-Z]/.test(text) && !/[а-яА-Я]/.test(text)) {
            console.log(`[*] Can't translate: [${term}]\n=> ${text}`);
            continue;
        }

        // translate
        let translation = await translator.translate(text);
        // update translation
        item.Languages.Array = [ translation + " [***] " + text ];

        // print details
        console.log(translator.status());
        console.log(pc.bold(`[${term}]`));
        console.log(">>", pc.red(text));
        console.log("<<", pc.green(translation));

        // should save?
        if (lines++ == config.batch_size) {
            write(config.folder_out + config.target, input);
            console.log(pc.cyan("[*] Translation saved to file"));
            lines = 0;
        }
    }

    write(config.folder_out + config.target, input);
    console.log(pc.cyan("[*] Translation saved to file"));
}

class Translator {
    constructor(config) {
        this.translator = new deepl.Translator(config.api_key, { 
            maxRetries: config.max_retry, 
            minTimeout: config.min_timeout, 
        });
    }
    async configure() {
        let usage = await this.translator.getUsage();
        if (usage.anyLimitReached()) {
            console.log(pc.red("⚠️ Usage limit exceeded!"));
            return;
        }
        this.count = usage.character.count;
        this.limit = usage.character.limit;
        this.lines = 0;
        this.start = +new Date();
    }
    async translate(text) {
        const result = await this.translator.translateText(text, 'ru', 'uk', {
            preserve_formatting: true,
        });
        this.track(text);
        return result.text;
    }

    track(text) {
        this.count += text.length;
        this.lines += 1;
    }

    usage() {
        return 100 * (this.count / this.limit);
    }

    status() {
        let end = +new Date();
        let elapsed = (end - this.start) / 1000;
        let speed = this.lines / elapsed;
        return `🔑 ${pc.magenta(this.usage().toFixed(2) + '%')}` 
            + ` | chars: ${pc.gray(this.count)} / ${pc.gray(this.limit)}`
            + ` | avg: ${pc.gray(speed.toFixed(2) + ' lines/sec')}`;
    }

}

await main();