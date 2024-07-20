import fs from 'fs';

class Dictonary {
    constructor(config) {
        this.segmenter = new Intl.Segmenter([], { granularity: 'word' });
        this.dictionary = new Map();
        this.config = config;
    }

    record(translation) {
        if (!this.config.dictionary) return;

        let dict = this.dictionary;
        this.split(translation)
            .map(word => word.toLowerCase())
            .forEach(word => {
                let count = dict.get(word) || 0;
                dict.set(word, count + 1);
            });
    }
    
    split(text) {
        if (!this.config.dictionary) return [];

        return [...this.segmenter.segment(text)]
            .filter(token => token.isWordLike)
            .map(token => token.segment);
    }

    save(filename = "./words.txt") {
        if (!this.config.dictionary) return;
    
        console.log("Updated dictionary")
        let sorted = new Map([...this.dictionary.entries()].sort((a, b) => b[1] - a[1]));
        fs.writeFileSync(filename, [...sorted.entries()].join("\n"), 'utf8')    
    }
}

export default Dictonary;