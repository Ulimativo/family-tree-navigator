import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation.js';
import '../../styles/add-relative-modal.css';

const AddRelativeModal = ({ relationType, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        givenName: '',
        surname: '',
        prefix: '',
        suffix: '',
        sex: 'U',
        birthDate: '',
        birthPlace: '',
        deathDate: '',
        deathPlace: ''
    });
    const [errors, setErrors] = useState({});
    const [expandedSections, setExpandedSections] = useState({
        birth: false,
        death: false
    });

    // Validation helpers
    const isValidDate = (dateStr) => {
        if (!dateStr) return true;
        const dateRegex = /^(\d{1,2}\s+)?(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)?\s*\d{4}$/i;
        return dateRegex.test(dateStr.trim());
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.givenName.trim() && !formData.surname.trim()) {
            newErrors.name = t('profile.validationRequired');
        }

        if (formData.birthDate && !isValidDate(formData.birthDate)) {
            newErrors.birthDate = t('profile.validationInvalidDate');
        }

        if (formData.deathDate && !isValidDate(formData.deathDate)) {
            newErrors.deathDate = t('profile.validationInvalidDate');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const personData = {
            names: [{
                value: `${formData.givenName}${formData.givenName && formData.surname ? ' /' : ''}${formData.surname ? formData.surname : ''}${formData.givenName || formData.surname ? '/' : ''}`,
                given: formData.givenName.trim(),
                surname: formData.surname.trim(),
                prefix: formData.prefix.trim(),
                suffix: formData.suffix.trim()
            }],
            sex: formData.sex,
            events: []
        };

        // Add birth event if date/place provided
        if (formData.birthDate || formData.birthPlace) {
            personData.events.push({
                tag: 'BIRT',
                date: formData.birthDate,
                place: formData.birthPlace,
                type: 'Birth',
                sources: []
            });
        }

        // Add death event if date/place provided
        if (formData.deathDate || formData.deathPlace) {
            personData.events.push({
                tag: 'DEAT',
                date: formData.deathDate,
                place: formData.deathPlace,
                type: 'Death',
                sources: []
            });
        }

        onSubmit(personData);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getRelativeTypeLabel = () => {
        const typeMap = {
            father: t('profile.addFather'),
            mother: t('profile.addMother'),
            spouse: t('profile.addSpouseButton'),
            child: t('profile.addChildButton')
        };
        return typeMap[relationType] || relationType;
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    return (
        <div className="modal-overlay" onClick={onCancel} role="presentation">
            <div className="modal-content add-relative-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="modal-header">
                    <h2 id="modal-title">{getRelativeTypeLabel()}</h2>
                    <button className="modal-close" onClick={onCancel} aria-label="Close modal" title="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Name Section */}
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="givenName">{t('profile.givenName')}</label>
                                <input
                                    id="givenName"
                                    type="text"
                                    value={formData.givenName}
                                    onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                                    placeholder={t('profile.givenName')}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="surname">{t('profile.surname')}</label>
                                <input
                                    id="surname"
                                    type="text"
                                    value={formData.surname}
                                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                    placeholder={t('profile.surname')}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {errors.name && (
                            <div className="error-message">
                                <AlertCircle size={14} />
                                {errors.name}
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="prefix">{t('profile.prefix')} ({t('common.optional')})</label>
                                <input
                                    id="prefix"
                                    type="text"
                                    value={formData.prefix}
                                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                    placeholder="e.g., Dr., Sir"
                                    className="form-input form-input-small"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="suffix">{t('profile.suffix')} ({t('common.optional')})</label>
                                <input
                                    id="suffix"
                                    type="text"
                                    value={formData.suffix}
                                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                                    placeholder="e.g., Jr., III"
                                    className="form-input form-input-small"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sex Selection */}
                    <div className="form-section">
                        <label>{t('profile.sex')}</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="sex"
                                    value="M"
                                    checked={formData.sex === 'M'}
                                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                />
                                {t('profile.sexMale')}
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="sex"
                                    value="F"
                                    checked={formData.sex === 'F'}
                                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                />
                                {t('profile.sexFemale')}
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="sex"
                                    value="U"
                                    checked={formData.sex === 'U'}
                                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                />
                                {t('profile.sexUnknown')}
                            </label>
                        </div>
                    </div>

                    {/* Birth Information (Collapsible) */}
                    <div className="form-section collapsible">
                        <button
                            className="collapsible-header"
                            onClick={() => toggleSection('birth')}
                            aria-expanded={expandedSections.birth}
                        >
                            <span>{t('profile.birth')} ({t('common.optional')})</span>
                            <span className={`collapse-icon ${expandedSections.birth ? 'expanded' : ''}`}>▼</span>
                        </button>
                        {expandedSections.birth && (
                            <div className="collapsible-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="birthDate">{t('profile.date')}</label>
                                        <input
                                            id="birthDate"
                                            type="text"
                                            value={formData.birthDate}
                                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                            placeholder={t('profile.dateFormatHint')}
                                            className="form-input"
                                        />
                                        {errors.birthDate && (
                                            <div className="error-message">
                                                <AlertCircle size={12} />
                                                {errors.birthDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="birthPlace">{t('profile.place')}</label>
                                        <input
                                            id="birthPlace"
                                            type="text"
                                            value={formData.birthPlace}
                                            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                                            placeholder="e.g., London, England"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Death Information (Collapsible) */}
                    <div className="form-section collapsible">
                        <button
                            className="collapsible-header"
                            onClick={() => toggleSection('death')}
                            aria-expanded={expandedSections.death}
                        >
                            <span>{t('profile.death')} ({t('common.optional')})</span>
                            <span className={`collapse-icon ${expandedSections.death ? 'expanded' : ''}`}>▼</span>
                        </button>
                        {expandedSections.death && (
                            <div className="collapsible-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="deathDate">{t('profile.date')}</label>
                                        <input
                                            id="deathDate"
                                            type="text"
                                            value={formData.deathDate}
                                            onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                                            placeholder={t('profile.dateFormatHint')}
                                            className="form-input"
                                        />
                                        {errors.deathDate && (
                                            <div className="error-message">
                                                <AlertCircle size={12} />
                                                {errors.deathDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="deathPlace">{t('profile.place')}</label>
                                        <input
                                            id="deathPlace"
                                            type="text"
                                            value={formData.deathPlace}
                                            onChange={(e) => setFormData({ ...formData, deathPlace: e.target.value })}
                                            placeholder="e.g., Paris, France"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onCancel} aria-label={t('common.cancel')}>
                        {t('common.cancel')}
                    </button>
                    <button className="btn-primary" onClick={handleSubmit} aria-label={`${t('common.add')} ${getRelativeTypeLabel()}`}>
                        {getRelativeTypeLabel()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRelativeModal;
