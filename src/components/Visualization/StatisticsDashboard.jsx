
import React, { useMemo } from 'react';
import { X, Users, Activity, Clock, Award, BarChart2 } from 'lucide-react';
import { useTree } from '../../context/TreeContext.jsx';
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

    const stats = useMemo(() => computeStatistics(data), [data]);

    if (!stats) return null;

    return (
        <div className="stats-overlay">
            <div className="stats-modal">
                <div className="stats-header">
                    <h2><BarChart2 className="header-icon" /> Family Insights</h2>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="stats-grid">
                    {/* Big Stats */}
                    <StatCard
                        title="Individuals"
                        value={stats.counts.individuals}
                        icon={Users}
                        colorClass="blue"
                    />
                    <StatCard
                        title="Families"
                        value={stats.counts.families}
                        icon={Users}
                        colorClass="indigo"
                    />
                    <StatCard
                        title="Avg. Lifespan"
                        value={stats.longevity.average ? `${stats.longevity.average} yrs` : 'N/A'}
                        icon={Activity}
                        colorClass="green"
                    />
                    <StatCard
                        title="Avg. Children"
                        value={stats.fertility.averageChildren}
                        icon={Users}
                        colorClass="purple"
                    />
                </div>

                <div className="stats-row">
                    <div className="stats-section">
                        <h3><Award size={18} /> Hall of Fame</h3>
                        <div className="fact-list">
                            <div className="fact-item">
                                <span className="fact-label">Oldest Person</span>
                                <span className="fact-value">{stats.longevity.oldest.name} ({stats.longevity.oldest.age} yrs)</span>
                            </div>
                            <div className="fact-item">
                                <span className="fact-label">Most Children</span>
                                <span className="fact-value">
                                    {stats.fertility.mostChildren.parents.join(' & ')}
                                    <span className="highlight">({stats.fertility.mostChildren.count})</span>
                                </span>
                            </div>
                            <div className="fact-item">
                                <span className="fact-label">Earliest Record</span>
                                <span className="fact-value">{stats.timeline.earliestBirth.year} ({stats.timeline.earliestBirth.name})</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-section">
                        <h3><Users size={18} /> Demographics</h3>
                        <div className="gender-bar-container">
                            <div className="gender-labels">
                                <span>Male ({stats.gender.male})</span>
                                <span>Female ({stats.gender.female})</span>
                            </div>
                            <div className="gender-bar">
                                <div
                                    className="bar-segment male"
                                    style={{ flex: stats.gender.male }}
                                    title={`Male: ${stats.gender.male}`}
                                />
                                <div
                                    className="bar-segment female"
                                    style={{ flex: stats.gender.female }}
                                    title={`Female: ${stats.gender.female}`}
                                />
                            </div>
                        </div>

                        <div className="fact-list mt-4">
                            <div className="fact-item">
                                <span className="fact-label">Top Surnames</span>
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
