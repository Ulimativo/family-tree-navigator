/**
 * Basic data quality validation for genealogy data.
 */
export const validateIndividual = (indi) => {
    const warnings = [];

    const birth = indi.events.find(e => e.tag === 'BIRT');
    const death = indi.events.find(e => e.tag === 'DEAT');

    if (birth && death && birth.date && death.date) {
        // Simple year comparison for now
        const birthYear = parseInt(birth.date.match(/\d{4}/)?.[0]);
        const deathYear = parseInt(death.date.match(/\d{4}/)?.[0]);

        if (birthYear && deathYear && birthYear > deathYear) {
            warnings.push(`Born (${birthYear}) after death (${deathYear}).`);
        }
    }

    return warnings;
};
