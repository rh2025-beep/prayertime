import { readFileSync } from 'fs';

const content = readFileSync('src/App.jsx', 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('modal-overlay')) {
        console.log(`Line ${i+1}: ${lines[i]}`);
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
            console.log(`  Line ${j+1}: ${lines[j]}`);
            if (lines[j].includes('modal-content')) {
                // found modal content
            }
        }
    }
}
