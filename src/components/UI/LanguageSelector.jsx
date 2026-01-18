import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext.jsx';
import '../../styles/language-selector.css';

const LANGUAGE_LABELS = {
    en: 'English',
    de: 'Deutsch'
};

const LanguageSelector = () => {
    const { locale, setLocale, supportedLocales } = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="language-selector" ref={dropdownRef}>
            <button
                className={`btn-icon ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Change Language"
            >
                <Languages size={20} />
            </button>

            {isOpen && (
                <div className="language-menu">
                    <div className="language-menu-title">Select Language</div>
                    {Object.entries(supportedLocales).map(([code, data]) => (
                        <button
                            key={code}
                            className={`language-option ${locale === code ? 'active' : ''}`}
                            onClick={() => {
                                setLocale(code);
                                setIsOpen(false);
                            }}
                        >
                            <span className="language-label">
                                {data.nativeName}
                            </span>
                            {locale === code && <Check size={16} className="check-icon" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
