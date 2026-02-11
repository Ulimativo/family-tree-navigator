/**
 * IssueCard Component
 * Displays a single validation issue with actions
 */

import React, { useState } from 'react';
import { getSeverityIcon, getSeverityColor } from '../../lib/gedcom/quality/scoring.js';
import { QuickFixModal } from './QuickFixModal.jsx';

export const IssueCard = ({ 
    issue, 
    onDismiss, 
    onGoToProfile, 
    onApplyQuickFix, 
    enableBatchSelect, 
    isSelected, 
    onToggleSelect 
}) => {
    const [showQuickFixModal, setShowQuickFixModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleQuickFixClick = () => {
        if (issue.autoFixable) {
            setShowQuickFixModal(true);
        }
    };

    const handleApplyFix = async (issueId, fixData) => {
        if (onApplyQuickFix) {
            await onApplyQuickFix(issueId, fixData);
        }
        setShowQuickFixModal(false);
    };

    const handleGoToProfile = () => {
        if (onGoToProfile && issue.entityType === 'individual') {
            onGoToProfile(issue.entityId);
        }
    };

    const handleDismiss = () => {
        // Confirm dismissal for critical issues
        if (issue.severity === 'critical') {
            if (window.confirm('Are you sure you want to dismiss this critical issue? It may indicate a serious data problem.')) {
                onDismiss?.(issue.id);
            }
        } else {
            onDismiss?.(issue.id);
        }
    };

    const severityColor = getSeverityColor(issue.severity);

    return (
        <>
            <div 
                className={`quality-issue-card ${issue.severity}`}
                style={{
                    borderLeftColor: severityColor,
                    borderLeftWidth: '4px'
                }}
            >
            <div className="quality-issue-header">
                {enableBatchSelect && (
                    <div className="quality-issue-checkbox">
                        <input
                            type="checkbox"
                            checked={isSelected || false}
                            onChange={() => onToggleSelect?.(issue.id)}
                            title="Select for batch operation"
                                aria-label={`Select issue: ${issue.title}`}
                        />
                    </div>
                )}
                    <div className="quality-issue-icon" aria-hidden="true">
                    {getSeverityIcon(issue.severity)}
                </div>
                <div className="quality-issue-content">
                        <div className="quality-issue-title-row">
                    <h4 className="quality-issue-title">{issue.title}</h4>
                            {issue.autoFixable && (
                                <span className="quality-issue-fixable-badge" title="This issue can be automatically fixed">
                                    Fixable
                                </span>
                            )}
                        </div>
                    <p className="quality-issue-message">{issue.message}</p>
                        <div className="quality-issue-meta">
                    {issue.entityName && (
                        <span className="quality-issue-entity">
                            {issue.entityName}
                        </span>
                    )}
                    {!issue.entityName && issue.entityId && (
                        <span className="quality-issue-entity">
                            {issue.entityId}
                        </span>
                    )}
                            <span className="quality-issue-category">
                                {issue.category}
                            </span>
                        </div>
                        {showDetails && issue.metadata && Object.keys(issue.metadata).length > 0 && (
                            <div className="quality-issue-details">
                                <div className="quality-issue-details-title">Details:</div>
                                <pre className="quality-issue-details-content">
                                    {JSON.stringify(issue.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
            </div>

            <div className="quality-issue-actions">
                {issue.autoFixable && (
                    <button
                        className="quality-issue-action-btn quick-fix"
                        onClick={handleQuickFixClick}
                        title="Apply quick fix for this issue"
                            aria-label={`Fix: ${issue.title}`}
                    >
                            <span className="quality-issue-action-icon">⚙</span>
                            Fix
                    </button>
                )}

                {issue.entityType === 'individual' && (
                    <button
                        className="quality-issue-action-btn"
                        onClick={handleGoToProfile}
                        title="Open individual profile"
                            aria-label={`Go to profile: ${issue.entityName || issue.entityId}`}
                        >
                            <span className="quality-issue-action-icon">📋</span>
                            Profile
                        </button>
                    )}

                    <button
                        className="quality-issue-action-btn details"
                        onClick={() => setShowDetails(!showDetails)}
                        title={showDetails ? "Hide details" : "Show details"}
                        aria-label={showDetails ? "Hide issue details" : "Show issue details"}
                    >
                        <span className="quality-issue-action-icon">{showDetails ? '▲' : '▼'}</span>
                        {showDetails ? 'Hide' : 'Details'}
                    </button>

                <button
                    className="quality-issue-action-btn dismiss"
                        onClick={handleDismiss}
                    title="Dismiss this issue"
                        aria-label={`Dismiss: ${issue.title}`}
                >
                        <span className="quality-issue-action-icon">✕</span>
                        Dismiss
                </button>
                </div>
            </div>

            {showQuickFixModal && (
                <QuickFixModal
                    issue={issue}
                    isOpen={showQuickFixModal}
                    onClose={() => setShowQuickFixModal(false)}
                    onApplyFix={handleApplyFix}
                />
            )}
        </>
    );
};
