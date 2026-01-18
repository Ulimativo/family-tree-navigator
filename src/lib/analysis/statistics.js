
/**
 * Core Statistics Engine for Family Tree Data
 * Computes metrics and insights from the GEDCOM data structure.
 */

// Helper: Parse a GEDCOM date string to get a year (rough approximation)
export const getYear = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
};

// Helper: Calculate age
const calculateAge = (birthDate, deathDate) => {
    const bYear = getYear(birthDate);
    const dYear = getYear(deathDate);
    if (bYear && dYear) return dYear - bYear;
    return null;
};

// Helper: Clean surname
const getSurname = (name) => {
    if (!name) return 'Unknown';
    const match = name.match(/\/(.*?)\//); // GEDCOM standard /Surname/
    if (match) return match[1].trim();

    // Fallback: If no slashes, take the last word as the surname
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) return parts[parts.length - 1];

    return name.trim() || 'Unknown';
};

export const computeStatistics = (data) => {
    if (!data || !data.individuals) return null;

    const { individuals, families } = data;
    const stats = {
        counts: {
            individuals: individuals.length,
            families: families.length,
        },
        gender: {
            male: 0,
            female: 0,
            unknown: 0
        },
        living: {
            living: 0,
            deceased: 0
        },
        longevity: {
            average: 0,
            oldest: { name: '', age: 0 }
        },
        fertility: {
            averageChildren: 0,
            mostChildren: { familyId: '', count: 0, parents: [] }
        },
        timeline: {
            earliestBirth: { year: 9999, name: '' },
            latestBirth: { year: -9999, name: '' }
        },
        surnames: {} // Map of surname -> count
    };

    let totalAge = 0;
    let ageCount = 0;
    let totalChildren = 0;
    let childCountFamilies = 0;

    // --- Individual Analysis ---
    individuals.forEach(person => {
        const primaryName = person.names?.[0]?.value || '';

        // Gender
        if (person.sex === 'M') stats.gender.male++;
        else if (person.sex === 'F') stats.gender.female++;
        else stats.gender.unknown++;

        // Living Status (Simple heuristic: has DEAT tag?)
        const deathEvent = person.events?.find(e => e.tag === 'DEAT');
        const birthEvent = person.events?.find(e => e.tag === 'BIRT');

        if (deathEvent) {
            stats.living.deceased++;
            // Longevity
            if (birthEvent) {
                const age = calculateAge(birthEvent.date, deathEvent.date);
                if (age !== null && age >= 0 && age < 120) { // Basic sanity check
                    totalAge += age;
                    ageCount++;
                    if (age > stats.longevity.oldest.age) {
                        stats.longevity.oldest = { name: primaryName.replace(/\//g, ''), age };
                    }
                }
            }
        } else {
            stats.living.living++;
        }

        // Timeline (Births)
        if (birthEvent && birthEvent.date) {
            const bYear = getYear(birthEvent.date);
            if (bYear) {
                if (bYear < stats.timeline.earliestBirth.year) {
                    stats.timeline.earliestBirth = { year: bYear, name: primaryName.replace(/\//g, '') };
                }
                if (bYear > stats.timeline.latestBirth.year) {
                    stats.timeline.latestBirth = { year: bYear, name: primaryName.replace(/\//g, '') };
                }
            }
        }

        // Surnames
        const surname = getSurname(primaryName);
        stats.surnames[surname] = (stats.surnames[surname] || 0) + 1;
    });

    // --- Family Analysis ---
    families.forEach(fam => {
        const childrenCount = fam.children ? fam.children.length : 0;
        if (childrenCount > 0) {
            totalChildren += childrenCount;
            childCountFamilies++;

            if (childrenCount > stats.fertility.mostChildren.count) {
                const husbandIndi = individuals.find(i => i.id === fam.husband);
                const wifeIndi = individuals.find(i => i.id === fam.wife);

                const husbandName = husbandIndi?.names?.[0]?.value?.replace(/\//g, '') || 'Unknown';
                const wifeName = wifeIndi?.names?.[0]?.value?.replace(/\//g, '') || 'Unknown';

                stats.fertility.mostChildren = {
                    count: childrenCount,
                    parents: [husbandName, wifeName].filter(n => n !== 'Unknown')
                };
            }
        }
    });

    // --- Averages & Final Polish ---
    if (ageCount > 0) stats.longevity.average = Math.round(totalAge / ageCount);
    if (childCountFamilies > 0) stats.fertility.averageChildren = (totalChildren / childCountFamilies).toFixed(1);

    // Top Surnames (Sort and top 5)
    stats.topSurnames = Object.entries(stats.surnames)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    return stats;
};

export const calculateTreeDepth = (data) => {
    // A simplified depth calculation (longest chain)
    // This is computationally expensive for huge trees, so we use a memoized recursive approach
    // or just a simple traversal if the tree is small.
    // For MVP: We will calculate "Max Generations" by looking at the max difference in birth years / 25?
    // Or better: Max lineage depth from the focal person.

    // For now, let's keep it simple and efficient:
    // We already have 'individuals'. 
    // We can try to chart the generation spread.
    return 0; // Placeholder for now - depth is complex in graph with multiple roots
};
