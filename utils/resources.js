import fs from 'fs';
import pc from 'picocolors';
import { parse, stringify } from 'lossless-json'

const crlf = '\r\n';

class Resources {
    constructor(config) {
        this.config = config;
    }
    read(file, type = "json") {
        console.log(pc.cyan("[*] Reading file: " + file));
        let raw = fs.readFileSync(file, 'utf8');
        return type === "json" ? parse(raw) : raw;
    };
    write(file, data) {
        if (this.config.dry) {
            console.log(pc.gray('[-] Dry run, do nothing'));
            return;
        }
        // file.replace(/\n/g, crlf)
        fs.writeFileSync(file, stringify(data, null, 2)); 
        console.log(pc.cyan("[*] Saved to file: " + file));
    }

}

export default Resources;