/**
 * QualityIssuesPanel Component
 * Displays quality issues for a specific individual on their profile
 */

import React from 'react';
import { getSeverityIcon, getSeverityColor } from '../../lib/gedcom/quality/scoring.js';

export const QualityIssuesPanel = ({ personId, validationResults, onOpenQualityReport }) => {
    if (!validationResults || !personId) {
        return null;
    }

    // Get issues for this person
    const personIssues = validationResults.issues.filter(
        issue => issue.entityId === personId && !validationResults.dismissedIssues.has(issue.id)
    );

    // Count issues by severity
    const issueCounts = personIssues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
    }, {});

    const fixableCount = personIssues.filter(i => i.autoFixable).length;

    if (personIssues.length === 0) {
        return (
            <div className="quality-no-issues">
                <span className="quality-no-issues-icon">✓</span>
                <span className="quality-no-issues-text">No quality issues detected</span>
            </div>
        );
    }

    return (
        <div className="quality-issues-section">
            <div className="quality-issues-section-header">
                <div className="quality-issues-section-title">
                    <span className="quality-issues-section-icon">⚠️</span>
                    <span>Data Quality Issues</span>
                    <span className="quality-issues-section-count">({personIssues.length})</span>
                </div>
                {fixableCount > 0 && (
                    <div className="quality-issues-section-fixable">
                        {fixableCount} fixable
                    </div>
                )}
            </div>

            {/* Severity Summary */}
            {Object.keys(issueCounts).length > 0 && (
                <div className="quality-issues-severity-summary">
                    {Object.entries(issueCounts).map(([severity, count]) => (
                        <div
                            key={severity}
                            className="quality-issues-severity-badge"
                            style={{ borderLeftColor: getSeverityColor(severity) }}
                        >
                            <span className="quality-issues-severity-icon">
                                {getSeverityIcon(severity)}
                            </span>
                            <span className="quality-issues-severity-label">{severity}</span>
                            <span className="quality-issues-severity-count">{count}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Issues List */}
            <div className="quality-issues-list">
                {personIssues.slice(0, 3).map(issue => (
                    <div key={issue.id} className="quality-person-issue-item">
                        <div className="quality-person-issue-item-header">
                            <span className="quality-person-issue-item-icon">
                                {getSeverityIcon(issue.severity)}
                            </span>
                            <div className="quality-person-issue-item-content">
                                <div className="quality-person-issue-item-title">
                                    {issue.title}
                                </div>
                                <div className="quality-person-issue-item-message">
                                    {issue.message}
                                </div>
                            </div>
                            {issue.autoFixable && (
                                <span className="quality-person-issue-fixable" title="This issue can be fixed">
                                    ⚙
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                {personIssues.length > 3 && (
                    <div className="quality-issues-more">
                        +{personIssues.length - 3} more issue{personIssues.length - 3 !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="quality-issues-section-actions">
                <button
                    className="quality-issues-action-btn primary"
                    onClick={onOpenQualityReport}
                    aria-label="View full quality report"
                >
                    <span className="quality-issues-action-icon">📊</span>
                    View Full Report
                </button>
            </div>
        </div>
    );
};
