import fs from 'fs';
import pc from 'picocolors';
import Resources from './resources.js';

const delimiter = "\t";

class CSV {

    constructor(config) {
        let reader = new Resources({});
        this.actors = reader.read('./resources/Original/actors.json');
        this.original = reader.read('./resources/Original/dialogues.en.json')
            .reduce((dict, item) => (dict[item.id] = item, dict), {});
        this.csv = [
            ['id', 'flag', 'text', 'ref', 'original', 'actor', 'input', 'output'].join(delimiter)
        ];
    }

    add(id, text) {
        let [after, before] = text.split(' [***] ');
        let fmt = (str) => (str || '').replace(/\n/g, '{newline}');
        let original = this.original[id.split('\/')[1]] || {}

        let row = [
            id,
            '0', // flag
            fmt(after),
            fmt(before),
            fmt(original.text),
            this.actors[original.actor] || '-1',
            original.input,
            original.output
        ];
        this.csv.push(row.join(delimiter));
    }

    save(file = "table") {
        fs.writeFileSync(file + '.tsv', this.csv.join('\n'), 'utf8');
        console.log(pc.cyan("[*] TSV saved to file: " + file + '.tsv'));
    }

}

export default CSV;