import React, { useState, useMemo } from 'react';
import { Plus, X, Tag, Users, MapPin, Dna, Save } from 'lucide-react';
import { ClusterType, InheritanceType, SuccessionLaw } from '../../lib/gedcom/models.js';
import { useTree } from '../../context/TreeContext.jsx';
import { autoClusterBySurname, getAllDescendants } from '../../lib/analysis/clustering.js';

const ClusterManager = ({ onClose, initialCluster = null }) => {
    const { data, createCluster, updateCluster } = useTree();
    const [formData, setFormData] = useState(initialCluster || {
        name: '',
        description: '',
        type: ClusterType.DYNASTY,
        color: '#3b82f6',
        definingAncestorId: '',
        headOfHouseId: '',
        inheritance: InheritanceType.COGNATIC,
        successionLaw: SuccessionLaw.PRIMOGENITURE_ABSOLUTE,
        pruningDegrees: 0
    });

    const [autoSurname, setAutoSurname] = useState('');
    const [surnames, setSurnames] = useState([]);
    const [recursiveAdd, setRecursiveAdd] = useState(false);

    const autoAddedPersonIds = useMemo(() => {
        let allIds = new Set();
        surnames.forEach(sn => {
            const matches = autoClusterBySurname(data, sn);
            matches.forEach(id => allIds.add(id));
        });

        if (recursiveAdd && allIds.size > 0) {
            const descendantIds = getAllDescendants(data, Array.from(allIds));
            descendantIds.forEach(id => allIds.add(id));
        }
        return Array.from(allIds);
    }, [data, surnames, recursiveAdd]);

    const handleAddSurname = (e) => {
        e.preventDefault();
        if (!autoSurname.trim()) return;
        const normalizedSurname = autoSurname.trim();
        if (!surnames.includes(normalizedSurname)) {
            setSurnames([...surnames, normalizedSurname]);
        }
        setAutoSurname('');
    };

    const removeSurname = (sn) => {
        setSurnames(surnames.filter(s => s !== sn));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Merge existing members with newly discovered ones
        const existingIds = initialCluster ? Array.from(initialCluster.personIds || []) : [];
        const combinedIds = Array.from(new Set([...existingIds, ...autoAddedPersonIds]));

        const finalData = {
            ...formData,
            personIds: combinedIds
        };

        if (initialCluster) {
            updateCluster(initialCluster.id, finalData);
        } else {
            createCluster(finalData);
        }
        onClose();
    };

    return (
        <div className="dynasty-overlay">
            <div className="dynasty-modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="dynasty-header">
                    <h2>{initialCluster ? 'Edit Group Settings' : 'New Cluster / Dynasty'}</h2>
                    <button className="btn-icon" onClick={onClose}><X /></button>
                </div>
                <div style={{ padding: '2rem' }}>
                    <form className="cluster-form" onSubmit={handleSubmit}>
                        {/* Basic Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-field">
                                <label>Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. House of Windsor"
                                />
                            </div>
                            <div className="form-field">
                                <label>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value={ClusterType.DYNASTY}>Dynasty</option>
                                    <option value={ClusterType.SURNAME}>Surname Group</option>
                                    <option value={ClusterType.GEOGRAPHIC}>Geographic Cluster</option>
                                    <option value={ClusterType.GENETIC}>Genetic Match Group</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Color Coding</label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    style={{ height: '40px', padding: '2px', width: '100%' }}
                                />
                            </div>
                            <div className="form-field">
                                <label>Description (Optional)</label>
                                <input
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Short description..."
                                />
                            </div>
                        </div>

                        {/* Dynasty Specific Rules */}
                        {formData.type === ClusterType.DYNASTY && (
                            <div className="dynasty-rules-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                                <div className="form-field">
                                    <label>Inheritance Rule</label>
                                    <select
                                        value={formData.inheritance}
                                        onChange={e => setFormData({ ...formData, inheritance: e.target.value })}
                                    >
                                        <option value={InheritanceType.COGNATIC}>Cognatic (Mixed)</option>
                                        <option value={InheritanceType.AGNATIC}>Agnatic (Male-line)</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Succession Law</label>
                                    <select
                                        value={formData.successionLaw}
                                        onChange={e => setFormData({ ...formData, successionLaw: e.target.value })}
                                    >
                                        <option value={SuccessionLaw.PRIMOGENITURE_ABSOLUTE}>Absolute Primogeniture</option>
                                        <option value={SuccessionLaw.PRIMOGENITURE_MALE_PREFERENCE}>Male-preference</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Defining Root Ancestor</label>
                                    <select
                                        value={formData.definingAncestorId}
                                        onChange={e => setFormData({ ...formData, definingAncestorId: e.target.value })}
                                    >
                                        <option value="">Select Root...</option>
                                        {data.individuals.map(i => (
                                            <option key={i.id} value={i.id}>{i.names[0].value.replace(/\//g, '')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Current Head of House</label>
                                    <select
                                        value={formData.headOfHouseId}
                                        onChange={e => setFormData({ ...formData, headOfHouseId: e.target.value })}
                                    >
                                        <option value="">Select Head...</option>
                                        {data.individuals.map(i => (
                                            <option key={i.id} value={i.id}>{i.names[0].value.replace(/\//g, '')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                                    <label>Membership Pruning (Degrees from Head)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={formData.pruningDegrees}
                                        onChange={e => setFormData({ ...formData, pruningDegrees: parseInt(e.target.value) || 0 })}
                                    />
                                    <small className="text-muted">0 = Show all members. Increase to auto-hide distant branches.</small>
                                </div>
                            </div>
                        )}

                        {/* Member Management Section */}
                        <div className="profile-section" style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.05)' }}>
                            <h3 style={{ fontSize: '0.8rem' }}>Member Population</h3>

                            <div className="tags-cloud" style={{ marginBottom: '1rem', minHeight: surnames.length > 0 ? 'auto' : '0' }}>
                                {surnames.map(sn => (
                                    <span key={sn} className="surname-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {sn}
                                        <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSurname(sn)} />
                                    </span>
                                ))}
                            </div>

                            <div className="form-field">
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        value={autoSurname}
                                        onChange={e => setAutoSurname(e.target.value)}
                                        placeholder="Add members by surname..."
                                        onKeyDown={e => e.key === 'Enter' && handleAddSurname(e)}
                                    />
                                    <button type="button" onClick={handleAddSurname} className="btn-icon">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 400, marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={recursiveAdd}
                                        onChange={e => setRecursiveAdd(e.target.checked)}
                                    />
                                    Include descendants (recursive)
                                </label>
                                {autoAddedPersonIds.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                                        {autoAddedPersonIds.length} members will be added.
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-create-cluster" style={{ marginTop: '1.5rem', width: '100%' }}>
                            <Save size={18} /> {initialCluster ? 'Save Changes' : 'Update Cluster'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClusterManager;
