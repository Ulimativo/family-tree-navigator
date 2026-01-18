
import React, { useMemo } from 'react';
import { X, Users, Activity, Clock, Award, BarChart2 } from 'lucide-react';
import { useTree } from '../../context/TreeContext.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import { computeStatistics } from '../../lib/analysis/statistics.js';
import '../../styles/statistics.css';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className={`stat-card ${colorClass}`}>
        <div className="stat-icon-wrapper">
            <Icon size={24} />
        </div>
        <div className="stat-content">
            <h4 className="stat-value">{value}</h4>
            <span className="stat-title">{title}</span>
            {subtext && <span className="stat-subtext">{subtext}</span>}
        </div>
    </div>
);

const StatisticsDashboard = ({ onClose }) => {
    const { data } = useTree();
    const { t } = useTranslation();

    const stats = useMemo(() => computeStatistics(data), [data]);

    if (!stats) return null;

    return (
        <div className="stats-overlay">
            <div className="stats-modal">
                <div className="stats-header">
                    <h2><BarChart2 className="header-icon" /> {t('statistics.title')}</h2>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="stats-grid">
                    {/* Big Stats */}
                    <StatCard
                        title={t('statistics.individuals')}
                        value={stats.counts.individuals}
                        icon={Users}
                        colorClass="blue"
                    />
                    <StatCard
                        title={t('statistics.families')}
                        value={stats.counts.families}
                        icon={Users}
                        colorClass="indigo"
                    />
                    <StatCard
                        title={t('statistics.avgLifespan')}
                        value={stats.longevity.average ? `${stats.longevity.average} ${t('statistics.years')}` : t('statistics.notAvailable')}
                        icon={Activity}
                        colorClass="green"
                    />
                    <StatCard
                        title={t('statistics.avgChildren')}
                        value={stats.fertility.averageChildren}
                        icon={Users}
                        colorClass="purple"
                    />
                </div>

                <div className="stats-row">
                    <div className="stats-section">
                        <h3><Award size={18} /> {t('statistics.hallOfFame')}</h3>
                        <div className="fact-list">
                            <div className="fact-item">
                                <span className="fact-label">{t('statistics.oldestPerson')}</span>
                                <span className="fact-value">{stats.longevity.oldest.name} ({stats.longevity.oldest.age} {t('statistics.years')})</span>
                            </div>
                            <div className="fact-item">
                                <span className="fact-label">{t('statistics.mostChildren')}</span>
                                <span className="fact-value">
                                    {stats.fertility.mostChildren.parents.join(' & ')}
                                    <span className="highlight">({stats.fertility.mostChildren.count})</span>
                                </span>
                            </div>
                            <div className="fact-item">
                                <span className="fact-label">{t('statistics.earliestRecord')}</span>
                                <span className="fact-value">{stats.timeline.earliestBirth.year} ({stats.timeline.earliestBirth.name})</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-section">
                        <h3><Users size={18} /> {t('statistics.demographics')}</h3>
                        <div className="gender-bar-container">
                            <div className="gender-labels">
                                <span>{t('statistics.male')} ({stats.gender.male})</span>
                                <span>{t('statistics.female')} ({stats.gender.female})</span>
                            </div>
                            <div className="gender-bar">
                                <div
                                    className="bar-segment male"
                                    style={{ flex: stats.gender.male }}
                                    title={`${t('statistics.male')}: ${stats.gender.male}`}
                                />
                                <div
                                    className="bar-segment female"
                                    style={{ flex: stats.gender.female }}
                                    title={`${t('statistics.female')}: ${stats.gender.female}`}
                                />
                            </div>
                        </div>

                        <div className="fact-list mt-4">
                            <div className="fact-item">
                                <span className="fact-label">{t('statistics.topSurnames')}</span>
                                <div className="tags-cloud">
                                    {stats.topSurnames.map(s => (
                                        <span key={s.name} className="surname-tag">{s.name} ({s.count})</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsDashboard;
