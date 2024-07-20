import dotenv from 'dotenv';
import pc from "picocolors";
import fs from 'fs';
import Dictonary from './utils/dict.js';
import CSV from './utils/csv.js';
import Resouces from './utils/resources.js';
import progresify from './utils/progress.js';
import minimist from 'minimist'

dotenv.config();

var argv = minimist(process.argv.slice(2));

// * cfg
const config = {
    dry: argv.dry || false,
    csv: argv.csv || false,
    dictionary: argv.dictionary || false,
    folder_in: './resources/Staging/',
    folder_out: './resources/Release/',
};
// * utils
let resources = new Resouces(config);

async function release(target) {
    let input = resources.read(config.folder_in + target);
    let items = input.mSource.mTerms.Array;

    let progress = progresify(items.length);
    let dictionary = new Dictonary(config);
    let csv = new CSV();

    for (let i = 0; i < items.length; i++) {
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

    resources.write(config.folder_out + target, input);
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
    for (let resource of argv['_']) {
        await release(resource);
    }
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