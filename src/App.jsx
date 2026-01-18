import React, { useState, useEffect } from 'react'
import './App.css'
import { TreeProvider, useTree } from './context/TreeContext.jsx'
import TreeView from './components/Tree/TreeView.jsx'
import ProfileView from './components/Profile/ProfileView.jsx'
import PersonSidebar from './components/Navigation/PersonSidebar.jsx'
import ThemeSwitcher from './components/UI/ThemeSwitcher.jsx'
import StatisticsDashboard from './components/Visualization/StatisticsDashboard.jsx'
import DynastyDashboard from './components/Clustering/DynastyDashboard.jsx'
import { BarChart2, Layers, Zap, Database, X as CloseIcon } from 'lucide-react';
import { ProjectMode } from './lib/gedcom/models.js';
import { ProjectExporter } from './lib/gedcom/exporter.js';

const ImportModal = ({ onSelectMode, onClose }) => {
    const [selectedMode, setSelectedMode] = useState(ProjectMode.LIGHTWEIGHT);

    return (
        <div className="modal-overlay">
            <div className="import-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Project Configuration</h2>
                    <button className="btn-icon" onClick={onClose}><CloseIcon size={20} /></button>
                </div>
                <p className="text-muted">Choose how you want to work with this family tree.</p>

                <div className="tier-selection">
                    <div
                        className={`tier-card ${selectedMode === ProjectMode.LIGHTWEIGHT ? 'active' : ''}`}
                        onClick={() => setSelectedMode(ProjectMode.LIGHTWEIGHT)}
                    >
                        <div className="tier-icon"><Zap size={24} /></div>
                        <h3>Lightweight</h3>
                        <p>Browser-only. Best for a quick, privacy-focused look at your GEDCOM file.</p>
                        <ul className="tier-features">
                            <li>Visual Tree Browsing</li>
                            <li>Standard GEDCOM Editing</li>
                            <li>Import/Export GEDCOM</li>
                        </ul>
                    </div>

                    <div
                        className={`tier-card ${selectedMode === ProjectMode.PERSISTENT ? 'active' : ''}`}
                        onClick={() => { }}
                        style={{ opacity: 0.6, cursor: 'not-allowed', position: 'relative' }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                        }}>
                            COMING SOON
                        </div>
                        <div className="tier-icon"><Database size={24} /></div>
                        <h3>Persistent Project</h3>
                        <p>Cloud-synced workspace. Enables advanced features and persistent storage.</p>
                        <ul className="tier-features">
                            <li>Advanced Dynasties</li>
                            <li>Heir Tracking</li>
                            <li>Cloud Sync (Firebase)</li>
                            <li>Media & Photos</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-icon" onClick={onClose} style={{ borderRadius: '0.5rem', padding: '0.75rem 1.5rem' }}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={() => onSelectMode(selectedMode)}
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        Start Project
                    </button>
                </div>
            </div>
        </div>
    );
};

const AppContent = () => {
    const {
        data,
        loadGedcom,
        focalPersonId,
        setFocalPersonId,
        selectedPersonId,
        setSelectedPersonId
    } = useTree();

    const [showStats, setShowStats] = useState(false);
    const [showDynasty, setShowDynasty] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [pendingGedcom, setPendingGedcom] = useState(null);
    const [pendingFilename, setPendingFilename] = useState('');

    const selectedPerson = data?.individuals.find(i => i.id === selectedPersonId);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setPendingFilename(file.name.replace(/\.[^/.]+$/, ""));
        const reader = new FileReader();
        reader.onload = (e) => {
            setPendingGedcom(e.target.result);
            setShowImportModal(true);
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleConfirmImport = (mode) => {
        loadGedcom(pendingGedcom, mode, pendingFilename);
        setShowImportModal(false);
        setPendingGedcom(null);
        setPendingFilename('');
    };

    const handleExport = (format) => {
        const exporter = new ProjectExporter();
        let content, filename, type;

        if (format === 'json') {
            content = exporter.exportJSON(data);
            filename = `${data.name || 'project'}.json`;
            type = 'application/json';
        } else {
            content = exporter.exportGedcom(data);
            filename = `${data.name || 'project'}.ged`;
            type = 'text/plain';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        setShowExportDropdown(false);
    };

    const handleSelectPerson = (id) => {
        setFocalPersonId(id);
        setSelectedPersonId(id);
    };

    return (
        <div className="app-container">
            {showImportModal && (
                <ImportModal
                    onSelectMode={handleConfirmImport}
                    onClose={() => setShowImportModal(false)}
                />
            )}
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1>Family Tree Navigator</h1>
                    <ThemeSwitcher />
                    <button
                        className="btn-icon"
                        onClick={() => setShowStats(true)}
                        title="View Statistics"
                    >
                        <BarChart2 size={20} />
                    </button>
                    <button
                        className="btn-icon"
                        onClick={() => setShowDynasty(true)}
                        title="Dynasty & Clusters"
                    >
                        <Layers size={20} />
                    </button>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                    <input
                        type="file"
                        id="gedcom-upload"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        accept=".ged"
                    />
                    <button
                        className="btn-secondary"
                        onClick={() => document.getElementById('gedcom-upload').click()}
                    >
                        Import
                    </button>

                    {data && (
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn-primary"
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                            >
                                Export
                            </button>
                            {showExportDropdown && (
                                <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: '160px', padding: '0.5rem' }}>
                                    <button
                                        className="dropdown-item"
                                        style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '0.3rem' }}
                                        onClick={() => handleExport('json')}
                                    >
                                        JSON Project (Full)
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '0.3rem' }}
                                        onClick={() => handleExport('gedcom')}
                                    >
                                        GEDCOM (Standard)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>
            <main className="app-main">
                {data ? (
                    <>
                        <PersonSidebar
                            individuals={data.individuals}
                            families={data.families}
                            onSelectPerson={handleSelectPerson}
                            selectedId={selectedPersonId}
                        />
                        <div className="viewport">
                            <TreeView
                                data={data}
                                focalPersonId={focalPersonId}
                                onNodeClick={handleSelectPerson}
                            />
                            {selectedPerson && (
                                <ProfileView
                                    person={selectedPerson}
                                    families={data.families}
                                    individuals={data.individuals}
                                    onClose={() => setSelectedPersonId(null)}
                                    onNavigate={handleSelectPerson}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="welcome-screen">
                        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Discover Your Family Legacy
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                                A modern, privacy-focused genealogy explorer with powerful visualization and analysis tools
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem', textAlign: 'left' }}>
                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌳</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Interactive Tree</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Navigate through generations with an intuitive, dynamic family tree visualization
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Deep Analytics</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Uncover patterns with dynasty analysis, demographics, and statistical insights
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Privacy First</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        All processing happens in your browser. Your data never leaves your device
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>GEDCOM 7.0</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Full support for the latest GEDCOM standard with 140+ attribute types
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Lightning Fast</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Instant loading and smooth interactions, even with thousands of individuals
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Beautiful Design</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Elegant Classic Parchment theme designed for extended research sessions
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '2px dashed var(--border)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Ready to Begin?</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Import your GEDCOM file to start exploring your family history
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={() => document.getElementById('gedcom-upload').click()}
                                    style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                                >
                                    Import GEDCOM File
                                </button>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                                    Supports .ged files from Ancestry, FamilySearch, MyHeritage, and more
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {showStats && <StatisticsDashboard onClose={() => setShowStats(false)} />}
            {showDynasty && <DynastyDashboard onClose={() => setShowDynasty(false)} />}
        </div>
    );
};

function App() {
    return (
        <TreeProvider>
            <AppContent />
        </TreeProvider>
    )
}

export default App
