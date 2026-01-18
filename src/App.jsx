import React, { useState, useEffect } from 'react'
import './App.css'
import { TreeProvider, useTree } from './context/TreeContext.jsx'
import TreeView from './components/Tree/TreeView.jsx'
import ProfileView from './components/Profile/ProfileView.jsx'
import PersonSidebar from './components/Navigation/PersonSidebar.jsx'
import ThemeSwitcher from './components/UI/ThemeSwitcher.jsx'
import LanguageSelector from './components/UI/LanguageSelector.jsx'
import StatisticsDashboard from './components/Visualization/StatisticsDashboard.jsx'
import DynastyDashboard from './components/Clustering/DynastyDashboard.jsx'
import { BarChart2, Layers, Zap, Database, X as CloseIcon } from 'lucide-react';
import { ProjectMode } from './lib/gedcom/models.js';
import { ProjectExporter } from './lib/gedcom/exporter.js';
import { useTranslation } from './i18n/useTranslation.js';

const ImportModal = ({ onSelectMode, onClose }) => {
    const [selectedMode, setSelectedMode] = useState(ProjectMode.LIGHTWEIGHT);
    const { t } = useTranslation();

    return (
        <div className="modal-overlay">
            <div className="import-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>{t('modal.projectConfiguration')}</h2>
                    <button className="btn-icon" onClick={onClose}><CloseIcon size={20} /></button>
                </div>
                <p className="text-muted">{t('modal.chooseWorkflow')}</p>

                <div className="tier-selection">
                    <div
                        className={`tier-card ${selectedMode === ProjectMode.LIGHTWEIGHT ? 'active' : ''}`}
                        onClick={() => setSelectedMode(ProjectMode.LIGHTWEIGHT)}
                    >
                        <div className="tier-icon"><Zap size={24} /></div>
                        <h3>{t('modal.lightweightTitle')}</h3>
                        <p>{t('modal.lightweightDesc')}</p>
                        <ul className="tier-features">
                            <li>{t('modal.lightweightFeature1')}</li>
                            <li>{t('modal.lightweightFeature2')}</li>
                            <li>{t('modal.lightweightFeature3')}</li>
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
                            {t('modal.comingSoon')}
                        </div>
                        <div className="tier-icon"><Database size={24} /></div>
                        <h3>{t('modal.persistentTitle')}</h3>
                        <p>{t('modal.persistentDesc')}</p>
                        <ul className="tier-features">
                            <li>{t('modal.persistentFeature1')}</li>
                            <li>{t('modal.persistentFeature2')}</li>
                            <li>{t('modal.persistentFeature3')}</li>
                            <li>{t('modal.persistentFeature4')}</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-icon" onClick={onClose} style={{ borderRadius: '0.5rem', padding: '0.75rem 1.5rem' }}>{t('common.cancel')}</button>
                    <button
                        className="btn-primary"
                        onClick={() => onSelectMode(selectedMode)}
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        {t('modal.startProject')}
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
    const { t } = useTranslation();

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
                <div className="header-left">
                    <h1>{t('header.title')}</h1>
                    <ThemeSwitcher />
                    <LanguageSelector />
                    <button
                        className="btn-icon"
                        onClick={() => setShowStats(true)}
                        title={t('header.statistics')}
                    >
                        <BarChart2 size={20} />
                    </button>
                    <button
                        className="btn-icon"
                        onClick={() => setShowDynasty(true)}
                        title={t('header.dynasty')}
                    >
                        <Layers size={20} />
                    </button>
                </div>
                <div className="header-actions">
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
                        {t('header.import')}
                    </button>

                    {data && (
                        <div className="export-dropdown-container">
                            <button
                                className="btn-primary btn-export"
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                title={t('header.export')}
                            >
                                {t('header.export')}
                            </button>
                            {showExportDropdown && (
                                <div className="export-dropdown-menu">
                                    <button
                                        className="dropdown-item"
                                        onClick={() => handleExport('json')}
                                    >
                                        {t('export.exportJson')}
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => handleExport('gedcom')}
                                    >
                                        {t('export.exportGedcom')}
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
                                {t('welcome.title')}
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                                {t('welcome.subtitle')}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem', textAlign: 'left' }}>
                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌳</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature1Title')}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {t('welcome.feature1Desc')}
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature2Title')}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {t('welcome.feature2Desc')}
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature3Title')}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {t('welcome.feature3Desc')}
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature4Title')}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {t('welcome.feature4Desc')}
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature5Title')}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {t('welcome.feature5Desc')}
                                    </p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature6Title')}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {t('welcome.feature6Desc')}
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '2px dashed var(--border)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>{t('welcome.readyBegin')}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    {t('welcome.importDesc')}
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={() => document.getElementById('gedcom-upload').click()}
                                    style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                                >
                                    {t('welcome.importGedcom')}
                                </button>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                                    {t('welcome.supportsFormats')}
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
