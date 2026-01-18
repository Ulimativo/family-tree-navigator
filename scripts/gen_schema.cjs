const fs = require('fs');

function parseCSV(content) {
    const lines = content.split('\n');
    const result = {};

    // Simple CSV parser that handles quotes
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                cells.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        cells.push(current);

        if (cells.length >= 5) {
            const tag = cells[0].trim();
            result[tag] = {
                label: cells[2].trim(),
                desc_de: cells[3].trim(),
                desc_en: cells[4].trim()
            };
        }
    }
    return result;
}

const csv = fs.readFileSync('data/gedcom_attribute_table.csv', 'utf8');
const metadata = parseCSV(csv);

const output = `/**
 * GEDCOM Tag Metadata Registry
 * Generated from data/gedcom_attribute_table.csv
 */

export const TAG_METADATA = ${JSON.stringify(metadata, null, 4)};

/**
 * Retrieves metadata for a GEDCOM tag.
 * @param {string} tag - The GEDCOM tag (e.g., 'BIRT', 'DEAT')
 * @param {string} locale - 'en' or 'de' (default 'en')
 * @returns {Object} { label, description }
 */
export function getTagInfo(tag, locale = 'en') {
    const info = TAG_METADATA[tag];
    if (!info) return { label: tag, description: '' };
    
    return {
        label: info.label || tag,
        description: locale === 'de' ? info.desc_de : info.desc_en
    };
}
`;

fs.writeFileSync('src/lib/gedcom/schema.js', output);
console.log('schema.js generated successfully.');
