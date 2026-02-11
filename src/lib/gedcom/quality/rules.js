/**
 * GEDCOM Validation Rules
 * Defines all validation rules that check GEDCOM data quality
 */

import { ValidationIssue } from './validator.js';

/**
 * Helper function to parse GEDCOM date format
 * Returns { year, month, day, dateString } or null if invalid
 */
function parseGedcomDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    dateStr = dateStr.trim();
    if (!dateStr) return null;

    // Basic GEDCOM date patterns:
    // 1 JAN 2000
    // JAN 2000
    // 2000
    // ABT 1 JAN 2000
    // BET 1 JAN 2000 AND 2 JAN 2000
    // etc.

    const monthMap = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
        'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    };

    // Remove qualifiers like ABT, BET, AND, FROM, TO, etc.
    let cleanDate = dateStr.replace(/^(ABT|BET|FROM|TO|AFT|BEF|CAL|EST|EXACt)\s+/i, '');
    if (cleanDate.includes('AND')) {
        cleanDate = cleanDate.split('AND')[0].trim();
    }

    // Try to extract year (4 digits)
    const yearMatch = cleanDate.match(/\b(\d{4})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;

    // Try to extract month
    let month = null;
    for (const [monthName, monthNum] of Object.entries(monthMap)) {
        if (cleanDate.toUpperCase().includes(monthName)) {
            month = monthNum;
            break;
        }
    }

    // Try to extract day
    const dayMatch = cleanDate.match(/\b(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)/i);
    const day = dayMatch ? parseInt(dayMatch[1]) : null;

    return {
        year,
        month,
        day,
        dateString: dateStr,
        isComplete: year && month && day
    };
}

/**
 * Helper to get person name for display
 */
function getPersonName(individual) {
    if (!individual) return null;
    if (individual.names && individual.names.length > 0) {
        const primaryName = individual.names[0];
        if (primaryName.value) return primaryName.value;
        if (primaryName.given || primaryName.surname) {
            return `${primaryName.given || ''} ${primaryName.surname || ''}`.trim();
        }
    }
    return null;
}

/**
 * Helper to find individual by ID
 */
function findIndividual(project, id) {
    if (!project || !project.individuals) return null;
    return project.individuals.find(i => i.id === id);
}

/**
 * Helper to find family by ID
 */
function findFamily(project, id) {
    if (!project || !project.families) return null;
    return project.families.find(f => f.id === id);
}

/**
 * Validation Rule class
 */
class ValidationRule {
    constructor(config) {
        this.id = config.id; // Unique rule identifier
        this.severity = config.severity; // 'critical' | 'warning' | 'quality' | 'suggestion'
        this.category = config.category; // 'structural' | 'temporal' | 'formatting' | 'completeness'
        this.title = config.title;
        this.description = config.description;
        this.appliesTo = config.appliesTo || ['individual', 'family']; // Entity types this rule validates
        this.validate = config.validate; // Function(project): ValidationIssue[]
        this.validateEntity = config.validateEntity || (() => []); // Function(entity, type, project): ValidationIssue[]
        this.autoFixable = config.autoFixable || false;
        this.batchFixable = config.batchFixable || false;
    }
}

// ===== CORE VALIDATION RULES (Phase 1) =====

export const VALIDATION_RULES = [
    // 1. DUPLICATE_ID (Critical)
    new ValidationRule({
        id: 'DUPLICATE_ID',
        severity: 'critical',
        category: 'structural',
        title: 'Duplicate ID',
        description: 'Multiple entities share the same ID, which violates GEDCOM uniqueness constraint',
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            const idMap = new Map();
            const allEntities = [
                ...(project.individuals || []).map(e => ({ ...e, type: 'individual' })),
                ...(project.families || []).map(e => ({ ...e, type: 'family' })),
                ...(project.sources || []).map(e => ({ ...e, type: 'source' })),
                ...(project.media || []).map(e => ({ ...e, type: 'media' })),
            ];

            for (const entity of allEntities) {
                if (!entity.id) continue;
                if (!idMap.has(entity.id)) {
                    idMap.set(entity.id, []);
                }
                idMap.get(entity.id).push(entity);
            }

            // Find duplicates
            for (const [id, entities] of idMap) {
                if (entities.length > 1) {
                    for (const entity of entities) {
                        const name = entity.type === 'individual' ? getPersonName(entity) : entity.name;
                        issues.push(new ValidationIssue({
                            id: `${id}_DUPLICATE_ID_${entity.type}`,
                            severity: 'critical',
                            category: 'structural',
                            ruleId: 'DUPLICATE_ID',
                            title: 'Duplicate ID',
                            message: `ID "${id}" appears ${entities.length} times in the file`,
                            entityType: entity.type,
                            entityId: id,
                            entityName: name,
                            autoFixable: false,
                            batchFixable: false,
                            affectedField: 'id',
                            metadata: { duplicateCount: entities.length }
                        }));
                    }
                }
            }

            return issues;
        }
    }),

    // 2. INVALID_ID_FORMAT (Critical)
    new ValidationRule({
        id: 'INVALID_ID_FORMAT',
        severity: 'critical',
        category: 'structural',
        title: 'Invalid ID Format',
        description: 'ID does not follow GEDCOM format (@I123@ or @F456@)',
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            const idPattern = /^@[IFSMRU]\d+@$/;

            const checkEntity = (entity, type) => {
                if (entity.id && !idPattern.test(entity.id)) {
                    const name = type === 'individual' ? getPersonName(entity) : entity.name;
                    issues.push(new ValidationIssue({
                        id: `${entity.id || 'UNKNOWN'}_INVALID_ID_FORMAT`,
                        severity: 'critical',
                        category: 'structural',
                        ruleId: 'INVALID_ID_FORMAT',
                        title: 'Invalid ID Format',
                        message: `ID "${entity.id}" does not follow GEDCOM format (expected @X123@)`,
                        entityType: type,
                        entityId: entity.id,
                        entityName: name,
                        autoFixable: false,
                        batchFixable: false,
                        affectedField: 'id',
                        metadata: { invalidId: entity.id }
                    }));
                }
            };

            (project.individuals || []).forEach(i => checkEntity(i, 'individual'));
            (project.families || []).forEach(f => checkEntity(f, 'family'));

            return issues;
        }
    }),

    // 3. BROKEN_FAMILY_REF (Critical)
    new ValidationRule({
        id: 'BROKEN_FAMILY_REF',
        severity: 'critical',
        category: 'structural',
        title: 'Broken Family Reference',
        description: 'Individual references a non-existent family',
        validate: (project) => {
            const issues = [];
            if (!project || !project.individuals) return issues;

            const familyIds = new Set((project.families || []).map(f => f.id));

            project.individuals.forEach(individual => {
                // Check familyAsChild
                if (individual.familyAsChild && !familyIds.has(individual.familyAsChild)) {
                    issues.push(new ValidationIssue({
                        id: `${individual.id}_BROKEN_FAMILY_REF_CHILD`,
                        severity: 'critical',
                        category: 'structural',
                        ruleId: 'BROKEN_FAMILY_REF',
                        title: 'Broken Family Reference',
                        message: `Individual references non-existent family "${individual.familyAsChild}" as birth family`,
                        entityType: 'individual',
                        entityId: individual.id,
                        entityName: getPersonName(individual),
                        autoFixable: false,
                        batchFixable: false,
                        affectedField: 'familyAsChild',
                        metadata: { referencedId: individual.familyAsChild }
                    }));
                }

                // Check familiesAsSpouse
                (individual.familiesAsSpouse || []).forEach((famId, idx) => {
                    if (!familyIds.has(famId)) {
                        issues.push(new ValidationIssue({
                            id: `${individual.id}_BROKEN_FAMILY_REF_SPOUSE_${idx}`,
                            severity: 'critical',
                            category: 'structural',
                            ruleId: 'BROKEN_FAMILY_REF',
                            title: 'Broken Family Reference',
                            message: `Individual references non-existent family "${famId}" as spouse family`,
                            entityType: 'individual',
                            entityId: individual.id,
                            entityName: getPersonName(individual),
                            autoFixable: false,
                            batchFixable: false,
                            affectedField: 'familiesAsSpouse',
                            metadata: { referencedId: famId, index: idx }
                        }));
                    }
                });
            });

            return issues;
        }
    }),

    // 4. MISSING_NAME (Warning)
    new ValidationRule({
        id: 'MISSING_NAME',
        severity: 'warning',
        category: 'completeness',
        title: 'Missing Name',
        description: 'Individual has no name records',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project || !project.individuals) return issues;

            project.individuals.forEach(individual => {
                if (!individual.names || individual.names.length === 0) {
                    issues.push(new ValidationIssue({
                        id: `${individual.id}_MISSING_NAME`,
                        severity: 'warning',
                        category: 'completeness',
                        ruleId: 'MISSING_NAME',
                        title: 'Missing Name',
                        message: `Individual ${individual.id} has no name records`,
                        entityType: 'individual',
                        entityId: individual.id,
                        entityName: null,
                        autoFixable: true,
                        batchFixable: false,
                        affectedField: 'names',
                        metadata: {}
                    }));
                }
            });

            return issues;
        }
    }),

    // 5. EMPTY_NAME_VALUE (Warning)
    new ValidationRule({
        id: 'EMPTY_NAME_VALUE',
        severity: 'warning',
        category: 'formatting',
        title: 'Empty Name Value',
        description: 'Individual has a name record with empty or whitespace-only value',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project || !project.individuals) return issues;

            project.individuals.forEach(individual => {
                (individual.names || []).forEach((name, nameIdx) => {
                    if (!name.value || (typeof name.value === 'string' && !name.value.trim())) {
                        issues.push(new ValidationIssue({
                            id: `${individual.id}_EMPTY_NAME_VALUE_${nameIdx}`,
                            severity: 'warning',
                            category: 'formatting',
                            ruleId: 'EMPTY_NAME_VALUE',
                            title: 'Empty Name Value',
                            message: `Individual has an empty name record at index ${nameIdx}`,
                            entityType: 'individual',
                            entityId: individual.id,
                            entityName: getPersonName(individual),
                            autoFixable: true,
                            batchFixable: true,
                            affectedField: 'names',
                            metadata: { nameIndex: nameIdx, currentValue: name.value }
                        }));
                    }
                });
            });

            return issues;
        }
    }),

    // 6. BIRTH_AFTER_DEATH (Quality)
    new ValidationRule({
        id: 'BIRTH_AFTER_DEATH',
        severity: 'quality',
        category: 'temporal',
        title: 'Birth After Death',
        description: 'Birth date is after death date',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project || !project.individuals) return issues;

            project.individuals.forEach(individual => {
                const events = individual.events || [];
                let birthDate = null;
                let deathDate = null;

                events.forEach(event => {
                    if (event.tag === 'BIRT' && event.date) {
                        birthDate = parseGedcomDate(event.date);
                    }
                    if (event.tag === 'DEAT' && event.date) {
                        deathDate = parseGedcomDate(event.date);
                    }
                });

                // Only compare if both have years
                if (birthDate && deathDate && birthDate.year && deathDate.year) {
                    if (birthDate.year > deathDate.year) {
                        issues.push(new ValidationIssue({
                            id: `${individual.id}_BIRTH_AFTER_DEATH`,
                            severity: 'quality',
                            category: 'temporal',
                            ruleId: 'BIRTH_AFTER_DEATH',
                            title: 'Birth After Death',
                            message: `${getPersonName(individual)} has birth year (${birthDate.year}) after death year (${deathDate.year})`,
                            entityType: 'individual',
                            entityId: individual.id,
                            entityName: getPersonName(individual),
                            autoFixable: true,
                            batchFixable: false,
                            affectedField: 'events',
                            metadata: { birthYear: birthDate.year, deathYear: deathDate.year }
                        }));
                    } else if (birthDate.year === deathDate.year && birthDate.month && deathDate.month) {
                        if (birthDate.month > deathDate.month) {
                            issues.push(new ValidationIssue({
                                id: `${individual.id}_BIRTH_AFTER_DEATH`,
                                severity: 'quality',
                                category: 'temporal',
                                ruleId: 'BIRTH_AFTER_DEATH',
                                title: 'Birth After Death',
                                message: `${getPersonName(individual)} has birth date after death date in same year`,
                                entityType: 'individual',
                                entityId: individual.id,
                                entityName: getPersonName(individual),
                                autoFixable: true,
                                batchFixable: false,
                                affectedField: 'events',
                                metadata: { birthYear: birthDate.year, deathYear: deathDate.year }
                            }));
                        }
                    }
                }
            });

            return issues;
        }
    }),

    // 7. MISSING_BIRTH (Quality)
    new ValidationRule({
        id: 'MISSING_BIRTH',
        severity: 'quality',
        category: 'completeness',
        title: 'Missing Birth Event',
        description: 'Individual has a death date but no birth date',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project || !project.individuals) return issues;

            project.individuals.forEach(individual => {
                const events = individual.events || [];
                let hasBirth = false;
                let hasDeath = false;

                events.forEach(event => {
                    if (event.tag === 'BIRT') hasBirth = true;
                    if (event.tag === 'DEAT') hasDeath = true;
                });

                if (!hasBirth && hasDeath) {
                    issues.push(new ValidationIssue({
                        id: `${individual.id}_MISSING_BIRTH`,
                        severity: 'quality',
                        category: 'completeness',
                        ruleId: 'MISSING_BIRTH',
                        title: 'Missing Birth Event',
                        message: `${getPersonName(individual)} has death recorded but no birth date`,
                        entityType: 'individual',
                        entityId: individual.id,
                        entityName: getPersonName(individual),
                        autoFixable: true,
                        batchFixable: false,
                        affectedField: 'events',
                        metadata: {}
                    }));
                }
            });

            return issues;
        }
    }),

    // 8. MISSING_DEATH_FOR_OLD (Quality)
    new ValidationRule({
        id: 'MISSING_DEATH_FOR_OLD',
        severity: 'quality',
        category: 'completeness',
        title: 'Missing Death for Old Individual',
        description: 'Individual born >120 years ago but has no death date',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project || !project.individuals) return issues;

            const currentYear = new Date().getFullYear();

            project.individuals.forEach(individual => {
                const events = individual.events || [];
                let birthYear = null;
                let hasDeath = false;

                events.forEach(event => {
                    if (event.tag === 'BIRT' && event.date) {
                        const parsed = parseGedcomDate(event.date);
                        if (parsed && parsed.year) birthYear = parsed.year;
                    }
                    if (event.tag === 'DEAT') hasDeath = true;
                });

                if (birthYear && !hasDeath && (currentYear - birthYear) > 120) {
                    issues.push(new ValidationIssue({
                        id: `${individual.id}_MISSING_DEATH_FOR_OLD`,
                        severity: 'quality',
                        category: 'completeness',
                        ruleId: 'MISSING_DEATH_FOR_OLD',
                        title: 'Missing Death for Old Individual',
                        message: `${getPersonName(individual)} was born in ${birthYear} (${currentYear - birthYear} years ago) but has no death date`,
                        entityType: 'individual',
                        entityId: individual.id,
                        entityName: getPersonName(individual),
                        autoFixable: false,
                        batchFixable: false,
                        affectedField: 'events',
                        metadata: { birthYear, ageYears: currentYear - birthYear }
                    }));
                }
            });

            return issues;
        }
    }),

    // 9. NON_STANDARD_DATE (Suggestion)
    new ValidationRule({
        id: 'NON_STANDARD_DATE',
        severity: 'suggestion',
        category: 'formatting',
        title: 'Non-Standard Date Format',
        description: 'Date does not match standard GEDCOM format (D MMM YYYY)',
        appliesTo: ['individual', 'family'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            const standardDatePattern = /^\d{1,2}\s(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s\d{4}$/i;

            const checkEvents = (events, entityId, entityType, entityName) => {
                (events || []).forEach((event, eventIdx) => {
                    if (event.date && typeof event.date === 'string') {
                        const trimmedDate = event.date.trim();
                        // Check if it looks like a date but doesn't match standard format
                        if (trimmedDate && !standardDatePattern.test(trimmedDate) && trimmedDate.length > 2) {
                            issues.push(new ValidationIssue({
                                id: `${entityId}_NON_STANDARD_DATE_${event.tag}_${eventIdx}`,
                                severity: 'suggestion',
                                category: 'formatting',
                                ruleId: 'NON_STANDARD_DATE',
                                title: 'Non-Standard Date Format',
                                message: `Event ${event.tag} has non-standard date format: "${trimmedDate}"`,
                                entityType,
                                entityId,
                                entityName,
                                autoFixable: true,
                                batchFixable: false,
                                affectedField: 'events',
                                metadata: { currentDate: trimmedDate, tag: event.tag, eventIndex: eventIdx }
                            }));
                        }
                    }
                });
            };

            (project.individuals || []).forEach(i => {
                checkEvents(i.events, i.id, 'individual', getPersonName(i));
            });
            (project.families || []).forEach(f => {
                checkEvents(f.events, f.id, 'family', f.name || f.id);
            });

            return issues;
        }
    }),

    // 10. WHITESPACE_ONLY (Suggestion)
    new ValidationRule({
        id: 'WHITESPACE_ONLY',
        severity: 'suggestion',
        category: 'formatting',
        title: 'Whitespace-Only Field',
        description: 'Field contains only whitespace and should be empty or removed',
        appliesTo: ['individual', 'family'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            const checkString = (value, fieldName, entityId, entityType, entityName) => {
                if (typeof value === 'string' && value.length > 0 && !value.trim()) {
                    return new ValidationIssue({
                        id: `${entityId}_WHITESPACE_ONLY_${fieldName}`,
                        severity: 'suggestion',
                        category: 'formatting',
                        ruleId: 'WHITESPACE_ONLY',
                        title: 'Whitespace-Only Field',
                        message: `${fieldName} contains only whitespace`,
                        entityType,
                        entityId,
                        entityName,
                        autoFixable: true,
                        batchFixable: true,
                        affectedField: fieldName,
                        metadata: { fieldName }
                    });
                }
                return null;
            };

            (project.individuals || []).forEach(individual => {
                const name = getPersonName(individual);
                individual.notes?.forEach((note, idx) => {
                    const issue = checkString(note, `notes[${idx}]`, individual.id, 'individual', name);
                    if (issue) issues.push(issue);
                });
            });

            (project.families || []).forEach(family => {
                family.notes?.forEach((note, idx) => {
                    const issue = checkString(note, `notes[${idx}]`, family.id, 'family', null);
                    if (issue) issues.push(issue);
                });
            });

            return issues;
        }
    }),

    // ===== ADDITIONAL VALIDATION RULES (Phase 4) =====

    // 11. ORPHANED_INDIVIDUAL (Warning)
    new ValidationRule({
        id: 'ORPHANED_INDIVIDUAL',
        severity: 'warning',
        category: 'structural',
        title: 'Orphaned Individual',
        description: 'Individual has no family relationships (not linked to any family)',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project || !project.individuals) return issues;

            project.individuals.forEach(individual => {
                const hasFamily = individual.familyAsChild || individual.familiesAsSpouse?.length > 0;
                if (!hasFamily && project.individuals.length > 1) {
                    issues.push(new ValidationIssue({
                        id: `${individual.id}_ORPHANED_INDIVIDUAL`,
                        severity: 'warning',
                        category: 'structural',
                        ruleId: 'ORPHANED_INDIVIDUAL',
                        title: 'Orphaned Individual',
                        message: `${getPersonName(individual)} has no family relationships`,
                        entityType: 'individual',
                        entityId: individual.id,
                        entityName: getPersonName(individual),
                        autoFixable: false,
                        batchFixable: false,
                        affectedField: 'familyAsChild, familiesAsSpouse',
                        metadata: {}
                    }));
                }
            });

            return issues;
        }
    }),

    // 12. DUPLICATE_FAMILY_CHILD (Warning)
    new ValidationRule({
        id: 'DUPLICATE_FAMILY_CHILD',
        severity: 'warning',
        category: 'structural',
        title: 'Duplicate Child in Family',
        description: 'Same individual appears multiple times in a family\'s children list',
        appliesTo: ['family'],
        validate: (project) => {
            const issues = [];
            if (!project || !project.families) return issues;

            project.families.forEach(family => {
                const childIds = family.children || [];
                const seen = new Set();
                const duplicates = new Set();

                childIds.forEach(childId => {
                    if (seen.has(childId)) {
                        duplicates.add(childId);
                    }
                    seen.add(childId);
                });

                duplicates.forEach(childId => {
                    const child = findIndividual(project, childId);
                    issues.push(new ValidationIssue({
                        id: `${family.id}_DUPLICATE_FAMILY_CHILD_${childId}`,
                        severity: 'warning',
                        category: 'structural',
                        ruleId: 'DUPLICATE_FAMILY_CHILD',
                        title: 'Duplicate Child in Family',
                        message: `${getPersonName(child)} appears multiple times in family's children list`,
                        entityType: 'family',
                        entityId: family.id,
                        entityName: null,
                        autoFixable: true,
                        batchFixable: true,
                        affectedField: 'children',
                        metadata: { childId, duplicateCount: childIds.filter(c => c === childId).length }
                    }));
                });
            });

            return issues;
        }
    }),

    // 13. CHILD_BEFORE_PARENT (Quality)
    new ValidationRule({
        id: 'CHILD_BEFORE_PARENT',
        severity: 'quality',
        category: 'temporal',
        title: 'Child Born Before Parent',
        description: 'Child\'s birth year is before parent\'s birth year',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            project.individuals?.forEach(child => {
                const events = child.events || [];
                let childBirthYear = null;

                events.forEach(event => {
                    if (event.tag === 'BIRT' && event.date) {
                        const parsed = parseGedcomDate(event.date);
                        if (parsed && parsed.year) childBirthYear = parsed.year;
                    }
                });

                if (!childBirthYear) return;

                const parentFamilyId = child.familyAsChild;
                if (!parentFamilyId) return;

                const parentFamily = findFamily(project, parentFamilyId);
                if (!parentFamily) return;

                [parentFamily.husband, parentFamily.wife].forEach(parentId => {
                    if (!parentId) return;
                    const parent = findIndividual(project, parentId);
                    if (!parent) return;

                    const parentEvents = parent.events || [];
                    let parentBirthYear = null;

                    parentEvents.forEach(event => {
                        if (event.tag === 'BIRT' && event.date) {
                            const parsed = parseGedcomDate(event.date);
                            if (parsed && parsed.year) parentBirthYear = parsed.year;
                        }
                    });

                    if (parentBirthYear && childBirthYear < parentBirthYear) {
                        issues.push(new ValidationIssue({
                            id: `${child.id}_CHILD_BEFORE_PARENT_${parentId}`,
                            severity: 'quality',
                            category: 'temporal',
                            ruleId: 'CHILD_BEFORE_PARENT',
                            title: 'Child Born Before Parent',
                            message: `${getPersonName(child)} born in ${childBirthYear} before parent ${getPersonName(parent)} born in ${parentBirthYear}`,
                            entityType: 'individual',
                            entityId: child.id,
                            entityName: getPersonName(child),
                            autoFixable: true,
                            batchFixable: false,
                            affectedField: 'events',
                            metadata: { parentId, childBirthYear, parentBirthYear, childBirthDate: child.events.find(e => e.tag === 'BIRT')?.date, parentBirthDate: parent.events.find(e => e.tag === 'BIRT')?.date }
                        }));
                    }
                });
            });

            return issues;
        }
    }),

    // 14. PARENT_TOO_YOUNG (Quality)
    new ValidationRule({
        id: 'PARENT_TOO_YOUNG',
        severity: 'quality',
        category: 'temporal',
        title: 'Parent Too Young',
        description: 'Parent was less than 12 years old at child\'s birth',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            project.individuals?.forEach(parent => {
                const parentEvents = parent.events || [];
                let parentBirthYear = null;

                parentEvents.forEach(event => {
                    if (event.tag === 'BIRT' && event.date) {
                        const parsed = parseGedcomDate(event.date);
                        if (parsed && parsed.year) parentBirthYear = parsed.year;
                    }
                });

                if (!parentBirthYear) return;

                parent.familiesAsSpouse?.forEach(familyId => {
                    const family = findFamily(project, familyId);
                    if (!family) return;

                    family.children?.forEach(childId => {
                        const child = findIndividual(project, childId);
                        if (!child) return;

                        const childEvents = child.events || [];
                        let childBirthYear = null;

                        childEvents.forEach(event => {
                            if (event.tag === 'BIRT' && event.date) {
                                const parsed = parseGedcomDate(event.date);
                                if (parsed && parsed.year) childBirthYear = parsed.year;
                            }
                        });

                        if (childBirthYear && childBirthYear - parentBirthYear < 12) {
                            issues.push(new ValidationIssue({
                                id: `${parent.id}_PARENT_TOO_YOUNG_${childId}`,
                                severity: 'quality',
                                category: 'temporal',
                                ruleId: 'PARENT_TOO_YOUNG',
                                title: 'Parent Too Young',
                                message: `${getPersonName(parent)} was only ${childBirthYear - parentBirthYear} years old when ${getPersonName(child)} was born`,
                                entityType: 'individual',
                                entityId: parent.id,
                                entityName: getPersonName(parent),
                                autoFixable: true,
                                batchFixable: false,
                                affectedField: 'events',
                                metadata: { parentBirthYear, childBirthYear, age: childBirthYear - parentBirthYear, childName: getPersonName(child) }
                            }));
                        }
                    });
                });
            });

            return issues;
        }
    }),

    // 15. MARRIAGE_BEFORE_BIRTH (Quality)
    new ValidationRule({
        id: 'MARRIAGE_BEFORE_BIRTH',
        severity: 'quality',
        category: 'temporal',
        title: 'Marriage Before Birth',
        description: 'Individual was married before being born',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            project.individuals?.forEach(individual => {
                const events = individual.events || [];
                let birthYear = null;
                let marriageYear = null;

                events.forEach(event => {
                    if (event.tag === 'BIRT' && event.date) {
                        const parsed = parseGedcomDate(event.date);
                        if (parsed && parsed.year) birthYear = parsed.year;
                    }
                    if (event.tag === 'MARR' && event.date) {
                        const parsed = parseGedcomDate(event.date);
                        if (parsed && parsed.year) marriageYear = parsed.year;
                    }
                });

                if (birthYear && marriageYear && marriageYear < birthYear) {
                    issues.push(new ValidationIssue({
                        id: `${individual.id}_MARRIAGE_BEFORE_BIRTH`,
                        severity: 'quality',
                        category: 'temporal',
                        ruleId: 'MARRIAGE_BEFORE_BIRTH',
                        title: 'Marriage Before Birth',
                        message: `${getPersonName(individual)} was married in ${marriageYear} before being born in ${birthYear}`,
                        entityType: 'individual',
                        entityId: individual.id,
                        entityName: getPersonName(individual),
                        autoFixable: true,
                        batchFixable: false,
                        affectedField: 'events',
                        metadata: { birthYear, marriageYear }
                    }));
                }
            });

            return issues;
        }
    }),

    // 16. LIFESPAN_UNUSUAL (Quality)
    new ValidationRule({
        id: 'LIFESPAN_UNUSUAL',
        severity: 'quality',
        category: 'temporal',
        title: 'Unusual Lifespan',
        description: 'Individual lived more than 120 years',
        appliesTo: ['individual'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            project.individuals?.forEach(individual => {
                const events = individual.events || [];
                let birthYear = null;
                let deathYear = null;

                events.forEach(event => {
                    if (event.tag === 'BIRT' && event.date) {
                        const parsed = parseGedcomDate(event.date);
                        if (parsed && parsed.year) birthYear = parsed.year;
                    }
                    if (event.tag === 'DEAT' && event.date) {
                        const parsed = parseGedcomDate(event.date);
                        if (parsed && parsed.year) deathYear = parsed.year;
                    }
                });

                if (birthYear && deathYear && deathYear - birthYear > 120) {
                    issues.push(new ValidationIssue({
                        id: `${individual.id}_LIFESPAN_UNUSUAL`,
                        severity: 'quality',
                        category: 'temporal',
                        ruleId: 'LIFESPAN_UNUSUAL',
                        title: 'Unusual Lifespan',
                        message: `${getPersonName(individual)} lived ${deathYear - birthYear} years (${birthYear}-${deathYear})`,
                        entityType: 'individual',
                        entityId: individual.id,
                        entityName: getPersonName(individual),
                        autoFixable: false,
                        batchFixable: false,
                        affectedField: 'events',
                        metadata: { birthYear, deathYear, age: deathYear - birthYear }
                    }));
                }
            });

            return issues;
        }
    }),

    // 17. INCOMPLETE_DATE (Suggestion)
    new ValidationRule({
        id: 'INCOMPLETE_DATE',
        severity: 'suggestion',
        category: 'completeness',
        title: 'Incomplete Date',
        description: 'Date is missing month or day information',
        appliesTo: ['individual', 'family'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            const checkEvents = (events, entityId, entityType, entityName) => {
                (events || []).forEach((event, eventIdx) => {
                    if (event.tag === 'BIRT' || event.tag === 'DEAT' || event.tag === 'MARR') {
                        if (event.date) {
                            const parsed = parseGedcomDate(event.date);
                            if (parsed && parsed.year && (!parsed.month || !parsed.day)) {
                                issues.push(new ValidationIssue({
                                    id: `${entityId}_INCOMPLETE_DATE_${event.tag}_${eventIdx}`,
                                    severity: 'suggestion',
                                    category: 'completeness',
                                    ruleId: 'INCOMPLETE_DATE',
                                    title: 'Incomplete Date',
                                    message: `${event.tag} event for ${entityName || entityId} is missing ${!parsed.month ? 'month' : ''}${!parsed.month && !parsed.day ? ' and ' : ''}${!parsed.day ? 'day' : ''}`,
                                    entityType,
                                    entityId,
                                    entityName,
                                    autoFixable: true,
                                    batchFixable: false,
                                    affectedField: 'events',
                                    metadata: { tag: event.tag, currentDate: event.date, eventIndex: eventIdx, parsedParts: { day: parsed.day, month: parsed.month, year: parsed.year } }
                                }));
                            }
                        }
                    }
                });
            };

            (project.individuals || []).forEach(i => {
                checkEvents(i.events, i.id, 'individual', getPersonName(i));
            });

            (project.families || []).forEach(f => {
                checkEvents(f.events, f.id, 'family', null);
            });

            return issues;
        }
    }),

    // 18. EMPTY_PLACE (Suggestion)
    new ValidationRule({
        id: 'EMPTY_PLACE',
        severity: 'suggestion',
        category: 'formatting',
        title: 'Empty Place Field',
        description: 'Event has empty place information',
        appliesTo: ['individual', 'family'],
        validate: (project) => {
            const issues = [];
            if (!project) return issues;

            const checkEvents = (events, entityId, entityType, entityName) => {
                (events || []).forEach((event, eventIdx) => {
                    if ((event.tag === 'BIRT' || event.tag === 'DEAT' || event.tag === 'MARR') &&
                        (!event.place || (typeof event.place === 'string' && !event.place.trim()))) {
                        issues.push(new ValidationIssue({
                            id: `${entityId}_EMPTY_PLACE_${event.tag}_${eventIdx}`,
                            severity: 'suggestion',
                            category: 'formatting',
                            ruleId: 'EMPTY_PLACE',
                            title: 'Empty Place Field',
                            message: `${event.tag} event has no place information`,
                            entityType,
                            entityId,
                            entityName,
                            autoFixable: true,
                            batchFixable: false,
                            affectedField: 'events',
                            metadata: { tag: event.tag, currentPlace: event.place || '', eventIndex: eventIdx }
                        }));
                    }
                });
            };

            (project.individuals || []).forEach(i => {
                checkEvents(i.events, i.id, 'individual', getPersonName(i));
            });

            (project.families || []).forEach(f => {
                checkEvents(f.events, f.id, 'family', null);
            });

            return issues;
        }
    })
];
