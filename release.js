import dotenv from 'dotenv';
import pc from "picocolors";
import fs from 'fs';
import Dictonary from './utils/dict.js';
import CSV from './utils/csv.js';
import progresify from './utils/progress.js';

dotenv.config();

// * cfg
const config = {
    dry: false,
    csv: true,
    dictionary: true,
    folder_in: './resources/Translated/',
    folder_out: './resources/Release/',
};
// * utils
const read = (file) => {
    console.log(pc.cyan("[*] Reading file: " + file));
    return JSON.parse(fs.readFileSync(file, 'utf8'))
};
const write = (file, data) => {
    if (config.dry) {
        console.log(pc.gray('[-] Dry run, do nothing'));
        return;
    } 
    fs.writeFileSync(file, JSON.stringify(data, null, 2)); 
    console.log(pc.cyan("[*] Saved to file: " + file));
}

async function release(target) {
    let input = read(config.folder_in + target);
    let items = input.mSource.mTerms.Array;

    let progress = progresify(items.length);
    let dictionary = new Dictonary(config);
    let csv = new CSV();

    for (let i = 0, lines = 0; i < items.length; i++) {
        let item = items[i];
        let id = item.Term;
        let text = item.Languages.Array[0];

        console.log();
        progress();

        if (!isValid(text)) {
            console.log(pc.gray(`[-] Skipping: ${id}`));
            continue;
        }

        config.csv && csv.add(id, text);

        let translation = process(text, dictionary);
        // update translation
        item.Languages.Array = [ translation ];
        
        console.log(">>", pc.red(text));
        console.log("<<", pc.green(translation));
    }

    write(config.folder_out + target, input);
    dictionary.save();
    config.csv && csv.save('./resources/Sheets/' + target);

    function isValid(text) {
        // let [after, before] = text.split(' [***] ');
        return text.includes("[***]");
    }

    function process(text, dictionary) {
        // let [after, before] = text.split(' [***] ');
        let translation = text.substr(0, text.indexOf(' [***] '));
        
        dictionary.record(translation);

        translation = translation.replaceAll(/і/g, 'i');
        translation = translation.replaceAll(/І/g, 'I');
        translation = translation.replaceAll(/є/g, 'э');
        translation = translation.replaceAll(/Є/g, 'Э');
        translation = translation.replaceAll(/ї/g, 'î');
        translation = translation.replaceAll(/Ї/g, 'Î');
        
        return translation;
    }
}

async function main() {
    let files = {
        dialogues: 'DialoguesLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200--6359132067312534950.json',
        general: 'GeneralLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200-6207927063058028102.json'
    };
    await release(files.dialogues);
    await release(files.general);
}

await main();

// ---- 

// function count(str, char) {
//     let count = 0;
//     for (let i = 0; i < str.length; i++) {
//       if (str[i] === char) count++;
//     }
//     return count;
// }