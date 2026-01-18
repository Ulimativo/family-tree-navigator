import { GedcomParser } from './src/lib/gedcom/parser.js';
import fs from 'fs';

const gedcomPath = './data/Ahnen_Raab_Hauptdaten_050421_MFT.ged';
const content = fs.readFileSync(gedcomPath, 'utf8');

const parser = new GedcomParser();
const result = parser.parse(content);

console.log(`Parsed ${result.individuals.length} individuals`);
console.log(`Parsed ${result.families.length} families`);

// Check a sample individual
const sampleIndi = result.individuals[0];
console.log('Sample Individual:', JSON.stringify(sampleIndi, null, 2));

// Check a sample family
const sampleFam = result.families[0];
console.log('Sample Family:', JSON.stringify(sampleFam, null, 2));
