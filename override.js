import dotenv from 'dotenv';
import pc from "picocolors";
import fs from 'fs';

dotenv.config();

// 'GeneralLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200-6207927063058028102.json'
// 'DialoguesLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200--6359132067312534950.json'

// * cfg
const config = {
    dry: true,
    folder_in: './resources/Override/',
    folder_out: './resources/Translated/',
    // target: 'DialoguesLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200--6359132067312534950.json',
    // target: 'GeneralLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200-6207927063058028102.json',
    target: 'GeneralLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200-6207927063058028102.json.tsv',
    // ---
    batch_size: 10,
};
// * utils
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, data) => config.dry || fs.writeFileSync(file, JSON.stringify(data, null, 2));

async function main() {
    let tsv = fs.readFileSync(config.folder_in + config.target, 'utf8')
    let overrides = tsv
        .split('\n')
        .map(row => {
            let [id, flag, after, before] = row
                .replaceAll('{newline}', '\n')
                .split('\t');
            return { id, flag, after, before };
        })
        .filter(({flag}) => flag == 1);

    overrides.shift(); // remove header
    console.log(overrides.slice(0, 50));
    return;
    
    
    const delimiter = "\t";

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

    
    let csv = [
        ['id', 'text', 'ref', 'flag'].join(delimiter)
    ];

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let id = item.Term
        let text = item.Languages.Array[0];
        let [after, before] = text.split(' [***] ');

        progress();

        let fmt = (str) => (str || '').replace(/\n/g, '{newline}');
        let row = [
            id,
            fmt(after),
            fmt(before),
            0 // flag
        ];
        csv.push(row.join(delimiter));
    }

    fs.writeFileSync(config.folder_out + config.target + '.tsv', csv.join('\n'));

    console.log(pc.cyan("[*] Translation saved to file"));
}

await main();