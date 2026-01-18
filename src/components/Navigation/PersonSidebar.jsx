import React, { useState, useMemo } from 'react';
import { Search, User, Filter, ChevronLeft, ChevronRight, Users, Calendar } from 'lucide-react';
import { getYear } from '../../lib/analysis/statistics.js';
import { useTranslation } from '../../i18n/useTranslation.js';

const PersonSidebar = ({ individuals, families, onSelectPerson, selectedId }) => {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        familyId: 'all',
        yearStart: '',
        yearEnd: ''
    });

    const filteredIndividuals = useMemo(() => {
        return individuals.filter(indi => {
            // Search filter
            const query = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                indi.names.some(name => name.value.toLowerCase().includes(query)) ||
                indi.id.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            // Family filter
            if (filters.familyId !== 'all') {
                const isInFamily = indi.familyAsChild === filters.familyId ||
                    indi.familiesAsSpouse.includes(filters.familyId);
                if (!isInFamily) return false;
            }

            // Timespan filter
            if (filters.yearStart || filters.yearEnd) {
                const birthEvent = indi.events.find(e => e.tag === 'BIRT');
                const deathEvent = indi.events.find(e => e.tag === 'DEAT');
                const bYear = birthEvent ? getYear(birthEvent.date) : null;
                const dYear = deathEvent ? getYear(deathEvent.date) : null;

                if (filters.yearStart) {
                    const start = parseInt(filters.yearStart);
                    // Include if birth or death is after start, or if we don't know but we want to be inclusive?
                    // Let's say: must have some life in the range
                    if (bYear && bYear < start && (!dYear || dYear < start)) return false;
                    if (!bYear && (!dYear || dYear < start)) return false;
                }
                if (filters.yearEnd) {
                    const end = parseInt(filters.yearEnd);
                    if (bYear && bYear > end) return false;
                }
            }

            return true;
        });
    }, [individuals, searchQuery, filters]);

    const listRef = React.useRef(null);

    React.useEffect(() => {
        if (selectedId) {
            const activeItem = listRef.current?.querySelector('.person-item.active');
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedId]);

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="toggle-sidebar"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? t('common.expand') : t('common.collapse')}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {!isCollapsed && (
                <>
                    <div className="sidebar-header">
                        <div className="search-container">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder={t('sidebar.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                                title={t('sidebar.filter')}
                            >
                                <Filter size={16} />
                            </button>
                        </div>

                        {showFilters && (
                            <div className="filters-panel">
                                <div className="filter-group">
                                    <label><Users size={12} /> {t('sidebar.family')}</label>
                                    <select
                                        value={filters.familyId}
                                        onChange={(e) => setFilters({ ...filters, familyId: e.target.value })}
                                    >
                                        <option value="all">{t('sidebar.allFamilies')}</option>
                                        {families.map(fam => {
                                            const husband = individuals.find(i => i.id === fam.husband);
                                            const wife = individuals.find(i => i.id === fam.wife);
                                            const hName = husband?.names[0]?.value.replace(/\//g, '') || '?';
                                            const wName = wife?.names[0]?.value.replace(/\//g, '') || '?';
                                            const label = hName === '?' && wName === '?' ? `Family ${fam.id}` : `${hName} & ${wName}`;
                                            return (
                                                <option key={fam.id} value={fam.id}>{label}</option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label><Calendar size={12} /> {t('sidebar.timespan')}</label>
                                    <div className="range-inputs">
                                        <input
                                            type="number"
                                            placeholder={t('sidebar.from')}
                                            value={filters.yearStart}
                                            onChange={(e) => setFilters({ ...filters, yearStart: e.target.value })}
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder={t('sidebar.to')}
                                            value={filters.yearEnd}
                                            onChange={(e) => setFilters({ ...filters, yearEnd: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="person-list" ref={listRef}>
                        {filteredIndividuals.map(indi => (
                            <div
                                key={indi.id}
                                className={`person-item ${selectedId === indi.id ? 'active' : ''}`}
                                onClick={() => onSelectPerson(indi.id)}
                            >
                                <User size={14} className="item-icon" />
                                <div className="item-info">
                                    <span className="item-name">{indi.names[0]?.value.replace(/\//g, '') || t('sidebar.unknown')}</span>
                                    <span className="item-id text-muted">{indi.id}</span>
                                </div>
                            </div>
                        ))}
                        {filteredIndividuals.length === 0 && (
                            <div className="empty-state">{t('sidebar.noResults')}</div>
                        )}
                    </div>
                </>
            )}

            {isCollapsed && (
                <div className="collapsed-icons">
                    <Search size={20} className="collapsed-icon" onClick={() => setIsCollapsed(false)} />
                    <Filter size={20} className="collapsed-icon" onClick={() => { setIsCollapsed(false); setShowFilters(true); }} />
                </div>
            )}
        </aside>
    );
};

export default PersonSidebar;
