import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './locales/en.json';
import de from './locales/de.json';

const LocaleContext = createContext(null);

const SUPPORTED_LOCALES = {
    en: { name: 'English', nativeName: 'English', translations: en },
    de: { name: 'German', nativeName: 'Deutsch', translations: de }
};

const getInitialLocale = () => {
    // Try localStorage first
    const saved = localStorage.getItem('familytree-locale');
    if (saved && SUPPORTED_LOCALES[saved]) {
        return saved;
    }

    // Try browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && SUPPORTED_LOCALES[browserLang]) {
        return browserLang;
    }

    // Default to English
    return 'en';
};

export const LocaleProvider = ({ children }) => {
    const [locale, setLocale] = useState(() => getInitialLocale());

    useEffect(() => {
        localStorage.setItem('familytree-locale', locale);
    }, [locale]);

    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = SUPPORTED_LOCALES[locale].translations;

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                console.warn(`Translation missing: ${locale}.${key}`);
                return key; // Fallback shows key
            }
        }

        // Interpolation: "Hello {name}" with params = { name: "World" }
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (_, paramKey) =>
                params[paramKey] ?? `{${paramKey}}`
            );
        }

        return value;
    };

    const value = {
        locale,
        setLocale,
        t,
        supportedLocales: SUPPORTED_LOCALES
    };

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
