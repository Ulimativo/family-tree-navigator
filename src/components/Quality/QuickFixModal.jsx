/**
 * QuickFixModal Component
 * Dedicated modal for applying fixes to quality issues
 */

import React, { useState, useEffect } from 'react';
import { getSeverityIcon } from '../../lib/gedcom/quality/scoring.js';
import '../../styles/quality.css';

export const QuickFixModal = ({
    issue,
    isOpen,
    onClose,
    onApplyFix
}) => {
    const [fixData, setFixData] = useState({});
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (issue && isOpen) {
            // Initialize fix data from issue metadata
            setFixData({
                givenName: '',
                surname: '',
                prefix: '',
                suffix: '',
                correctedDate: '',
                day: '',
                month: '',
                year: '',
                city: '',
                stateProvince: '',
                country: '',
                adjustParent: true,
                newParentBirthDate: '',
                newChildBirthDate: '',
                birthDate: '',
                ...issue.metadata
            });
        }
    }, [issue, isOpen]);

    if (!isOpen || !issue) {
        return null;
    }

    const handleApply = async () => {
        setIsApplying(true);
        try {
            if (onApplyFix) {
                await onApplyFix(issue.id, fixData);
            }
            onClose();
        } catch (error) {
            console.error('Error applying fix:', error);
        } finally {
            setIsApplying(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen]);

    return (
        <div className="quality-modal-overlay" onClick={onClose}>
            <div className="quality-quick-fix-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="quality-quick-fix-header">
                    <div className="quality-quick-fix-header-content">
                        <div className="quality-quick-fix-icon">
                            {getSeverityIcon(issue.severity)}
                        </div>
                        <div>
                            <h3 className="quality-quick-fix-title">{issue.title}</h3>
                            <p className="quality-quick-fix-subtitle">{issue.message}</p>
                        </div>
                    </div>
                    <button
                        className="quality-modal-close"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close fix modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="quality-quick-fix-body">
                    {/* Entity Info */}
                    {issue.entityName && (
                        <div className="quality-quick-fix-entity-info">
                            <span className="quality-quick-fix-entity-label">Entity:</span>
                            <span className="quality-quick-fix-entity-name">{issue.entityName}</span>
                            <span className="quality-quick-fix-entity-id">({issue.entityId})</span>
                        </div>
                    )}

                    {/* Form Fields Based on Rule Type */}
                    <div className="quality-quick-fix-form-content">
                        {/* MISSING_BIRTH Form */}
                        {issue.ruleId === 'MISSING_BIRTH' && (
                            <div className="quality-form-group">
                                <label className="quality-form-label">
                                    Birth Date <span className="quality-form-required">*</span>
                                </label>
                                <input
                                    className="quality-form-input"
                                    type="text"
                                    value={fixData.birthDate || ''}
                                    onChange={(e) => setFixData({...fixData, birthDate: e.target.value})}
                                    placeholder="e.g., 1 JAN 1900"
                                    autoFocus
                                />
                                <p className="quality-form-hint">
                                    Format: Day (optional), Month (3-letter), Year
                                </p>
                            </div>
                        )}

                        {/* MISSING_NAME Form */}
                        {issue.ruleId === 'MISSING_NAME' && (
                            <>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">
                                        Given Name <span className="quality-form-required">*</span>
                                    </label>
                                    <input
                                        className="quality-form-input"
                                        type="text"
                                        value={fixData.givenName || ''}
                                        onChange={(e) => setFixData({...fixData, givenName: e.target.value})}
                                        placeholder="Enter given name..."
                                        autoFocus
                                    />
                                </div>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">
                                        Surname <span className="quality-form-required">*</span>
                                    </label>
                                    <input
                                        className="quality-form-input"
                                        type="text"
                                        value={fixData.surname || ''}
                                        onChange={(e) => setFixData({...fixData, surname: e.target.value})}
                                        placeholder="Enter surname..."
                                    />
                                </div>
                                <div className="quality-form-row">
                                    <div className="quality-form-group">
                                        <label className="quality-form-label">Prefix (Optional)</label>
                                        <input
                                            className="quality-form-input"
                                            type="text"
                                            value={fixData.prefix || ''}
                                            onChange={(e) => setFixData({...fixData, prefix: e.target.value})}
                                            placeholder="e.g., von, de, van..."
                                        />
                                    </div>
                                    <div className="quality-form-group">
                                        <label className="quality-form-label">Suffix (Optional)</label>
                                        <input
                                            className="quality-form-input"
                                            type="text"
                                            value={fixData.suffix || ''}
                                            onChange={(e) => setFixData({...fixData, suffix: e.target.value})}
                                            placeholder="e.g., Jr., Sr., III..."
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* NON_STANDARD_DATE Form */}
                        {issue.ruleId === 'NON_STANDARD_DATE' && (
                            <>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">Current Date</label>
                                    <div className="quality-form-readonly">
                                        {fixData.currentDate || 'N/A'}
                                    </div>
                                </div>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">
                                        Corrected Date <span className="quality-form-required">*</span>
                                    </label>
                                    <input
                                        className="quality-form-input"
                                        type="text"
                                        value={fixData.correctedDate || ''}
                                        onChange={(e) => setFixData({...fixData, correctedDate: e.target.value})}
                                        placeholder="e.g., 1 JAN 2000"
                                        autoFocus
                                    />
                                    <p className="quality-form-hint">
                                        Format: Day (optional), Month (3-letter), Year
                                    </p>
                                </div>
                            </>
                        )}

                        {/* INCOMPLETE_DATE Form */}
                        {issue.ruleId === 'INCOMPLETE_DATE' && (
                            <>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">Current Date</label>
                                    <div className="quality-form-readonly">
                                        {fixData.currentDate || 'N/A'}
                                    </div>
                                </div>
                                <div className="quality-form-row">
                                    <div className="quality-form-group">
                                        <label className="quality-form-label">Day</label>
                                        <input
                                            className="quality-form-input"
                                            type="text"
                                            value={fixData.day || ''}
                                            onChange={(e) => setFixData({...fixData, day: e.target.value})}
                                            placeholder="1-31"
                                            maxLength="2"
                                        />
                                    </div>
                                    <div className="quality-form-group">
                                        <label className="quality-form-label">Month</label>
                                        <input
                                            className="quality-form-input"
                                            type="text"
                                            value={fixData.month || ''}
                                            onChange={(e) => setFixData({...fixData, month: e.target.value.toUpperCase()})}
                                            placeholder="JAN-DEC"
                                            maxLength="3"
                                        />
                                    </div>
                                    <div className="quality-form-group">
                                        <label className="quality-form-label">Year</label>
                                        <input
                                            className="quality-form-input"
                                            type="text"
                                            value={fixData.year || ''}
                                            onChange={(e) => setFixData({...fixData, year: e.target.value})}
                                            placeholder="YYYY"
                                            maxLength="4"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* EMPTY_PLACE Form */}
                        {issue.ruleId === 'EMPTY_PLACE' && (
                            <>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">Current Place</label>
                                    <div className="quality-form-readonly">
                                        {fixData.currentPlace || 'N/A'}
                                    </div>
                                </div>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">City/Town</label>
                                    <input
                                        className="quality-form-input"
                                        type="text"
                                        value={fixData.city || ''}
                                        onChange={(e) => setFixData({...fixData, city: e.target.value})}
                                        placeholder="Enter city or town..."
                                        autoFocus
                                    />
                                </div>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">State/Province</label>
                                    <input
                                        className="quality-form-input"
                                        type="text"
                                        value={fixData.stateProvince || ''}
                                        onChange={(e) => setFixData({...fixData, stateProvince: e.target.value})}
                                        placeholder="Enter state or province..."
                                    />
                                </div>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">Country</label>
                                    <input
                                        className="quality-form-input"
                                        type="text"
                                        value={fixData.country || ''}
                                        onChange={(e) => setFixData({...fixData, country: e.target.value})}
                                        placeholder="Enter country..."
                                    />
                                </div>
                            </>
                        )}

                        {/* CHILD_BEFORE_PARENT Form */}
                        {issue.ruleId === 'CHILD_BEFORE_PARENT' && (
                            <>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">Issue Details</label>
                                    <div className="quality-form-readonly">
                                        Parent birth: {fixData.parentBirthDate || 'Unknown'} | Child birth: {fixData.childBirthDate || 'Unknown'}
                                    </div>
                                </div>
                                <div className="quality-form-group">
                                    <label className="quality-form-label">Adjustment Option</label>
                                    <div className="quality-form-radio-group">
                                        <label className="quality-form-radio-label">
                                            <input
                                                type="radio"
                                                name="adjustSelection"
                                                value="parent"
                                                checked={fixData.adjustParent}
                                                onChange={() => setFixData({...fixData, adjustParent: true})}
                                            />
                                            <span>Adjust parent birth date</span>
                                        </label>
                                        {fixData.adjustParent && (
                                            <input
                                                className="quality-form-input"
                                                type="text"
                                                value={fixData.newParentBirthDate || ''}
                                                onChange={(e) => setFixData({...fixData, newParentBirthDate: e.target.value})}
                                                placeholder="e.g., 1 JAN 1900"
                                                style={{ marginTop: '8px' }}
                                            />
                                        )}
                                    </div>
                                    <div className="quality-form-radio-group">
                                        <label className="quality-form-radio-label">
                                            <input
                                                type="radio"
                                                name="adjustSelection"
                                                value="child"
                                                checked={!fixData.adjustParent}
                                                onChange={() => setFixData({...fixData, adjustParent: false})}
                                            />
                                            <span>Adjust child birth date</span>
                                        </label>
                                        {!fixData.adjustParent && (
                                            <input
                                                className="quality-form-input"
                                                type="text"
                                                value={fixData.newChildBirthDate || ''}
                                                onChange={(e) => setFixData({...fixData, newChildBirthDate: e.target.value})}
                                                placeholder="e.g., 1 JAN 1950"
                                                style={{ marginTop: '8px' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Basic confirmation forms */}
                        {issue.ruleId === 'EMPTY_NAME_VALUE' && (
                            <div className="quality-form-group">
                                <label className="quality-form-label">Action</label>
                                <div className="quality-form-readonly">
                                    This action will remove the empty name record at index {fixData.nameIndex}
                                </div>
                            </div>
                        )}

                        {issue.ruleId === 'WHITESPACE_ONLY' && (
                            <div className="quality-form-group">
                                <label className="quality-form-label">Action</label>
                                <div className="quality-form-readonly">
                                    This action will clear the {fixData.fieldName} field
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="quality-quick-fix-footer">
                    <button
                        className="quality-form-btn cancel"
                        onClick={onClose}
                        disabled={isApplying}
                    >
                        Cancel
                    </button>
                    <button
                        className="quality-form-btn apply"
                        onClick={handleApply}
                        disabled={isApplying}
                    >
                        {isApplying ? 'Applying...' : 'Apply Fix'}
                    </button>
                </div>
            </div>
        </div>
    );
};
