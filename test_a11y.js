import { readFileSync } from 'fs';

const content = readFileSync('src/App.jsx', 'utf-8');

const regex = /<button[^>]*>/gi;
let match;
const buttons = [];

while ((match = regex.exec(content)) !== null) {
  buttons.push(match[0]);
}

const noAriaLabels = buttons.filter(btn => !btn.toLowerCase().includes('aria-label'));
console.log(`Found ${buttons.length} buttons, ${noAriaLabels.length} without aria-label.`);

noAriaLabels.forEach(btn => {
    console.log(btn.substring(0, 150));
})
