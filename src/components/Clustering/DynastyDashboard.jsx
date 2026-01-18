
import React, { useState, useMemo } from 'react';
import { Layers, X, Plus, Info, Users, MapPin, Award, Search, Trash2, Crown, UserCheck, ShieldCheck, Filter, Edit2 } from 'lucide-react';
import { useTree } from '../../context/TreeContext.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import ClusterManager from './ClusterManager.jsx';
import '../../styles/clustering.css';
import { findCommonAncestors, computeClusterStats, categorizeMembers, calculateHeir, pruneByDegrees } from '../../lib/analysis/clustering.js';

const DynastyDashboard = ({ onClose }) => {
    const { data, deleteCluster } = useTree();
    const { t } = useTranslation();
    const [selectedClusterId, setSelectedClusterId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingCluster, setEditingCluster] = useState(null);
    const [viewMode, setViewMode] = useState('house'); // 'house' | 'family'

    const clusters = data.clusters || [];
    const selectedCluster = clusters.find(c => c.id === selectedClusterId);

    const { individuals, families } = data;

    const members = useMemo(() => {
        if (!selectedCluster) return { persons: [], families: [] };
        const personIds = new Set(selectedCluster.personIds);

        // Find families where at least one member (parent or child) is in the cluster
        const relatedFamilies = families.filter(f =>
            (f.husband && personIds.has(f.husband)) ||
            (f.wife && personIds.has(f.wife)) ||
            f.children.some(cid => personIds.has(cid))
        );

        return {
            persons: individuals.filter(i => personIds.has(i.id)),
            families: relatedFamilies
        };
    }, [selectedCluster, individuals, families]);

    const commonAncestors = useMemo(() => {
        if (!selectedCluster) return [];
        return findCommonAncestors(data, Array.from(selectedCluster.personIds));
    }, [selectedCluster, data]);

    const clusterStats = useMemo(() => {
        if (!selectedCluster) return null;
        return computeClusterStats(data, Array.from(selectedCluster.personIds));
    }, [selectedCluster, data]);

    const { houseMembers, familyMembers } = useMemo(() => {
        if (!selectedCluster) return { houseMembers: [], familyMembers: [] };

        // 1. Prune if needed
        let pool = selectedCluster.personIds;
        if (selectedCluster.headOfHouseId && selectedCluster.pruningDegrees > 0) {
            pool = new Set(pruneByDegrees(data, selectedCluster.headOfHouseId, selectedCluster.pruningDegrees, selectedCluster.personIds));
        }

        // 2. Categorize
        const { memberOfHouse, memberOfFamily } = categorizeMembers(data, { ...selectedCluster, personIds: pool });

        return {
            houseMembers: individuals.filter(i => memberOfHouse.includes(i.id)),
            familyMembers: individuals.filter(i => memberOfFamily.includes(i.id))
        };
    }, [selectedCluster, data, individuals]);

    const heirId = useMemo(() => {
        if (!selectedCluster?.headOfHouseId) return null;
        return calculateHeir(data, selectedCluster.headOfHouseId, selectedCluster.successionLaw);
    }, [selectedCluster, data]);

    const displayedMembers = viewMode === 'house' ? houseMembers : [...houseMembers, ...familyMembers];

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm(t('dynasty.deleteConfirm'))) {
            deleteCluster(id);
            if (selectedClusterId === id) setSelectedClusterId(null);
        }
    };

    return (
        <div className="dynasty-overlay">
            <div className="dynasty-modal">
                <div className="dynasty-header">
                    <h2><Layers className="header-icon" /> {t('dynasty.title')}</h2>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="dynasty-content">
                    <div className="cluster-sidebar">
                        <button className="btn-create-cluster" onClick={() => setIsCreating(true)}>
                            <Plus size={18} /> {t('dynasty.manageClusters')}
                        </button>

                        <div className="cluster-list">
                            {clusters.map(cluster => (
                                <div
                                    key={cluster.id}
                                    className={`cluster-item ${selectedClusterId === cluster.id ? 'active' : ''}`}
                                    onClick={() => setSelectedClusterId(cluster.id)}
                                >
                                    <div className="cluster-item-header">
                                        <span className="cluster-name">{cluster.name}</span>
                                        <span className="cluster-badge" style={{ background: cluster.color }}>
                                            {cluster.type}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {cluster.personIds.length} {t('dynasty.members')}
                                        </span>
                                        <button className="btn-icon" onClick={(e) => handleDelete(e, cluster.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {clusters.length === 0 && (
                                <div className="empty-state">{t('dynasty.noClustersYet')}</div>
                            )}
                        </div>
                    </div>

                    <div className="cluster-details">
                        {selectedCluster ? (
                            <>
                                <div className="cluster-info-card" style={{ borderLeft: `6px solid ${selectedCluster.color}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {selectedCluster.name}
                                                <button className="btn-icon" onClick={() => setEditingCluster(selectedCluster)}>
                                                    <Edit2 size={16} />
                                                </button>
                                            </h3>
                                        </div>
                                        <span className="cluster-badge" style={{ background: selectedCluster.color }}>
                                            {selectedCluster.type}
                                        </span>
                                    </div>
                                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                                        {selectedCluster.description || t('dynasty.noDescription')}
                                    </p>

                                    {selectedCluster.type === 'DYNASTY' && (
                                        <div className="succession-banner" style={{ display: 'flex', gap: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className="banner-item">
                                                <div className="meta-label"><Crown size={12} /> {t('dynasty.headOfHouse')}</div>
                                                <div className="meta-value" style={{ color: 'var(--primary-color)' }}>
                                                    {selectedCluster.headOfHouseId ? (individuals.find(i => i.id === selectedCluster.headOfHouseId)?.names[0]?.value?.replace(/\//g, '') || t('dynasty.unknownPerson')) : t('dynasty.noneSet')}
                                                </div>
                                            </div>
                                            {heirId && (
                                                <div className="banner-item">
                                                    <div className="meta-label"><ShieldCheck size={12} /> {t('dynasty.heirApparent')}</div>
                                                    <div className="meta-value">
                                                        {individuals.find(i => i.id === heirId)?.names[0]?.value?.replace(/\//g, '') || 'Calculating...'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="cluster-meta-grid">
                                        <div className="meta-item">
                                            <span className="meta-label">{t('dynasty.definingRoots')}</span>
                                            <div className="meta-value">
                                                {commonAncestors.length > 0 ? (
                                                    commonAncestors.map(id => (
                                                        <div key={id} style={{ fontSize: '0.9rem' }}>
                                                            <Award size={14} /> {individuals.find(i => i.id === id)?.names[0]?.value?.replace(/\//g, '') || t('dynasty.unknown')}
                                                        </div>
                                                    ))
                                                ) : t('dynasty.noRootIdentified')}
                                            </div>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">{t('dynasty.coverage')}</span>
                                            <span className="meta-value">{members.persons.length} {t('dynasty.members')}, {members.families.length} {t('statistics.families')}</span>
                                        </div>
                                    </div>

                                    {clusterStats && (
                                        <div className="cluster-meta-grid" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                            <div className="meta-item">
                                                <span className="meta-label">{t('dynasty.earliestFounder')}</span>
                                                <div className="meta-value">
                                                    {clusterStats.earliest.person ? (
                                                        <>
                                                            {clusterStats.earliest.person.names[0]?.value?.replace(/\//g, '') || t('dynasty.unknown')}
                                                            <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                                ({t('dynasty.born')} {clusterStats.earliest.year})
                                                            </span>
                                                        </>
                                                    ) : t('dynasty.unknown')}
                                                </div>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">{t('dynasty.lineageSpan')}</span>
                                                <span className="meta-value">{clusterStats.lineageSpan} {t('dynasty.years')}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">{t('dynasty.coreSurnames')}</span>
                                                <span className="meta-value">{clusterStats.topSurnames.join(', ') || t('statistics.notAvailable')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <section>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                            <Users size={18} /> {t('dynasty.groupMembers')}
                                            <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '0.5rem' }}>({displayedMembers.length})</span>
                                        </h4>
                                        <div className="view-selector" style={{ display: 'flex', background: 'var(--bg-dark)', padding: '2px', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                            <button
                                                className={`btn-toggle ${viewMode === 'house' ? 'active' : ''}`}
                                                onClick={() => setViewMode('house')}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.4rem', border: 'none', background: viewMode === 'house' ? 'var(--primary-color)' : 'transparent', color: 'white', cursor: 'pointer' }}
                                            >
                                                {t('dynasty.royalHouse')}
                                            </button>
                                            <button
                                                className={`btn-toggle ${viewMode === 'family' ? 'active' : ''}`}
                                                onClick={() => setViewMode('family')}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.4rem', border: 'none', background: viewMode === 'family' ? 'var(--primary-color)' : 'transparent', color: 'white', cursor: 'pointer' }}
                                            >
                                                {t('dynasty.royalFamily')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="members-grid">
                                        {displayedMembers.map(person => {
                                            const isDynast = houseMembers.some(m => m.id === person.id);
                                            return (
                                                <div key={person.id} className="member-card" style={{ borderLeft: isDynast ? '2px solid var(--primary-color)' : 'none' }}>
                                                    <div className="member-avatar">
                                                        {person.id === selectedCluster.headOfHouseId ? <Crown size={16} color="gold" /> : (isDynast ? <ShieldCheck size={16} /> : <Users size={16} />)}
                                                    </div>
                                                    <div className="member-info">
                                                        <span className="member-name">{person.names[0]?.value?.replace(/\//g, '') || t('dynasty.unknown')}</span>
                                                        <span className="member-type">
                                                            {person.id} {isDynast ? `• ${t('dynasty.houseMember')}` : `• ${t('dynasty.relSpouse')}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Info size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <h3>{t('dynasty.selectGroup')}</h3>
                                <p>{t('dynasty.clustersInfo')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isCreating && <ClusterManager onClose={() => setIsCreating(false)} />}
            {editingCluster && (
                <ClusterManager
                    initialCluster={editingCluster}
                    onClose={() => setEditingCluster(null)}
                />
            )}
        </div>
    );
};

export default DynastyDashboard;
