/**
 * Quick Fix Functions for GEDCOM Quality Issues
 * Provides auto-fix functions for auto-fixable validation issues
 */

import { ProjectMutator } from '../mutations.js';

/**
 * Registry of fix functions keyed by ruleId
 */
export const FIXERS = {
    /**
     * Fix empty name entries
     * Removes name records with empty values
     */
    EMPTY_NAME_VALUE: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const individual = project.individuals.find(i => i.id === issue.entityId);

        if (!individual) return project;

        const nameIndex = issue.metadata.nameIndex;
        if (nameIndex !== undefined && nameIndex >= 0 && nameIndex < individual.names.length) {
            // Remove the empty name at this index
            const updates = {
                names: individual.names.filter((_, idx) => idx !== nameIndex)
            };
            mutator.updateIndividual(issue.entityId, updates);
        }

        return mutator.getProject();
    },

    /**
     * Fix whitespace-only fields
     * Removes or clears whitespace-only content
     */
    WHITESPACE_ONLY: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const individual = project.individuals?.find(i => i.id === issue.entityId);
        const family = !individual ? project.families?.find(f => f.id === issue.entityId) : null;
        const entity = individual || family;

        if (!entity) return project;

        const fieldName = issue.metadata.fieldName;

        if (issue.entityType === 'individual' && fieldName.startsWith('notes[')) {
            // Extract index from "notes[0]"
            const match = fieldName.match(/notes\[(\d+)\]/);
            if (match) {
                const noteIndex = parseInt(match[1]);
                const updates = {
                    notes: individual.notes.filter((_, idx) => idx !== noteIndex)
                };
                mutator.updateIndividual(issue.entityId, updates);
            }
        } else if (issue.entityType === 'family' && fieldName.startsWith('notes[')) {
            const match = fieldName.match(/notes\[(\d+)\]/);
            if (match) {
                const noteIndex = parseInt(match[1]);
                const updates = {
                    notes: family.notes.filter((_, idx) => idx !== noteIndex)
                };
                mutator.updateFamily(issue.entityId, updates);
            }
        }

        return mutator.getProject();
    },

    /**
     * Fix duplicate children in family
     * Removes duplicate child entries, keeping only the first occurrence
     */
    DUPLICATE_FAMILY_CHILD: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const family = project.families.find(f => f.id === issue.entityId);

        if (!family || !family.children) return project;

        const childId = issue.metadata.childId;
        // Remove all occurrences and add back just one
        const uniqueChildren = [];
        let seenChildId = false;

        family.children.forEach(id => {
            if (id === childId) {
                if (!seenChildId) {
                    uniqueChildren.push(id);
                    seenChildId = true;
                }
            } else {
                uniqueChildren.push(id);
            }
        });

        const updates = { children: uniqueChildren };
        mutator.updateFamily(issue.entityId, updates);

        return mutator.getProject();
    },

    /**
     * Fix missing birth event
     * Adds a birth event with provided date
     */
    MISSING_BIRTH: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const individual = project.individuals.find(i => i.id === issue.entityId);

        if (!individual || !fixData || !fixData.birthDate) return project;

        // Add birth event
        const birthEvent = {
            tag: 'BIRT',
            date: fixData.birthDate,
            place: '',
            note: ''
        };

        const events = [...(individual.events || [])];
        events.push(birthEvent);
        mutator.updateIndividual(issue.entityId, { events });

        return mutator.getProject();
    },

    /**
     * Fix missing name
     * Adds a new name record with provided data
     */
    MISSING_NAME: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const individual = project.individuals.find(i => i.id === issue.entityId);

        if (!individual || !fixData) return project;

        // Only proceed if at least given name or surname is provided
        if (!fixData.givenName && !fixData.surname) return project;

        // Create new name record
        const newName = {
            value: fixData.fullName || `${fixData.givenName || ''} ${fixData.surname || ''}`.trim(),
            type: 'NAME',
            given: fixData.givenName || '',
            surname: fixData.surname || '',
            prefix: fixData.prefix || '',
            suffix: fixData.suffix || ''
        };

        // Add name to person
        const names = [...(individual.names || [])];
        names.push(newName);
        mutator.updateIndividual(issue.entityId, { names });

        return mutator.getProject();
    },

    /**
     * Fix non-standard date format
     * Updates event date to standard GEDCOM format
     */
    NON_STANDARD_DATE: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const individual = project.individuals.find(i => i.id === issue.entityId);

        if (!individual || !fixData || !fixData.correctedDate) return project;

        const eventIndex = issue.metadata.eventIndex;
        if (eventIndex !== undefined && eventIndex >= 0 && individual.events && eventIndex < individual.events.length) {
            const events = [...individual.events];
            events[eventIndex].date = fixData.correctedDate;
            mutator.updateIndividual(issue.entityId, { events });
        }

        return mutator.getProject();
    },

    /**
     * Fix incomplete date
     * Fills in missing day/month/year components
     */
    INCOMPLETE_DATE: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const individual = project.individuals.find(i => i.id === issue.entityId);

        if (!individual || !fixData) return project;

        const eventIndex = issue.metadata.eventIndex;
        if (eventIndex !== undefined && eventIndex >= 0 && individual.events && eventIndex < individual.events.length) {
            const events = [...individual.events];
            const event = events[eventIndex];

            // Construct complete date from fixData
            const parts = [];
            if (fixData.day) parts.push(fixData.day);
            if (fixData.month) parts.push(fixData.month.toUpperCase());
            if (fixData.year) parts.push(fixData.year);

            if (parts.length > 0) {
                event.date = parts.join(' ');
                mutator.updateIndividual(issue.entityId, { events });
            }
        }

        return mutator.getProject();
    },

    /**
     * Fix empty place
     * Updates place field with provided location data
     */
    EMPTY_PLACE: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);
        const individual = project.individuals.find(i => i.id === issue.entityId);

        if (!individual || !fixData) return project;

        const eventIndex = issue.metadata.eventIndex;
        if (eventIndex !== undefined && eventIndex >= 0 && individual.events && eventIndex < individual.events.length) {
            const events = [...individual.events];
            const event = events[eventIndex];

            // Construct complete place from fixData
            const parts = [
                fixData.city,
                fixData.stateProvince,
                fixData.country
            ].filter(Boolean);

            if (parts.length > 0) {
                event.place = parts.join(', ');
                mutator.updateIndividual(issue.entityId, { events });
            }
        }

        return mutator.getProject();
    },

    /**
     * Fix child born before parent
     * Adjusts either parent or child birth date
     */
    CHILD_BEFORE_PARENT: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);

        if (!fixData) return project;

        if (fixData.adjustParent && fixData.newParentBirthDate) {
            // Update parent birth date
            const parent = project.individuals.find(i => i.id === issue.metadata.parentId);
            if (parent) {
                const birthEvent = parent.events?.find(e => e.tag === 'BIRT');
                if (birthEvent) {
                    const events = [...parent.events];
                    const idx = events.indexOf(birthEvent);
                    if (idx >= 0) {
                        events[idx].date = fixData.newParentBirthDate;
                        mutator.updateIndividual(issue.metadata.parentId, { events });
                    }
                }
            }
        } else if (!fixData.adjustParent && fixData.newChildBirthDate) {
            // Update child birth date
            const child = project.individuals.find(i => i.id === issue.entityId);
            if (child) {
                const birthEvent = child.events?.find(e => e.tag === 'BIRT');
                if (birthEvent) {
                    const events = [...child.events];
                    const idx = events.indexOf(birthEvent);
                    if (idx >= 0) {
                        events[idx].date = fixData.newChildBirthDate;
                        mutator.updateIndividual(issue.entityId, { events });
                    }
                }
            }
        }

        return mutator.getProject();
    },

    /**
     * Fix parent too young
     * Adjusts parent birth date to be earlier
     */
    PARENT_TOO_YOUNG: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);

        if (!fixData || !fixData.newParentBirthDate) return project;

        const parent = project.individuals.find(i => i.id === issue.entityId);
        if (parent) {
            const birthEvent = parent.events?.find(e => e.tag === 'BIRT');
            if (birthEvent) {
                const events = [...parent.events];
                const idx = events.indexOf(birthEvent);
                if (idx >= 0) {
                    events[idx].date = fixData.newParentBirthDate;
                    mutator.updateIndividual(issue.entityId, { events });
                }
            }
        }

        return mutator.getProject();
    },

    /**
     * Fix marriage before birth
     * Adjusts either birth date or marriage date
     */
    MARRIAGE_BEFORE_BIRTH: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);

        if (!fixData) return project;

        const individual = project.individuals.find(i => i.id === issue.entityId);
        if (!individual) return project;

        if (fixData.adjustBirth && fixData.newBirthDate) {
            // Update birth date
            const birthEvent = individual.events?.find(e => e.tag === 'BIRT');
            if (birthEvent) {
                const events = [...individual.events];
                const idx = events.indexOf(birthEvent);
                if (idx >= 0) {
                    events[idx].date = fixData.newBirthDate;
                    mutator.updateIndividual(issue.entityId, { events });
                }
            }
        } else if (!fixData.adjustBirth && fixData.newMarriageDate) {
            // Update marriage date
            const marriageEvent = individual.events?.find(e => e.tag === 'MARR');
            if (marriageEvent) {
                const events = [...individual.events];
                const idx = events.indexOf(marriageEvent);
                if (idx >= 0) {
                    events[idx].date = fixData.newMarriageDate;
                    mutator.updateIndividual(issue.entityId, { events });
                }
            }
        }

        return mutator.getProject();
    },

    /**
     * Fix birth after death
     * Adjusts either birth date or death date
     */
    BIRTH_AFTER_DEATH: (project, issue, fixData) => {
        const mutator = new ProjectMutator(project);

        if (!fixData) return project;

        const individual = project.individuals.find(i => i.id === issue.entityId);
        if (!individual) return project;

        if (fixData.adjustBirth && fixData.newBirthDate) {
            // Update birth date
            const birthEvent = individual.events?.find(e => e.tag === 'BIRT');
            if (birthEvent) {
                const events = [...individual.events];
                const idx = events.indexOf(birthEvent);
                if (idx >= 0) {
                    events[idx].date = fixData.newBirthDate;
                    mutator.updateIndividual(issue.entityId, { events });
                }
            }
        } else if (!fixData.adjustBirth && fixData.newDeathDate) {
            // Update death date
            const deathEvent = individual.events?.find(e => e.tag === 'DEAT');
            if (deathEvent) {
                const events = [...individual.events];
                const idx = events.indexOf(deathEvent);
                if (idx >= 0) {
                    events[idx].date = fixData.newDeathDate;
                    mutator.updateIndividual(issue.entityId, { events });
                }
            }
        }

        return mutator.getProject();
    }
};

/**
 * Apply a quick fix to a project
 * @param {Project} project
 * @param {ValidationIssue} issue
 * @param {Object} fixData - User-provided fix data
 * @returns {Project} Updated project, or original if fix not available
 */
export function applyQuickFix(project, issue, fixData = {}) {
    if (!issue || !issue.ruleId) return project;

    const fixer = FIXERS[issue.ruleId];
    if (!fixer) {
        console.warn(`No fixer available for rule: ${issue.ruleId}`);
        return project;
    }

    try {
        return fixer(project, issue, fixData);
    } catch (error) {
        console.error(`Error applying fix for ${issue.ruleId}:`, error);
        return project;
    }
}

/**
 * Apply multiple quick fixes in batch
 * @param {Project} project
 * @param {ValidationIssue[]} issues
 * @returns {Project} Updated project with all fixes applied
 */
export function applyBatchQuickFixes(project, issues) {
    let updatedProject = project;

    for (const issue of issues) {
        if (issue.autoFixable) {
            updatedProject = applyQuickFix(updatedProject, issue);
        }
    }

    return updatedProject;
}

/**
 * Get fixable issues from a list
 * @param {ValidationIssue[]} issues
 * @returns {ValidationIssue[]} Issues that can be auto-fixed
 */
export function getFixableIssues(issues) {
    return issues.filter(issue => issue.autoFixable && FIXERS[issue.ruleId]);
}

/**
 * Get batch-fixable issues from a list
 * @param {ValidationIssue[]} issues
 * @returns {ValidationIssue[]} Issues that can be batch-fixed
 */
export function getBatchFixableIssues(issues) {
    return issues.filter(issue => issue.batchFixable && FIXERS[issue.ruleId]);
}

/**
 * Check if an issue can be fixed
 * @param {ValidationIssue} issue
 * @returns {boolean}
 */
export function canFixIssue(issue) {
    return issue && issue.autoFixable && !!FIXERS[issue.ruleId];
}

/**
 * Get description of what a fix will do
 * @param {ValidationIssue} issue
 * @returns {string} Description of the fix
 */
export function getFixDescription(issue) {
    const descriptions = {
        EMPTY_NAME_VALUE: 'Remove empty name record',
        WHITESPACE_ONLY: 'Remove whitespace-only content',
        DUPLICATE_FAMILY_CHILD: 'Remove duplicate child entry, keeping first occurrence',
        MISSING_BIRTH: 'Add birth event with provided date',
        MISSING_NAME: 'Add name record with provided data',
        NON_STANDARD_DATE: 'Update date to standard GEDCOM format',
        INCOMPLETE_DATE: 'Fill in missing date components',
        EMPTY_PLACE: 'Add place information',
        CHILD_BEFORE_PARENT: 'Adjust birth date to fix temporal issue',
        PARENT_TOO_YOUNG: 'Adjust parent birth date',
        MARRIAGE_BEFORE_BIRTH: 'Adjust birth or marriage date',
        BIRTH_AFTER_DEATH: 'Adjust birth or death date'
    };

    return descriptions[issue.ruleId] || 'Apply fix';
}
