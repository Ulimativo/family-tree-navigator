import React from 'react';
import '../styles/welcome.css';

const WelcomeScreen = ({ onImportClick }) => {
    const features = [
        {
            icon: '🌳',
            title: 'Interactive Tree',
            description: 'Navigate through generations with an intuitive, dynamic family tree visualization'
        },
        {
            icon: '📊',
            title: 'Deep Analytics',
            description: 'Uncover patterns with dynasty analysis, demographics, and statistical insights'
        },
        {
            icon: '🔒',
            title: 'Privacy First',
            description: 'All processing happens in your browser. Your data never leaves your device'
        },
        {
            icon: '📝',
            title: 'GEDCOM 7.0',
            description: 'Full support for the latest GEDCOM standard with 140+ attribute types'
        },
        {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Instant loading and smooth interactions, even with thousands of individuals'
        },
        {
            icon: '🎨',
            title: 'Beautiful Design',
            description: 'Elegant Classic Parchment theme designed for extended research sessions'
        }
    ];

    return (
        <div className="welcome-screen">
            <div className="welcome-content">
                <h1 className="welcome-title">
                    Discover Your Family Legacy
                </h1>
                <p className="welcome-subtitle">
                    A modern, privacy-focused genealogy explorer with powerful visualization and analysis tools
                </p>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="cta-box">
                    <h3 className="cta-title">Ready to Begin?</h3>
                    <p className="cta-description">
                        Import your GEDCOM file to start exploring your family history
                    </p>
                    <button
                        className="btn-primary cta-button"
                        onClick={onImportClick}
                    >
                        Import GEDCOM File
                    </button>
                    <p className="cta-note">
                        Supports .ged files from Ancestry, FamilySearch, MyHeritage, and more
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
