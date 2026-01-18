import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, MapPin, User, Users, ChevronRight, Edit2, Save, Trash2, Plus, Check, Layers, Image } from 'lucide-react';
import '../../styles/profile.css';
import { useTree } from '../../context/TreeContext.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import TimelineView from '../Visualization/TimelineView.jsx';
import AddRelativeModal from './AddRelativeModal.jsx';
import { getTagInfo, TAG_METADATA } from '../../lib/gedcom/schema.js';

const ProfileView = ({ person, families, individuals, onClose, onNavigate }) => {
    const { updatePerson } = useTree();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        setEditFormData({
            name: person?.names[0]?.value || '',
            sex: person?.sex || 'U'
        });
        setIsEditing(false);
    }, [person]);

    if (!person) return null;

    const handleSave = () => {
        updatePerson(person.id, editFormData);
        setIsEditing(false);
    };

    // helper for adding logic
    const { data, addRelative, addEvent, updateEvent, deleteEvent, addPersonToCluster, removePersonFromCluster } = useTree();
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showAddRelativeModal, setShowAddRelativeModal] = useState(false);
    const [addRelativeType, setAddRelativeType] = useState(null);
    const [editingEventIndex, setEditingEventIndex] = useState(null); // null, number, or 'new'
    const [eventFormData, setEventFormData] = useState({ tag: 'BIRT', date: '', place: '' });

    const handleAddRelativeClick = (type) => {
        setAddRelativeType(type);
        setShowAddRelativeModal(true);
        setShowAddMenu(false);
    };

    const handleAddRelativeSubmit = (personData) => {
        addRelative(person.id, addRelativeType, personData);
        setShowAddRelativeModal(false);
        setAddRelativeType(null);
    };

    const handleSaveEvent = () => {
        if (editingEventIndex === 'new') {
            addEvent(person.id, eventFormData);
        } else {
            updateEvent(person.id, editingEventIndex, eventFormData);
        }
        setEditingEventIndex(null);
    };

    const startEditEvent = (index, event) => {
        setEditingEventIndex(index);
        setEventFormData(event ? { ...event } : { tag: 'EVEN', date: '', place: '' });
    };

    const handleDeleteEvent = (index) => {
        if (confirm(t('profile.deleteEventConfirm'))) {
            deleteEvent(person.id, index);
        }
    };

    // Phase 4: Keyboard navigation and accessibility
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && showAddRelativeModal) {
            setShowAddRelativeModal(false);
            setAddRelativeType(null);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAddRelativeModal]);

    // Resolve Relationships (Phase 4: memoized for performance)
    const getPerson = (id) => individuals.find(i => i.id === id);
    const cleanName = (name) => name ? name.replace(/\//g, '') : t('profile.unknown');

    const { parents, spouses, children, siblings } = useMemo(() => {
        const p = [];
        const s = [];
        const c = [];
        const sib = [];

        try {
            // Parents
            if (person.familyAsChild) {
                const fam = families.find(f => f.id === person.familyAsChild);
                if (fam) {
                    if (fam.husband) p.push({ id: fam.husband, role: t('profile.father'), name: cleanName(getPerson(fam.husband)?.names[0]?.value) });
                    if (fam.wife) p.push({ id: fam.wife, role: t('profile.mother'), name: cleanName(getPerson(fam.wife)?.names[0]?.value) });
                }
            }

            // Spouses and Children
            person.familiesAsSpouse.forEach(famId => {
                const fam = families.find(f => f.id === famId);
                if (fam) {
                    const spouseId = fam.husband === person.id ? fam.wife : fam.husband;
                    if (spouseId) s.push({ id: spouseId, role: t('profile.spouse'), name: cleanName(getPerson(spouseId)?.names[0]?.value) });
                    fam.children.forEach(childId => {
                        c.push({ id: childId, role: t('profile.children'), name: cleanName(getPerson(childId)?.names[0]?.value) });
                    });
                }
            });

            // Siblings
            if (person.familyAsChild) {
                const fam = families.find(f => f.id === person.familyAsChild);
                if (fam) {
                    fam.children.forEach(siblingId => {
                        if (siblingId !== person.id) {
                            const sibling = getPerson(siblingId);
                            if (sibling) {
                                sib.push({
                                    id: siblingId,
                                    name: cleanName(sibling.names[0]?.value),
                                    role: t('profile.siblings'),
                                    type: 'full'
                                });
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('Error resolving relationships:', error);
        }

        return { parents: p, spouses: s, children: c, siblings: sib };
    }, [person.id, person.familyAsChild, person.familiesAsSpouse, families, individuals, t]);

    // Helper functions for Phase 2 & 3
    const getEventByTag = (tag) => person.events?.find(e => e.tag === tag);
    const getBirthDate = () => getEventByTag('BIRT')?.date || '';
    const getDeathDate = () => getEventByTag('DEAT')?.date || '';
    const getLifespan = (p) => {
        if (!p) return '';
        const birth = p.events?.find(e => e.tag === 'BIRT')?.date || '';
        const death = p.events?.find(e => e.tag === 'DEAT')?.date || '';
        if (birth && death) return `${birth.split(' ').pop()} – ${death.split(' ').pop()}`;
        if (birth) return `b. ${birth.split(' ').pop()}`;
        if (death) return `d. ${death.split(' ').pop()}`;
        return '';
    };
    const isLiving = () => !getEventByTag('DEAT');

    // Phase 3: Avatar helpers
    const getInitials = (p) => {
        const name = p?.names[0]?.value || '';
        const parts = name.replace(/\//g, '').split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return (name.substring(0, 2) || '?').toUpperCase();
    };

    const getAvatarColor = (p) => {
        const name = p?.names[0]?.value || p?.id || '';
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash) + name.charCodeAt(i);
            hash = hash & hash;
        }
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="profile-panel">
            <header className="profile-header">
                <div className="profile-title">
                    <div className="avatar" style={{ backgroundColor: getAvatarColor(person) }}>
                        {person.names[0]?.value ? getInitials(person) : <User size={20} />}
                    </div>
                    <div className="title-text">
                        {isEditing ? (
                            <input
                                className="edit-input-title"
                                value={editFormData.name}
                                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                        ) : (
                            <h2>{person.names[0]?.value.replace(/\//g, '') || t('profile.unknownPerson')}</h2>
                        )}
                        <span className="person-id">{person.id}</span>
                    </div>
                </div>
                <div className="header-actions">
                    {isEditing ? (
                        <button onClick={handleSave} className="btn-icon primary" aria-label={t('common.save')} title={t('common.save')}>
                            <Save size={18} />
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn-icon" aria-label={t('common.edit')} title={t('common.edit')}>
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button onClick={onClose} className="btn-icon" aria-label={t('common.close')} title={t('common.close')}>
                        <X size={20} />
                    </button>
                </div>
            </header>

            <div className="profile-content">
                <div className="actions-bar">
                    {showAddMenu ? (
                        <div className="add-menu" role="menu" aria-label={t('profile.addParent')}>
                            <button onClick={() => handleAddRelativeClick('father')} role="menuitem">{t('profile.addFather')}</button>
                            <button onClick={() => handleAddRelativeClick('mother')} role="menuitem">{t('profile.addMother')}</button>
                            <button onClick={() => handleAddRelativeClick('spouse')} role="menuitem">{t('profile.addSpouseButton')}</button>
                            <button onClick={() => handleAddRelativeClick('child')} role="menuitem">{t('profile.addChildButton')}</button>
                            <button className="cancel" onClick={() => setShowAddMenu(false)} role="menuitem">{t('common.cancel')}</button>
                        </div>
                    ) : (
                        <button className="btn-action" onClick={() => setShowAddMenu(true)} aria-label={t('profile.addParent')} aria-haspopup="menu">
                            <Users size={16} /> {t('profile.addParent')}
                        </button>
                    )}
                </div>

                <section className="profile-section">
                    <div className="section-header">
                        <h3><Calendar size={14} /> {t('profile.events')}</h3>
                        {isEditing && (
                            <button className="btn-add-event" onClick={() => startEditEvent('new')}>
                                <Plus size={14} /> {t('profile.addEventButton')}
                            </button>
                        )}
                    </div>

                    {editingEventIndex !== null && (
                        <div className="event-editor-card">
                            <select
                                value={eventFormData.tag}
                                onChange={e => setEventFormData({ ...eventFormData, tag: e.target.value })}
                            >
                                {Object.keys(TAG_METADATA).map(tag => (
                                    <option key={tag} value={tag}>
                                        {getTagInfo(tag).label} ({tag})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Date (e.g., 1 JAN 1900)"
                                value={eventFormData.date}
                                onChange={e => setEventFormData({ ...eventFormData, date: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Place"
                                value={eventFormData.place || ''}
                                onChange={e => setEventFormData({ ...eventFormData, place: e.target.value })}
                            />
                            <div className="editor-actions">
                                <button className="btn-save-event" onClick={handleSaveEvent} title="Save Event"><Check size={16} /></button>
                                <button className="btn-cancel-event" onClick={() => setEditingEventIndex(null)} title="Cancel"><X size={16} /></button>
                            </div>
                        </div>
                    )}

                    <TimelineView
                        events={person.events}
                        isEditable={isEditing}
                        onEdit={startEditEvent}
                        onDelete={handleDeleteEvent}
                        activeEditIndex={editingEventIndex}
                    />
                </section>

                <section className="profile-section">
                    <h3><Users size={14} /> {t('profile.relationships')}</h3>

                    {parents.length > 0 && (
                        <div className="rel-group">
                            <h4 className="rel-type">{t('profile.parents')}</h4>
                            {parents.map(p => {
                                const parent = getPerson(p.id);
                                return (
                                    <div key={p.id} className="relationship-card" onClick={() => onNavigate(p.id)}>
                                        <div className="rel-info">
                                            <span className="rel-role">{p.role}</span>
                                            <span className="rel-name">{p.name || t('profile.unknown')}</span>
                                            {parent && getLifespan(parent) && (
                                                <span className="rel-lifespan">{getLifespan(parent)}</span>
                                            )}
                                        </div>
                                        <ChevronRight size={14} className="ml-auto text-muted" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {spouses.length > 0 && (
                        <div className="rel-group">
                            <h4 className="rel-type">{t('profile.spouses')}</h4>
                            {spouses.map(s => {
                                const spouse = getPerson(s.id);
                                return (
                                    <div key={s.id} className="relationship-card" onClick={() => onNavigate(s.id)}>
                                        <div className="rel-info">
                                            <span className="rel-role">{s.role}</span>
                                            <span className="rel-name">{s.name || t('profile.unknown')}</span>
                                            {spouse && getLifespan(spouse) && (
                                                <span className="rel-lifespan">{getLifespan(spouse)}</span>
                                            )}
                                        </div>
                                        <ChevronRight size={14} className="ml-auto text-muted" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {siblings.length > 0 && (
                        <div className="rel-group">
                            <h4 className="rel-type">{t('profile.siblings')}</h4>
                            {siblings.map(sib => {
                                const sibling = getPerson(sib.id);
                                return (
                                    <div key={sib.id} className="relationship-card" onClick={() => onNavigate(sib.id)}>
                                        <div className="rel-info">
                                            <span className="rel-role">{sib.role}</span>
                                            <span className="rel-name">{sib.name || t('profile.unknown')}</span>
                                            {sibling && getLifespan(sibling) && (
                                                <span className="rel-lifespan">{getLifespan(sibling)}</span>
                                            )}
                                        </div>
                                        <ChevronRight size={14} className="ml-auto text-muted" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {children.length > 0 && (
                        <div className="rel-group">
                            <h4 className="rel-type">{t('profile.children')}</h4>
                            {children.map(c => {
                                const child = getPerson(c.id);
                                return (
                                    <div key={c.id} className="relationship-card" onClick={() => onNavigate(c.id)}>
                                        <div className="rel-info">
                                            <span className="rel-role">{c.role}</span>
                                            <span className="rel-name">{c.name || t('profile.unknown')}</span>
                                            {child && getLifespan(child) && (
                                                <span className="rel-lifespan">{getLifespan(child)}</span>
                                            )}
                                        </div>
                                        <ChevronRight size={14} className="ml-auto text-muted" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {person.attributes && Object.keys(person.attributes).length > 0 && (
                    <section className="profile-section">
                        <h3><Layers size={14} /> Details & Attributes</h3>
                        <div className="attributes-grid">
                            {Object.entries(person.attributes).map(([tag, value]) => {
                                const info = getTagInfo(tag);
                                return (
                                    <div key={tag} className="attribute-item" title={info.description}>
                                        <span className="attr-label">{info.label}:</span>
                                        <span className="attr-value">{value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {person.notes && person.notes.length > 0 && (
                    <section className="profile-section">
                        <h3><MapPin size={14} /> {t('profile.notes')}</h3>
                        <div className="notes-container">
                            {person.notes.map((note, idx) => (
                                <div key={idx} className="note-card">
                                    <p>{typeof note === 'string' ? note : note.text || ''}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {person.media && person.media.length > 0 && (
                    <section className="profile-section">
                        <h3><Image size={14} /> {t('profile.media')}</h3>
                        <div className="media-grid">
                            {person.media.map((mediaId, idx) => (
                                <div key={idx} className="media-item">
                                    <div className="media-placeholder">📷</div>
                                    <p className="media-title">{mediaId}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="profile-section">
                    <h3><Layers size={14} /> Dynasty & Groups</h3>
                    <div className="rel-group">
                        {data.clusters?.filter(c => c.personIds.includes(person.id)).map(cluster => (
                            <div key={cluster.id} className="relationship-card" style={{ borderLeft: `4px solid ${cluster.color}` }}>
                                <span className="rel-name">{cluster.name}</span>
                                <button
                                    className="btn-icon ml-auto"
                                    onClick={() => removePersonFromCluster(cluster.id, person.id)}
                                    title="Remove from group"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        <div style={{ marginTop: '1rem' }}>
                            <select
                                className="edit-input"
                                style={{ width: '100%', fontSize: '0.85rem' }}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        addPersonToCluster(e.target.value, person.id);
                                        e.target.value = '';
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Add to Group...</option>
                                {data.clusters?.filter(c => !c.personIds.includes(person.id)).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>
            </div>

            {showAddRelativeModal && addRelativeType && (
                <AddRelativeModal
                    relationType={addRelativeType}
                    onSubmit={handleAddRelativeSubmit}
                    onCancel={() => {
                        setShowAddRelativeModal(false);
                        setAddRelativeType(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProfileView;
