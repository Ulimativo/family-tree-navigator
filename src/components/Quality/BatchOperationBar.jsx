/**
 * BatchOperationBar Component
 * Enhanced batch operation toolbar with selection tools and progress tracking
 */

import React, { useMemo } from 'react';
import { getSeverityIcon } from '../../lib/gedcom/quality/scoring.js';

export const BatchOperationBar = ({
    issues,
    selectedIssueIds,
    onSelectAll,
    onDeselectAll,
    onSelectBySeverity,
    onSelectByCategory,
    onSelectFixable,
    onApplyBatchFixes,
    onDismissBatchIssues,
    isProcessing = false
}) => {
    const selectedCount = selectedIssueIds.size;
    const totalCount = issues.length;

    // Count selected issues by severity
    const selectedBySeverity = useMemo(() => {
        const counts = { critical: 0, warning: 0, quality: 0, suggestion: 0 };
        issues.forEach(issue => {
            if (selectedIssueIds.has(issue.id)) {
                counts[issue.severity] = (counts[issue.severity] || 0) + 1;
            }
        });
        return counts;
    }, [issues, selectedIssueIds]);

    // Count fixable selected issues
    const fixableSelected = useMemo(() => {
        return issues.filter(
            issue => selectedIssueIds.has(issue.id) && issue.autoFixable
        ).length;
    }, [issues, selectedIssueIds]);

    const handleSelectBySeverity = (severity) => {
        onSelectBySeverity?.(severity);
    };

    const handleSelectByCategory = (category) => {
        onSelectByCategory?.(category);
    };

    const handleSelectFixable = () => {
        onSelectFixable?.();
    };

    if (totalCount === 0) {
        return null;
    }

    const allSelected = selectedCount === totalCount;
    const hasSelection = selectedCount > 0;

    return (
        <div className="quality-batch-bar">
            <div className="quality-batch-info">
                <div className="quality-batch-count">
                    <span className="quality-batch-count-label">Selected:</span>
                    <span className="quality-batch-count-value">
                        {selectedCount} of {totalCount}
                    </span>
                </div>
                {hasSelection && (
                    <div className="quality-batch-breakdown">
                        {Object.entries(selectedBySeverity).map(([severity, count]) => {
                            if (count === 0) return null;
                            return (
                                <span
                                    key={severity}
                                    className="quality-batch-severity-badge"
                                    title={`${count} ${severity} issue${count !== 1 ? 's' : ''} selected`}
                                >
                                    {getSeverityIcon(severity)} {count}
                                </span>
                            );
                        })}
                        {fixableSelected > 0 && (
                            <span
                                className="quality-batch-fixable-badge"
                                title={`${fixableSelected} fixable issue${fixableSelected !== 1 ? 's' : ''} selected`}
                            >
                                ⚙ {fixableSelected}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="quality-batch-actions">
                {/* Selection Controls */}
                <div className="quality-batch-selection-controls">
                    <button
                        className="quality-batch-btn"
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        disabled={isProcessing}
                        title={allSelected ? "Deselect all issues" : "Select all issues"}
                        aria-label={allSelected ? "Deselect all" : "Select all"}
                    >
                        {allSelected ? '☐ Deselect All' : '☑ Select All'}
                    </button>

                    <div className="quality-batch-quick-select">
                        <span className="quality-batch-quick-select-label">Quick select:</span>
                        <button
                            className="quality-batch-btn small"
                            onClick={handleSelectFixable}
                            disabled={isProcessing}
                            title="Select all fixable issues"
                            aria-label="Select all fixable issues"
                        >
                            ⚙ Fixable
                        </button>
                        <button
                            className="quality-batch-btn small"
                            onClick={() => handleSelectBySeverity('critical')}
                            disabled={isProcessing}
                            title="Select all critical issues"
                            aria-label="Select all critical issues"
                        >
                            {getSeverityIcon('critical')} Critical
                        </button>
                        <button
                            className="quality-batch-btn small"
                            onClick={() => handleSelectBySeverity('warning')}
                            disabled={isProcessing}
                            title="Select all warning issues"
                            aria-label="Select all warning issues"
                        >
                            {getSeverityIcon('warning')} Warning
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="quality-batch-action-buttons">
                    <button
                        className="quality-batch-btn quality-batch-btn-apply"
                        onClick={() => onApplyBatchFixes?.(Array.from(selectedIssueIds))}
                        disabled={!hasSelection || isProcessing || fixableSelected === 0}
                        title={`Apply fixes to ${fixableSelected} fixable selected issue${fixableSelected !== 1 ? 's' : ''}`}
                        aria-label={`Apply fixes to ${fixableSelected} selected issues`}
                    >
                        {isProcessing ? (
                            <>
                                <span className="quality-batch-btn-spinner">⟳</span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="quality-batch-btn-icon">✓</span>
                                Fix Selected ({fixableSelected})
                            </>
                        )}
                    </button>
                    <button
                        className="quality-batch-btn quality-batch-btn-dismiss"
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to dismiss ${selectedCount} selected issue${selectedCount !== 1 ? 's' : ''}?`)) {
                                onDismissBatchIssues?.(Array.from(selectedIssueIds));
                            }
                        }}
                        disabled={!hasSelection || isProcessing}
                        title={`Dismiss ${selectedCount} selected issue${selectedCount !== 1 ? 's' : ''}`}
                        aria-label={`Dismiss ${selectedCount} selected issues`}
                    >
                        <span className="quality-batch-btn-icon">✕</span>
                        Dismiss Selected ({selectedCount})
                    </button>
                </div>
            </div>
        </div>
    );
};
