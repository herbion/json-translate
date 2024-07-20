import fs from 'fs';
import pc from 'picocolors';

const delimiter = "\t";

class CSV {
    constructor(config) {
        this.csv = [
            ['id', 'flag', 'text', 'ref'].join(delimiter)
        ];
    }

    add(id, text) {
        let [after, before] = text.split(' [***] ');
        let fmt = (str) => (str || '').replace(/\n/g, '{newline}');
        let row = [
            id,
            '0', // flag
            fmt(after),
            fmt(before),
        ];
        this.csv.push(row.join(delimiter));
    }

    save(file = "table") {
        fs.writeFileSync(file + '.tsv', this.csv.join('\n'), 'utf8');
        console.log(pc.cyan("[*] TSV saved to file: " + file + '.tsv'));
    }

}

export default CSV;