import { readFileSync } from 'fs';

const content = readFileSync('src/App.jsx', 'utf-8');

const regex = /<input[^>]*>/gi;
let match;
const inputs = [];

while ((match = regex.exec(content)) !== null) {
  inputs.push(match[0]);
}

inputs.forEach(input => {
    console.log(input.substring(0, 150));
})
