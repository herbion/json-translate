import pc from 'picocolors';

export default (total) => {
    let i = 1;
    return () => {
        let completion = (100 * i / total).toFixed(2);
        console.log(`〰️ ${pc.yellow(completion + '%')} | lines: ${pc.gray(i)} / ${pc.gray(total)}`);
        i++;
    }
};