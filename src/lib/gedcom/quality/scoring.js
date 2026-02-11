/**
 * Quality Score Calculation Algorithm
 * Converts validation issues into a 0-100 quality score
 */

/**
 * Calculate quality score from validation results
 * Formula:
 * score = 100
 *   - (critical_count × 10)
 *   - (warning_count × 3)
 *   - (quality_count × 1)
 *   - (suggestion_count × 0.2)
 *   - issue_density_penalty (if >10% of individuals have issues)
 *
 * @param {ValidationResults} results
 * @param {number} totalIndividuals - Optional total individual count for density calculation
 * @returns {number} Score 0-100
 */
export function calculateQualityScore(results, totalIndividuals = null) {
    let score = 100;

    if (!results || !results.issues) {
        return 100;
    }

    // Subtract points for each severity level
    const criticalCount = results.categoryCounts?.critical || 0;
    const warningCount = results.categoryCounts?.warning || 0;
    const qualityCount = results.categoryCounts?.quality || 0;
    const suggestionCount = results.categoryCounts?.suggestion || 0;

    score -= criticalCount * 10;
    score -= warningCount * 3;
    score -= qualityCount * 1;
    score -= suggestionCount * 0.2;

    // Apply density penalty if too many issues
    if (totalIndividuals && totalIndividuals > 0) {
        const issueCount = results.issues.length;
        const issueDensity = issueCount / totalIndividuals;

        if (issueDensity > 0.1) { // More than 10% of individuals have issues
            const densityPenalty = (issueDensity - 0.1) * 10; // 1 point per 10% over threshold
            score -= Math.min(densityPenalty, 15); // Cap at 15 points
        }
    }

    // Clamp to 0-100
    return Math.max(0, Math.round(score));
}

/**
 * Get score category and display info
 * @param {number} score - 0-100
 * @returns {{ category: string, label: string, color: string, emoji: string }}
 */
export function getScoreCategory(score) {
    if (score >= 90) {
        return {
            category: 'excellent',
            label: 'Excellent',
            color: '#10b981', // Green
            emoji: '✓'
        };
    } else if (score >= 70) {
        return {
            category: 'good',
            label: 'Good',
            color: '#3b82f6', // Blue
            emoji: '◐'
        };
    } else if (score >= 50) {
        return {
            category: 'fair',
            label: 'Fair',
            color: '#f59e0b', // Yellow
            emoji: '⚠'
        };
    } else if (score >= 30) {
        return {
            category: 'poor',
            label: 'Poor',
            color: '#f97316', // Orange
            emoji: '✕'
        };
    } else {
        return {
            category: 'critical',
            label: 'Critical',
            color: '#ef4444', // Red
            emoji: '✗'
        };
    }
}

/**
 * Get highest severity level in issues
 * @param {ValidationIssue[]} issues
 * @returns {string} 'critical' | 'warning' | 'quality' | 'suggestion'
 */
export function getHighestSeverity(issues) {
    if (!issues || issues.length === 0) return 'suggestion';

    const severities = ['critical', 'warning', 'quality', 'suggestion'];
    for (const severity of severities) {
        if (issues.some(i => i.severity === severity)) {
            return severity;
        }
    }
    return 'suggestion';
}

/**
 * Get color for severity level
 * @param {string} severity
 * @returns {string} Color hex or CSS color
 */
export function getSeverityColor(severity) {
    switch (severity) {
        case 'critical':
            return '#ef4444'; // Red
        case 'warning':
            return '#f97316'; // Orange
        case 'quality':
            return '#f59e0b'; // Amber
        case 'suggestion':
            return '#6366f1'; // Indigo
        default:
            return '#6b7280'; // Gray
    }
}

/**
 * Get icon for severity level
 * @param {string} severity
 * @returns {string} Icon/emoji
 */
export function getSeverityIcon(severity) {
    switch (severity) {
        case 'critical':
            return '🔴';
        case 'warning':
            return '🟠';
        case 'quality':
            return '🟡';
        case 'suggestion':
            return '🔵';
        default:
            return '⚪';
    }
}

/**
 * Sort issues by severity then category
 * @param {ValidationIssue[]} issues
 * @returns {ValidationIssue[]}
 */
export function sortIssues(issues) {
    const severityOrder = { critical: 0, warning: 1, quality: 2, suggestion: 3 };
    const categoryOrder = { structural: 0, temporal: 1, formatting: 2, completeness: 3 };

    return [...issues].sort((a, b) => {
        const severityDiff = (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
        if (severityDiff !== 0) return severityDiff;

        const categoryDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
        if (categoryDiff !== 0) return categoryDiff;

        return a.title.localeCompare(b.title);
    });
}

/**
 * Group issues by severity
 * @param {ValidationIssue[]} issues
 * @returns {{ critical: ValidationIssue[], warning: ValidationIssue[], quality: ValidationIssue[], suggestion: ValidationIssue[] }}
 */
export function groupIssuesBySeverity(issues) {
    return {
        critical: issues.filter(i => i.severity === 'critical'),
        warning: issues.filter(i => i.severity === 'warning'),
        quality: issues.filter(i => i.severity === 'quality'),
        suggestion: issues.filter(i => i.severity === 'suggestion')
    };
}

/**
 * Group issues by category
 * @param {ValidationIssue[]} issues
 * @returns {{ structural: ValidationIssue[], temporal: ValidationIssue[], formatting: ValidationIssue[], completeness: ValidationIssue[] }}
 */
export function groupIssuesByCategory(issues) {
    return {
        structural: issues.filter(i => i.category === 'structural'),
        temporal: issues.filter(i => i.category === 'temporal'),
        formatting: issues.filter(i => i.category === 'formatting'),
        completeness: issues.filter(i => i.category === 'completeness')
    };
}

/**
 * Get issues for a specific entity type
 * @param {ValidationIssue[]} issues
 * @param {string} entityType
 * @returns {ValidationIssue[]}
 */
export function getIssuesForEntityType(issues, entityType) {
    return issues.filter(i => i.entityType === entityType);
}

/**
 * Get unique rule IDs from issues
 * @param {ValidationIssue[]} issues
 * @returns {string[]}
 */
export function getUniqueRuleIds(issues) {
    return [...new Set(issues.map(i => i.ruleId))];
}
