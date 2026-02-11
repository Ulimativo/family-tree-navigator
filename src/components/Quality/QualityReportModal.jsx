/**
 * QualityReportModal Component
 * Main modal for displaying GEDCOM quality assessment report
 */

import React, { useState, useMemo, useCallback } from 'react';
import { IssueList } from './IssueList.jsx';
import { BatchOperationBar } from './BatchOperationBar.jsx';
import { getScoreCategory, getSeverityIcon } from '../../lib/gedcom/quality/scoring.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import '../../styles/quality.css';

export const QualityReportModal = ({
    project,
    isOpen,
    onClose,
    onDismissIssue,
    onNavigateToProfile,
    onApplyQuickFix,
    onApplyBatchFixes,
    onDismissBatchIssues
}) => {
    const { t } = useTranslation();
    const [batchMode, setBatchMode] = useState(false);
    const [selectedIssueIds, setSelectedIssueIds] = useState(new Set());
    const [isProcessing, setIsProcessing] = useState(false);

    const validationResults = useMemo(() => {
        return project?.validationResults || {
            score: 100,
            issueCount: 0,
            issues: [],
            dismissedIssues: new Set(),
            categoryCounts: { critical: 0, warning: 0, quality: 0, suggestion: 0 }
        };
    }, [project?.validationResults]);

    // Get active (not dismissed) issues
    const activeIssues = useMemo(() => {
        return validationResults.issues.filter(
            issue => !validationResults.dismissedIssues.has(issue.id)
        );
    }, [validationResults.issues, validationResults.dismissedIssues]);

    // Get dismissed issues count
    const dismissedCount = useMemo(() => {
        return validationResults.dismissedIssues?.size || 0;
    }, [validationResults.dismissedIssues]);

    const scoreCategory = getScoreCategory(validationResults.score);
    const totalIssues = validationResults.issues.length;
    const progressPercentage = totalIssues > 0 
        ? Math.round(((totalIssues - activeIssues.length) / totalIssues) * 100)
        : 100;

    // Calculate fixable count
    const fixableCount = useMemo(() => {
        return activeIssues.filter(i => i.autoFixable).length;
    }, [activeIssues]);

    const handleClose = () => {
        setBatchMode(false);
        setSelectedIssueIds(new Set());
        onClose?.();
    };

    const handleToggleBatchSelect = useCallback((issueId) => {
        const newSet = new Set(selectedIssueIds);
        if (newSet.has(issueId)) {
            newSet.delete(issueId);
        } else {
            newSet.add(issueId);
        }
        setSelectedIssueIds(newSet);
    }, [selectedIssueIds]);

    const handleSelectAll = useCallback(() => {
        const allIds = new Set(activeIssues.map(i => i.id));
        setSelectedIssueIds(allIds);
    }, [activeIssues]);

    const handleDeselectAll = useCallback(() => {
        setSelectedIssueIds(new Set());
    }, []);

    const handleSelectBySeverity = useCallback((severity) => {
        const severityIssues = activeIssues.filter(i => i.severity === severity);
        const severityIds = new Set(severityIssues.map(i => i.id));
        const allSelected = severityIssues.every(i => selectedIssueIds.has(i.id));
        const newSelected = new Set(selectedIssueIds);
        
        if (allSelected) {
            // Deselect all of this severity
            severityIds.forEach(id => newSelected.delete(id));
        } else {
            // Select all of this severity
            severityIds.forEach(id => newSelected.add(id));
        }
        setSelectedIssueIds(newSelected);
    }, [activeIssues, selectedIssueIds]);

    const handleSelectByCategory = useCallback((category) => {
        const categoryIssues = activeIssues.filter(i => i.category === category);
        const categoryIds = new Set(categoryIssues.map(i => i.id));
        const allSelected = categoryIssues.every(i => selectedIssueIds.has(i.id));
        const newSelected = new Set(selectedIssueIds);
        
        if (allSelected) {
            // Deselect all of this category
            categoryIds.forEach(id => newSelected.delete(id));
        } else {
            // Select all of this category
            categoryIds.forEach(id => newSelected.add(id));
        }
        setSelectedIssueIds(newSelected);
    }, [activeIssues, selectedIssueIds]);

    const handleSelectFixable = useCallback(() => {
        const fixableIssues = activeIssues.filter(i => i.autoFixable);
        const fixableIds = new Set(fixableIssues.map(i => i.id));
        const allSelected = fixableIssues.every(i => selectedIssueIds.has(i.id));
        const newSelected = new Set(selectedIssueIds);
        
        if (allSelected) {
            // Deselect all fixable
            fixableIds.forEach(id => newSelected.delete(id));
        } else {
            // Select all fixable
            fixableIds.forEach(id => newSelected.add(id));
        }
        setSelectedIssueIds(newSelected);
    }, [activeIssues, selectedIssueIds]);

    const handleApplyBatchFixes = useCallback(async (issueIds) => {
        setIsProcessing(true);
        try {
            if (onApplyBatchFixes) {
                await onApplyBatchFixes(issueIds);
            }
            setSelectedIssueIds(new Set());
        } catch (error) {
            console.error('Error applying batch fixes:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [onApplyBatchFixes]);

    const handleDismissBatchIssues = useCallback(async (issueIds) => {
        setIsProcessing(true);
        try {
            if (onDismissBatchIssues) {
                await onDismissBatchIssues(issueIds);
            }
            setSelectedIssueIds(new Set());
        } catch (error) {
            console.error('Error dismissing batch issues:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [onDismissBatchIssues]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && !batchMode) {
            handleClose();
        }
    }, [batchMode]);

    React.useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="quality-modal-overlay" 
            onClick={!batchMode ? handleClose : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quality-modal-title"
        >
            <div 
                className="quality-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="quality-modal-header">
                    <div className="quality-modal-header-content">
                        <h2 id="quality-modal-title" className="quality-modal-title">
                            <span className="quality-modal-title-icon" aria-hidden="true">📊</span>
                            {t('quality.title')}
                        </h2>
                        {totalIssues > 0 && (
                            <div className="quality-modal-progress">
                                <div className="quality-modal-progress-bar">
                                    <div 
                                        className="quality-modal-progress-fill"
                                        style={{ width: `${progressPercentage}%` }}
                                        role="progressbar"
                                        aria-valuenow={progressPercentage}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                        aria-label={`${progressPercentage}% of issues resolved`}
                                    />
                                </div>
                                <span className="quality-modal-progress-text">
                                    {totalIssues - activeIssues.length} / {totalIssues} resolved
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        className="quality-modal-close"
                        onClick={handleClose}
                        title="Close report"
                        aria-label="Close quality report"
                    >
                        ✕
                    </button>
                </div>

                {/* Body - Two Column Layout */}
                <div className="quality-modal-body">
                    {/* Left Panel - Score & Summary */}
                    <div className="quality-left-panel">
                        {/* Score Display */}
                        <div className="quality-score-box">
                            <div
                                className={`quality-score-circle ${scoreCategory.category}`}
                                title={`Quality score: ${validationResults.score}/100`}
                                role="img"
                                aria-label={`Quality score: ${validationResults.score} out of 100, ${scoreCategory.label}`}
                            >
                                {validationResults.score}
                            </div>
                            <div className="quality-score-label">{t('quality.score')}</div>
                            <div className="quality-score-category">
                                {scoreCategory.label}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="quality-quick-stats">
                            <div className="quality-quick-stat">
                                <div className="quality-quick-stat-value">{activeIssues.length}</div>
                                <div className="quality-quick-stat-label">{t('quality.activeIssues')}</div>
                            </div>
                            {fixableCount > 0 && (
                                <div className="quality-quick-stat">
                                    <div className="quality-quick-stat-value">{fixableCount}</div>
                                    <div className="quality-quick-stat-label">{t('quality.autoFixable')}</div>
                                </div>
                            )}
                            {dismissedCount > 0 && (
                                <div className="quality-quick-stat">
                                    <div className="quality-quick-stat-value">{dismissedCount}</div>
                                    <div className="quality-quick-stat-label">{t('quality.dismissed')}</div>
                                </div>
                            )}
                        </div>

                        {/* Issue Summary */}
                        <div className="quality-summary">
                            <div className="quality-summary-title">{t('quality.issues')} by Severity</div>
                            {validationResults.categoryCounts.critical > 0 && (
                                <div className="quality-summary-item">
                                    <span className="quality-summary-icon" aria-hidden="true">🔴</span>
                                    <span>{t('quality.severityLevels.critical')}</span>
                                    <span className="quality-summary-count">
                                        {validationResults.categoryCounts.critical}
                                    </span>
                                </div>
                            )}
                            {validationResults.categoryCounts.warning > 0 && (
                                <div className="quality-summary-item">
                                    <span className="quality-summary-icon" aria-hidden="true">🟠</span>
                                    <span>{t('quality.severityLevels.warning')}</span>
                                    <span className="quality-summary-count">
                                        {validationResults.categoryCounts.warning}
                                    </span>
                                </div>
                            )}
                            {validationResults.categoryCounts.quality > 0 && (
                                <div className="quality-summary-item">
                                    <span className="quality-summary-icon" aria-hidden="true">🟡</span>
                                    <span>{t('quality.severityLevels.quality')}</span>
                                    <span className="quality-summary-count">
                                        {validationResults.categoryCounts.quality}
                                    </span>
                                </div>
                            )}
                            {validationResults.categoryCounts.suggestion > 0 && (
                                <div className="quality-summary-item">
                                    <span className="quality-summary-icon" aria-hidden="true">🔵</span>
                                    <span>{t('quality.severityLevels.suggestion')}</span>
                                    <span className="quality-summary-count">
                                        {validationResults.categoryCounts.suggestion}
                                    </span>
                                </div>
                            )}
                            {activeIssues.length === 0 && (
                                <div className="quality-summary-item">
                                    <span className="quality-summary-icon" aria-hidden="true">✓</span>
                                    <span>{t('quality.noIssues')}</span>
                                </div>
                            )}
                        </div>

                        {/* Batch Mode Toggle */}
                        <div className="quality-batch-toggle">
                            <button
                                className={`quality-filter-btn ${batchMode ? 'active' : ''}`}
                                onClick={() => {
                                    setBatchMode(!batchMode);
                                    setSelectedIssueIds(new Set());
                                }}
                                aria-pressed={batchMode}
                                aria-label={batchMode ? "Exit batch mode" : "Enter batch mode"}
                            >
                                {batchMode ? '✓ Batch Mode' : '◻ Batch Mode'}
                            </button>
                        </div>

                        {/* Validation Timestamp */}
                        {validationResults.lastValidated && (
                            <div className="quality-validation-timestamp">
                                Last checked<br />
                                {new Date(validationResults.lastValidated).toLocaleString()}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Issues List */}
                    <div className="quality-right-panel">
                        {/* Batch Mode Toolbar */}
                        {batchMode && activeIssues.length > 0 && (
                            <BatchOperationBar
                                issues={activeIssues}
                                selectedIssueIds={selectedIssueIds}
                                onSelectAll={handleSelectAll}
                                onDeselectAll={handleDeselectAll}
                                onSelectBySeverity={handleSelectBySeverity}
                                onSelectByCategory={handleSelectByCategory}
                                onSelectFixable={handleSelectFixable}
                                onApplyBatchFixes={handleApplyBatchFixes}
                                onDismissBatchIssues={handleDismissBatchIssues}
                                isProcessing={isProcessing}
                            />
                        )}

                        {/* Issues List */}
                        <IssueList
                            issues={activeIssues}
                            onDismiss={onDismissIssue}
                            onGoToProfile={onNavigateToProfile}
                            onApplyQuickFix={onApplyQuickFix}
                            enableBatchSelect={batchMode}
                            selectedIssueIds={selectedIssueIds}
                            onToggleBatchSelect={handleToggleBatchSelect}
                            onNavigateToProfile={onNavigateToProfile}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="quality-modal-footer">
                    <div className="quality-footer-status">
                        {activeIssues.length > 0
                            ? `${activeIssues.length} issue${activeIssues.length !== 1 ? 's' : ''} found`
                            : 'No issues found'}
                    </div>
                    <div className="quality-footer-actions">
                        <button
                            className="quality-footer-btn"
                            onClick={handleClose}
                            aria-label="Close quality report"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
