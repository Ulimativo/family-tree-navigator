import { GedcomParser } from '../src/lib/gedcom/parser.js';
import { GedcomExporter } from '../src/lib/gedcom/exporter.js';
import fs from 'fs';

const testGedcom = `0 HEAD
1 GEDC
2 VERS 7.0
1 CHAR UTF-8
0 @I1@ INDI
1 NAME John /Doe/
2 GIVN John
2 SURN Doe
1 SEX M
1 BIRT
2 DATE 1 JAN 1900
2 PLAC Berlin, Germany
1 DSCR Tall and thin
1 OCCU Baker
1 ASSO @I2@
2 ROLE Friend
0 @I2@ INDI
1 NAME Jane /Smith/
1 SEX F
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1 JAN 1925
0 TRLR`;

function test() {
    const parser = new GedcomParser();
    const result = parser.parse(testGedcom);

    console.log('--- Parsed Result (Partial) ---');
    const indi1 = result.individuals.find(i => i.id === '@I1@');
    console.log('Names:', JSON.stringify(indi1.names, null, 2));
    console.log('Attributes:', JSON.stringify(indi1.attributes, null, 2));
    console.log('Associations:', JSON.stringify(indi1.associations, null, 2));

    const exporter = new GedcomExporter();
    const exported = exporter.export(result);
    // console.log('--- Exported GEDCOM ---');
    // console.log(exported);

    if (exported.includes('DSCR Tall and thin') && exported.includes('ASSO @I2@')) {
        console.log('✅ Round-trip verification successful for extended attributes.');
    } else {
        console.log('❌ Round-trip verification failed.');
        process.exit(1);
    }
}

test();
