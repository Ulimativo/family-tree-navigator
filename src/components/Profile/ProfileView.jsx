import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, User, Users, ChevronRight, Edit2, Save, Trash2, Plus, Check, Layers } from 'lucide-react';
import '../../styles/profile.css';
import { useTree } from '../../context/TreeContext.jsx';
import TimelineView from '../Visualization/TimelineView.jsx';
import { getTagInfo, TAG_METADATA } from '../../lib/gedcom/schema.js';

const ProfileView = ({ person, families, individuals, onClose, onNavigate }) => {
    const { updatePerson } = useTree();
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
    const [editingEventIndex, setEditingEventIndex] = useState(null); // null, number, or 'new'
    const [eventFormData, setEventFormData] = useState({ tag: 'BIRT', date: '', place: '' });

    const handleAddRelative = (type) => {
        const name = prompt(`Enter name for new ${type}:`);
        if (name) {
            addRelative(person.id, type, { name, sex: 'U' });
        }
        setShowAddMenu(false);
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
        if (confirm('Are you sure you want to delete this event?')) {
            deleteEvent(person.id, index);
        }
    };

    // Resolve Relationships
    const getPerson = (id) => individuals.find(i => i.id === id);
    const cleanName = (name) => name ? name.replace(/\//g, '') : 'Unknown';

    const parents = [];
    if (person.familyAsChild) {
        const fam = families.find(f => f.id === person.familyAsChild);
        if (fam) {
            if (fam.husband) parents.push({ id: fam.husband, role: 'Father', name: cleanName(getPerson(fam.husband)?.names[0]?.value) });
            if (fam.wife) parents.push({ id: fam.wife, role: 'Mother', name: cleanName(getPerson(fam.wife)?.names[0]?.value) });
        }
    }

    const spouses = [];
    const children = [];
    person.familiesAsSpouse.forEach(famId => {
        const fam = families.find(f => f.id === famId);
        if (fam) {
            const spouseId = fam.husband === person.id ? fam.wife : fam.husband;
            if (spouseId) spouses.push({ id: spouseId, role: 'Spouse', name: cleanName(getPerson(spouseId)?.names[0]?.value) });
            fam.children.forEach(childId => {
                children.push({ id: childId, role: 'Child', name: cleanName(getPerson(childId)?.names[0]?.value) });
            });
        }
    });

    return (
        <div className="profile-panel">
            <header className="profile-header">
                <div className="profile-title">
                    <div className="avatar">
                        <User size={24} />
                    </div>
                    <div className="title-text">
                        {isEditing ? (
                            <input
                                className="edit-input-title"
                                value={editFormData.name}
                                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                        ) : (
                            <h2>{person.names[0]?.value.replace(/\//g, '') || 'Unknown Person'}</h2>
                        )}
                        <span className="person-id">{person.id}</span>
                    </div>
                </div>
                <div className="header-actions">
                    {isEditing ? (
                        <button onClick={handleSave} className="btn-icon primary">
                            <Save size={18} />
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn-icon">
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>
            </header>

            <div className="profile-content">
                <div className="actions-bar">
                    {showAddMenu ? (
                        <div className="add-menu">
                            <button onClick={() => handleAddRelative('father')}>+ Father</button>
                            <button onClick={() => handleAddRelative('mother')}>+ Mother</button>
                            <button onClick={() => handleAddRelative('spouse')}>+ Spouse</button>
                            <button onClick={() => handleAddRelative('child')}>+ Child</button>
                            <button className="cancel" onClick={() => setShowAddMenu(false)}>Cancel</button>
                        </div>
                    ) : (
                        <button className="btn-action" onClick={() => setShowAddMenu(true)}>
                            <Users size={16} /> Add Relative
                        </button>
                    )}
                </div>

                <section className="profile-section">
                    <div className="section-header">
                        <h3><Calendar size={14} /> Life Events</h3>
                        {isEditing && (
                            <button className="btn-add-event" onClick={() => startEditEvent('new')}>
                                <Plus size={14} /> Add Event
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
                    <h3><Users size={14} /> Relationships</h3>

                    {parents.length > 0 && (
                        <div className="rel-group">
                            <h4 className="rel-type">Parents</h4>
                            {parents.map(p => (
                                <div key={p.id} className="relationship-card" onClick={() => onNavigate(p.id)}>
                                    <span className="rel-role">{p.role}</span>
                                    <span className="rel-name">{p.name || 'Unknown'}</span>
                                    <ChevronRight size={14} className="ml-auto text-muted" />
                                </div>
                            ))}
                        </div>
                    )}

                    {spouses.length > 0 && (
                        <div className="rel-group">
                            <h4 className="rel-type">Spouses</h4>
                            {spouses.map(s => (
                                <div key={s.id} className="relationship-card" onClick={() => onNavigate(s.id)}>
                                    <span className="rel-role">{s.role}</span>
                                    <span className="rel-name">{s.name || 'Unknown'}</span>
                                    <ChevronRight size={14} className="ml-auto text-muted" />
                                </div>
                            ))}
                        </div>
                    )}

                    {children.length > 0 && (
                        <div className="rel-group">
                            <h4 className="rel-type">Children</h4>
                            {children.map(c => (
                                <div key={c.id} className="relationship-card" onClick={() => onNavigate(c.id)}>
                                    <span className="rel-role">{c.role}</span>
                                    <span className="rel-name">{c.name || 'Unknown'}</span>
                                    <ChevronRight size={14} className="ml-auto text-muted" />
                                </div>
                            ))}
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
        </div>
    );
};

export default ProfileView;
