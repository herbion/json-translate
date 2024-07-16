import dotenv from 'dotenv';
import pc from "picocolors";
import fs from 'fs';

dotenv.config();

let files = {
    dialogues: 'DialoguesLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200--6359132067312534950.json',
    general: 'GeneralLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200-6207927063058028102.json'
};
// * cfg
const config = {
    dry: false,
    folder_in: './resources/Translated/',
    folder_out: './resources/Release/',
    // target: 'DialoguesLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200--6359132067312534950.json',
    target: files.general,
    // ---
    batch_size: 10,
};
// * utils
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, data) => config.dry || fs.writeFileSync(file, JSON.stringify(data, null, 2));

async function main() {
    let input = read(config.folder_in + config.target);
    let items = input.mSource.mTerms.Array;

    let progress = (() => {
        let i = 1;
        let total = items.length;
        return () => {
            let completion = (100 * i / total).toFixed(2);
            console.log(`〰️ ${pc.yellow(completion + '%')} | lines: ${pc.gray(i)} / ${pc.gray(total)}`);
            i++;
        }
    })();

    for (let i = 0, lines = 0; i < items.length; i++) {
        let item = items[i];
        let id = item.Term;
        let text = item.Languages.Array[0];

        console.log();
        progress();

        if (!text.includes("[***]")) {
            console.log(pc.gray(`[-] Skipping: ${id}`));
            continue;
        }

        let translation = process(text);
        // update translation
        item.Languages.Array = [ translation ];

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
    console.log(pc.cyan("[*] Translation saved to file: " + config.folder_out + config.target));

    function process(text) {

        // let [after, before] = text.split(' [***] ');

        // if (!/[а-яА-ЯЁё]/.test(before)) {
        //     item.Languages.Array = [ before + ' [***] ' + before ];
        //     console.log(pc.yellow(before), pc.gray(after));
        //     continue;
        // } else {
        //     continue;
        // }

        // let [after, before] = text.split(' [***] ');
        let translation = text.substr(0, text.indexOf(' [***] '));

        translation = translation.replaceAll(/і/g, 'i');
        translation = translation.replaceAll(/І/g, 'I');
        translation = translation.replaceAll(/є/g, 'э');
        translation = translation.replaceAll(/Є/g, 'Э');
        translation = translation.replaceAll(/ї/g, 'î');
        translation = translation.replaceAll(/Ї/g, 'Î');

        return translation;
    }
}

await main();