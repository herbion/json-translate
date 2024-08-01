import fs from 'fs';
import pc from 'picocolors';
import Resources from './resources.js';

class PO {

    constructor(config) {
        this.reader = new Resources({});
        this.po = [];
    }

    read(file) {
        let raw = this.reader.read(file, 'po');

        let storage = { 'msgctxt': [], 'msgstr': [] };

        raw.split('\n').forEach(line => {
            if (line.trim() === '') return;
            
            let separator = line.indexOf(' ');
            let key = line.slice(0, separator);
            let payload = JSON.parse(line.slice(separator + 1));

            storage[key].push(payload);
        });
        if (storage['msgctxt'].length !== storage['msgstr'].length) {
            throw new Error("Mismatched msgctxt and msgstr lengths");
        }

        let keys = storage['msgctxt'];
        let values = storage['msgstr'];
        let mapping = {};
        for (let i = 0; i < keys.length; i++) {
            mapping[keys[i]] = values[i].replace(/@newline/g, "\n");
        }
        return mapping;
    }

    add(id, text) {
        // let [after, before] = text.split(' [***] ');
        let fmt = (str) => (str || '').replace(/\n/g, '@newline').replace(/"/g, '\\"');
        // let original = this.original[id.split('\/')[1]] || {}
        
        this.po.push(`msgctxt "${id}"\nmsgstr "${fmt((text))}"\n`);
    }

    save(file = "table") {
let head = `msgid ""
msgstr ""
"MIME-Version: 1.0"
"Content-Type: text/plain; charset=UTF-8"
"Content-Transfer-Encoding: 8bit"
"X-Generator: POEditor.com"
"Project-Id-Version: TODO List"
"Language: cs"
"Plural-Forms: nplurals=2; plural=(n > 1);"
`;
        fs.writeFileSync(file + '.po', head + "\n" + this.po.join('\n'), 'utf8');
        console.log(pc.cyan("[*] PO saved to file: " + file + '.po'));
    }

}

export default PO;