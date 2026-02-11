/**
 * IssueList Component
 * Displays a filterable, sortable, and groupable list of validation issues
 */

import React, { useState, useMemo, useCallback } from 'react';
import { IssueCard } from './IssueCard.jsx';
import { sortIssues, getSeverityIcon } from '../../lib/gedcom/quality/scoring.js';

export const IssueList = ({
    issues = [],
    onDismiss,
    onGoToProfile,
    onApplyQuickFix,
    enableBatchSelect = false,
    selectedIssueIds = new Set(),
    onToggleBatchSelect,
    onNavigateToProfile
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [fixableFilter, setFixableFilter] = useState(false);
    const [sortBy, setSortBy] = useState('severity'); // 'severity', 'category', 'entity', 'title'
    const [groupBy, setGroupBy] = useState(null); // null, 'severity', 'category', 'rule', 'entity'
    const [expandedGroups, setExpandedGroups] = useState(new Set());

    // Get unique severities and categories
    const severities = useMemo(() => {
        const unique = new Set(issues.map(i => i.severity));
        return Array.from(unique).sort((a, b) => {
            const order = { critical: 0, warning: 1, quality: 2, suggestion: 3 };
            return (order[a] || 99) - (order[b] || 99);
        });
    }, [issues]);

    const categories = useMemo(() => {
        const unique = new Set(issues.map(i => i.category));
        return Array.from(unique).sort((a, b) => {
            const order = { structural: 0, temporal: 1, formatting: 2, completeness: 3 };
            return (order[a] || 99) - (order[b] || 99);
        });
    }, [issues]);

    const fixableCount = useMemo(() => {
        return issues.filter(i => i.autoFixable).length;
    }, [issues]);

    // Filter and search issues
    const filteredIssues = useMemo(() => {
        let filtered = [...issues];

        // Severity filter
        if (severityFilter) {
            filtered = filtered.filter(i => i.severity === severityFilter);
        }

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(i => i.category === categoryFilter);
        }

        // Fixable filter
        if (fixableFilter) {
            filtered = filtered.filter(i => i.autoFixable);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                i.title.toLowerCase().includes(query) ||
                i.message.toLowerCase().includes(query) ||
                (i.entityName && i.entityName.toLowerCase().includes(query)) ||
                i.entityId.toLowerCase().includes(query) ||
                i.ruleId.toLowerCase().includes(query)
            );
        }

        // Sort
        switch (sortBy) {
            case 'severity':
                filtered = sortIssues(filtered);
                break;
            case 'category':
                filtered.sort((a, b) => {
                    const catOrder = { structural: 0, temporal: 1, formatting: 2, completeness: 3 };
                    const catDiff = (catOrder[a.category] || 99) - (catOrder[b.category] || 99);
                    if (catDiff !== 0) return catDiff;
                    return sortIssues([a, b])[0] === a ? -1 : 1;
                });
                break;
            case 'entity':
                filtered.sort((a, b) => {
                    const nameA = (a.entityName || a.entityId || '').toLowerCase();
                    const nameB = (b.entityName || b.entityId || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                filtered = sortIssues(filtered);
        }

        return filtered;
    }, [issues, severityFilter, categoryFilter, fixableFilter, searchQuery, sortBy]);

    // Group issues
    const groupedIssues = useMemo(() => {
        if (!groupBy) {
            return { 'All Issues': filteredIssues };
        }

        const groups = {};
        filteredIssues.forEach(issue => {
            let key;
            switch (groupBy) {
                case 'severity':
                    key = issue.severity;
                    break;
                case 'category':
                    key = issue.category;
                    break;
                case 'rule':
                    key = issue.ruleId;
                    break;
                case 'entity':
                    key = issue.entityName || issue.entityId;
                    break;
                default:
                    key = 'All Issues';
            }
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(issue);
        });

        return groups;
    }, [filteredIssues, groupBy]);

    const handleToggleGroup = useCallback((groupKey) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupKey)) {
            newExpanded.delete(groupKey);
        } else {
            newExpanded.add(groupKey);
        }
        setExpandedGroups(newExpanded);
    }, [expandedGroups]);

    const handleGoToProfile = useCallback((entityId) => {
        if (onNavigateToProfile) {
            onNavigateToProfile(entityId);
        }
    }, [onNavigateToProfile]);

    const clearFilters = useCallback(() => {
        setSeverityFilter(null);
        setCategoryFilter(null);
        setFixableFilter(false);
        setSearchQuery('');
    }, []);

    if (issues.length === 0) {
        return (
            <div className="quality-empty-state">
                <div className="quality-empty-state-icon">✓</div>
                <div className="quality-empty-state-title">All Clear!</div>
                <div className="quality-empty-state-message">
                    No quality issues found in your GEDCOM data.
                </div>
            </div>
        );
    }

    const noResults = filteredIssues.length === 0 && (severityFilter || categoryFilter || fixableFilter || searchQuery);
    const hasActiveFilters = severityFilter || categoryFilter || fixableFilter || searchQuery;

    return (
        <div className="quality-issues-list-container">
            {/* Search Bar */}
            <div className="quality-search-container">
                <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="quality-search-input"
                    aria-label="Search issues"
                />
                {searchQuery && (
                    <button
                        className="quality-search-clear"
                        onClick={() => setSearchQuery('')}
                        title="Clear search"
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="quality-controls-bar">
                <div className="quality-filters-group">
                    {/* Severity Filters */}
                    {severities.map(sev => (
                        <button
                            key={sev}
                            className={`quality-filter-btn ${severityFilter === sev ? 'active' : ''}`}
                            onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
                            title={`Filter by ${sev} severity`}
                            aria-label={`Filter by ${sev} severity`}
                            aria-pressed={severityFilter === sev}
                        >
                            {getSeverityIcon(sev)} {sev}
                        </button>
                    ))}

                    {/* Category Filters */}
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`quality-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                            title={`Filter by ${cat} category`}
                            aria-label={`Filter by ${cat} category`}
                            aria-pressed={categoryFilter === cat}
                        >
                            📁 {cat}
                        </button>
                    ))}

                    {/* Fixable Filter */}
                    <button
                        className={`quality-filter-btn ${fixableFilter ? 'active' : ''}`}
                        onClick={() => setFixableFilter(!fixableFilter)}
                        title="Show only fixable issues"
                        aria-label="Show only fixable issues"
                        aria-pressed={fixableFilter}
                    >
                        ⚙ Fixable {fixableFilter && `(${filteredIssues.filter(i => i.autoFixable).length})`}
                    </button>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            className="quality-filter-btn clear"
                            onClick={clearFilters}
                            title="Clear all filters"
                            aria-label="Clear all filters"
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>

                <div className="quality-sort-group">
                    <label className="quality-sort-label" htmlFor="sort-select">
                        Sort by:
                    </label>
                    <select
                        id="sort-select"
                        className="quality-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort issues"
                    >
                        <option value="severity">Severity</option>
                        <option value="category">Category</option>
                        <option value="entity">Entity</option>
                        <option value="title">Title</option>
                    </select>

                    <label className="quality-sort-label" htmlFor="group-select">
                        Group by:
                    </label>
                    <select
                        id="group-select"
                        className="quality-sort-select"
                        value={groupBy || ''}
                        onChange={(e) => {
                            setGroupBy(e.target.value || null);
                            setExpandedGroups(new Set());
                        }}
                        aria-label="Group issues"
                    >
                        <option value="">None</option>
                        <option value="severity">Severity</option>
                        <option value="category">Category</option>
                        <option value="rule">Rule Type</option>
                        <option value="entity">Entity</option>
                    </select>
                </div>
            </div>

            {noResults ? (
                <div className="quality-empty-state">
                    <div className="quality-empty-state-icon">🔍</div>
                    <div className="quality-empty-state-title">No Results</div>
                    <div className="quality-empty-state-message">
                        No issues match your filters. Try adjusting your search or filters.
                    </div>
                    <button
                        className="quality-empty-state-action"
                        onClick={clearFilters}
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="quality-issues-container">
                    {Object.entries(groupedIssues).map(([groupKey, groupIssues]) => {
                        const isExpanded = !groupBy || expandedGroups.has(groupKey);
                        const groupCount = groupIssues.length;

                        if (groupBy) {
                            return (
                                <div key={groupKey} className="quality-issue-group">
                                    <button
                                        className="quality-issue-group-header"
                                        onClick={() => handleToggleGroup(groupKey)}
                                        aria-expanded={isExpanded}
                                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} group: ${groupKey}`}
                                    >
                                        <span className="quality-issue-group-icon">
                                            {isExpanded ? '▼' : '▶'}
                                        </span>
                                        <span className="quality-issue-group-title">{groupKey}</span>
                                        <span className="quality-issue-group-count">({groupCount})</span>
                                    </button>
                                    {isExpanded && (
                                        <div className="quality-issue-group-content">
                                            {groupIssues.map(issue => (
                                                <IssueCard
                                                    key={issue.id}
                                                    issue={issue}
                                                    onDismiss={onDismiss}
                                                    onGoToProfile={handleGoToProfile}
                                                    onApplyQuickFix={onApplyQuickFix}
                                                    enableBatchSelect={enableBatchSelect}
                                                    isSelected={selectedIssueIds.has(issue.id)}
                                                    onToggleSelect={onToggleBatchSelect}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return groupIssues.map(issue => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                                onDismiss={onDismiss}
                                onGoToProfile={handleGoToProfile}
                                onApplyQuickFix={onApplyQuickFix}
                                enableBatchSelect={enableBatchSelect}
                                isSelected={selectedIssueIds.has(issue.id)}
                                onToggleSelect={onToggleBatchSelect}
                            />
                        ));
                    })}
                </div>
            )}

            {/* Results Count */}
            <div className="quality-results-count">
                Showing {filteredIssues.length} of {issues.length} issue{issues.length !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
            </div>
        </div>
    );
};
