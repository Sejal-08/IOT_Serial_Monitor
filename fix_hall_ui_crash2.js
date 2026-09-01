const fs = require('fs');

let renderer = fs.readFileSync('renderer.js', 'utf8');

// Find all occurrences of hallOutputMatch
const matches = [...renderer.matchAll(/const hallOutputMatch = line\.match/g)];
console.log('Found ' + matches.length + ' occurrences.');

matches.forEach((m, i) => {
    console.log(`Match ${i} at index ${m.index}`);
    console.log(renderer.substring(m.index - 50, m.index + 100));
});
