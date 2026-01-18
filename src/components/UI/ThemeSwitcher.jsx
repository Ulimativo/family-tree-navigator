import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../../context/ThemeContext.jsx';
import '../../styles/theme-switcher.css';

const THEME_LABELS = {
    [THEMES.MODERN]: 'Modern Minimalist',
    [THEMES.CLASSIC]: 'Classic Parchment',
    [THEMES.ORGANIC]: 'Organic Roots',
    [THEMES.SLATE]: 'Slate Professional',
    [THEMES.TOKYO]: 'Tokyo Noir'
};

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
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
        <div className="theme-switcher" ref={dropdownRef}>
            <button
                className={`btn-icon ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Change Theme"
            >
                <Palette size={20} />
            </button>

            {isOpen && (
                <div className="theme-menu">
                    <div className="theme-menu-title">Select Theme</div>
                    {Object.values(THEMES).map((t) => {
                        const isDisabled = t !== THEMES.CLASSIC;
                        return (
                            <button
                                key={t}
                                className={`theme-option ${theme === t ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => {
                                    if (!isDisabled) {
                                        setTheme(t);
                                        setIsOpen(false);
                                    }
                                }}
                                disabled={isDisabled}
                                style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <span className="theme-color-preview" data-theme-preview={t}></span>
                                <span className="theme-label">
                                    {THEME_LABELS[t]}
                                    {isDisabled && (
                                        <span style={{
                                            marginLeft: '0.5rem',
                                            fontSize: '0.7rem',
                                            color: 'var(--primary-color)',
                                            fontWeight: 'bold'
                                        }}>
                                            (Coming Soon)
                                        </span>
                                    )}
                                </span>
                                {theme === t && <Check size={16} className="check-icon" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
