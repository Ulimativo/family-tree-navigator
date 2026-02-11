/**
 * GEDCOM Quality Validator
 * Validates a GEDCOM project against a set of rules and produces a quality report
 */

import { VALIDATION_RULES } from './rules.js';
import { calculateQualityScore } from './scoring.js';

/**
 * Represents a single validation issue
 */
export class ValidationIssue {
    constructor(config) {
        this.id = config.id; // Unique issue ID (e.g., "I123_MISSING_NAME")
        this.severity = config.severity; // 'critical' | 'warning' | 'quality' | 'suggestion'
        this.category = config.category; // 'structural' | 'temporal' | 'formatting' | 'completeness'
        this.ruleId = config.ruleId; // Reference to rule ID
        this.title = config.title;
        this.message = config.message;
        this.entityType = config.entityType; // 'individual' | 'family' | 'source' | etc.
        this.entityId = config.entityId; // ID of affected entity
        this.entityName = config.entityName || null; // Human-readable name of entity
        this.autoFixable = config.autoFixable || false; // Can be auto-fixed?
        this.batchFixable = config.batchFixable || false; // Can be fixed in batch?
        this.affectedField = config.affectedField; // Field that needs fixing
        this.metadata = config.metadata || {}; // Rule-specific data (current/proposed values, etc.)
    }
}

/**
 * Represents the validation results for a project
 */
export class ValidationResults {
    constructor() {
        this.score = 100; // 0-100
        this.lastValidated = null; // ISO timestamp
        this.issueCount = 0;
        this.issues = []; // ValidationIssue[]
        this.dismissedIssues = new Set(); // Issue IDs that user has dismissed
        this.categoryCounts = {
            critical: 0,
            warning: 0,
            quality: 0,
            suggestion: 0
        };
    }

    toJSON() {
        return {
            score: this.score,
            lastValidated: this.lastValidated,
            issueCount: this.issueCount,
            issues: this.issues,
            dismissedIssues: Array.from(this.dismissedIssues),
            categoryCounts: this.categoryCounts
        };
    }

    static fromJSON(data) {
        const results = new ValidationResults();
        results.score = data.score;
        results.lastValidated = data.lastValidated;
        results.issueCount = data.issueCount;
        results.issues = data.issues.map(issue => new ValidationIssue(issue));
        results.dismissedIssues = new Set(data.dismissedIssues || []);
        results.categoryCounts = data.categoryCounts;
        return results;
    }
}

/**
 * Main validator class
 */
export class GedcomValidator {
    constructor() {
        this.rules = VALIDATION_RULES;
    }

    /**
     * Validate entire project
     * @param {Project} project
     * @returns {ValidationResults}
     */
    validateProject(project) {
        const results = new ValidationResults();

        if (!project) {
            return results;
        }

        // Run all rules
        for (const rule of this.rules) {
            try {
                const ruleIssues = rule.validate(project);
                if (Array.isArray(ruleIssues)) {
                    results.issues.push(...ruleIssues);
                }
            } catch (error) {
                console.error(`Error running validation rule ${rule.id}:`, error);
            }
        }

        // Update metadata
        results.issueCount = results.issues.length;
        results.lastValidated = new Date().toISOString();

        // Calculate severity counts
        results.categoryCounts = {
            critical: results.issues.filter(i => i.severity === 'critical').length,
            warning: results.issues.filter(i => i.severity === 'warning').length,
            quality: results.issues.filter(i => i.severity === 'quality').length,
            suggestion: results.issues.filter(i => i.severity === 'suggestion').length
        };

        // Calculate quality score
        results.score = calculateQualityScore(results);

        return results;
    }

    /**
     * Validate a specific entity and return issues for that entity
     * @param {Object} entity
     * @param {string} entityType - 'individual' | 'family' | 'source' | 'media' | 'repository' | 'sharedNote'
     * @param {Project} project - Full project context (for cross-references)
     * @returns {ValidationIssue[]}
     */
    validateEntity(entity, entityType, project) {
        const issues = [];

        for (const rule of this.rules) {
            if (rule.appliesTo && rule.appliesTo.includes(entityType)) {
                try {
                    const ruleIssues = rule.validateEntity(entity, entityType, project);
                    if (Array.isArray(ruleIssues)) {
                        issues.push(...ruleIssues);
                    }
                } catch (error) {
                    console.error(`Error running validation rule ${rule.id} on entity:`, error);
                }
            }
        }

        return issues;
    }

    /**
     * Re-validate a specific entity in the project context
     * Removes old issues for this entity and adds new ones
     * @param {Project} project
     * @param {string} entityId
     * @param {string} entityType
     * @param {ValidationResults} currentResults - Current validation results to update
     * @returns {ValidationResults} - Updated results
     */
    revalidateEntity(project, entityId, entityType, currentResults) {
        if (!currentResults) {
            return this.validateProject(project);
        }

        // Find the entity
        let entity = null;
        if (entityType === 'individual') {
            entity = project.individuals.find(i => i.id === entityId);
        } else if (entityType === 'family') {
            entity = project.families.find(f => f.id === entityId);
        }

        if (!entity) {
            return currentResults;
        }

        // Remove old issues for this entity
        currentResults.issues = currentResults.issues.filter(
            issue => !(issue.entityId === entityId && issue.entityType === entityType)
        );

        // Validate the entity
        const newIssues = this.validateEntity(entity, entityType, project);
        currentResults.issues.push(...newIssues);

        // Update metadata
        currentResults.issueCount = currentResults.issues.length;
        currentResults.lastValidated = new Date().toISOString();

        // Recalculate severity counts
        currentResults.categoryCounts = {
            critical: currentResults.issues.filter(i => i.severity === 'critical').length,
            warning: currentResults.issues.filter(i => i.severity === 'warning').length,
            quality: currentResults.issues.filter(i => i.severity === 'quality').length,
            suggestion: currentResults.issues.filter(i => i.severity === 'suggestion').length
        };

        // Recalculate quality score
        currentResults.score = calculateQualityScore(currentResults);

        return currentResults;
    }

    /**
     * Dismiss an issue so it's not shown in reports
     * @param {ValidationResults} results
     * @param {string} issueId
     */
    dismissIssue(results, issueId) {
        results.dismissedIssues.add(issueId);
    }

    /**
     * Restore a dismissed issue
     * @param {ValidationResults} results
     * @param {string} issueId
     */
    restoreIssue(results, issueId) {
        results.dismissedIssues.delete(issueId);
    }

    /**
     * Get active issues (not dismissed)
     * @param {ValidationResults} results
     * @returns {ValidationIssue[]}
     */
    getActiveIssues(results) {
        return results.issues.filter(issue => !results.dismissedIssues.has(issue.id));
    }
}

/**
 * Singleton validator instance
 */
export const validator = new GedcomValidator();

/**
 * Convenience function to validate a project
 * @param {Project} project
 * @returns {ValidationResults}
 */
export function validateProject(project) {
    return validator.validateProject(project);
}
