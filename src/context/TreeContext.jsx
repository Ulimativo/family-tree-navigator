import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ProjectMutator } from '../lib/gedcom/mutations.js';
import { GedcomParser } from '../lib/gedcom/parser.js';
import { Project, ProjectMode } from '../lib/gedcom/models.js';
import { validator } from '../lib/gedcom/quality/validator.js';
import { applyQuickFix, applyBatchQuickFixes } from '../lib/gedcom/quality/fixers.js';

const TreeContext = createContext(null);

export const TreeProvider = ({ children }) => {
    const [data, setData] = useState(null); // data is now a Project instance
    const [focalPersonId, setFocalPersonId] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [showQualityReport, setShowQualityReport] = useState(false);
    const [hasQualityIssues, setHasQualityIssues] = useState(false);

    const loadGedcom = useCallback((content, mode = ProjectMode.LIGHTWEIGHT, name = null) => {
        try {
            const parser = new GedcomParser();
            const result = parser.parse(content);

            const projectName = name || result.header?.value || 'Imported Tree';
            const newProject = new Project(projectName);
            newProject.mode = mode;
            newProject.individuals = result.individuals;
            newProject.families = result.families;
            newProject.sources = result.sources;
            newProject.media = result.media;
            newProject.repositories = result.repositories;
            newProject.sharedNotes = result.sharedNotes;

            // Run quality validation after loading GEDCOM
            const validationResults = validator.validateProject(newProject);
            newProject.validationResults = validationResults;

            setData(newProject);

            if (newProject.individuals.length > 0) {
                setFocalPersonId(newProject.individuals[0].id);
            }

            // Auto-show quality report if there are issues
            if (validationResults.issueCount > 0) {
                setHasQualityIssues(true);
                setShowQualityReport(true);
            } else {
                setHasQualityIssues(false);
            }

            setIsDirty(false);
        } catch (error) {
            console.error("Error loading GEDCOM:", error);
            setData(null);
            setFocalPersonId(null);
            setSelectedPersonId(null);
            setIsDirty(false);
            setShowQualityReport(false);
        }
    }, []);

    const updatePerson = useCallback((id, updates) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.updateIndividual(id, updates);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const addRelative = useCallback((targetId, relationType, newPersonData) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);

            if (relationType === 'child') {
                mutator.addChild(targetId, newPersonData);
            } else if (relationType === 'spouse') {
                mutator.addSpouse(targetId, newPersonData);
            } else if (relationType === 'father') {
                mutator.addParent(targetId, newPersonData, 'husband');
            } else if (relationType === 'mother') {
                mutator.addParent(targetId, newPersonData, 'wife');
            }

            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const addEvent = useCallback((indiId, event) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.addEvent(indiId, event);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const updateEvent = useCallback((indiId, index, updatedEvent) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.updateEvent(indiId, index, updatedEvent);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const deleteEvent = useCallback((indiId, index) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.deleteEvent(indiId, index);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    // --- Quality Assessment Actions ---

    const dismissQualityIssue = useCallback((issueId) => {
        setData(prevProject => {
            if (!prevProject || !prevProject.validationResults) return prevProject;
            validator.dismissIssue(prevProject.validationResults, issueId);
            return prevProject;
        });
    }, []);

    const restoreQualityIssue = useCallback((issueId) => {
        setData(prevProject => {
            if (!prevProject || !prevProject.validationResults) return prevProject;
            validator.restoreIssue(prevProject.validationResults, issueId);
            return prevProject;
        });
    }, []);

    const revalidateQuality = useCallback((entityId = null, entityType = null) => {
        setData(prevProject => {
            if (!prevProject) return prevProject;

            if (entityId && entityType) {
                // Re-validate specific entity
                prevProject.validationResults = validator.revalidateEntity(
                    prevProject,
                    entityId,
                    entityType,
                    prevProject.validationResults
                );
            } else {
                // Re-validate entire project
                prevProject.validationResults = validator.validateProject(prevProject);
            }

            // Update quality issues flag
            setHasQualityIssues(prevProject.validationResults.issueCount > 0);

            return prevProject;
        });
    }, []);

    const applyQualityFix = useCallback((issueId, fixData = {}) => {
        setData(prevProject => {
            if (!prevProject || !prevProject.validationResults) return prevProject;

            // Find the issue
            const issue = prevProject.validationResults.issues.find(i => i.id === issueId);
            if (!issue) return prevProject;

            try {
                // Apply the fix with user-provided data
                const fixedProject = applyQuickFix(prevProject, issue, fixData);

                // Re-validate the affected entity
                fixedProject.validationResults = validator.revalidateEntity(
                    fixedProject,
                    issue.entityId,
                    issue.entityType,
                    fixedProject.validationResults
                );

                // Update quality issues flag
                setHasQualityIssues(fixedProject.validationResults.issueCount > 0);

                return fixedProject;
            } catch (error) {
                console.error('Error applying quality fix:', error);
                return prevProject;
            }
        });
        setIsDirty(true);
    }, []);

    const applyBatchFixes = useCallback((issueIds) => {
        if (!data || !issueIds || issueIds.length === 0) return;

        setData(prevProject => {
            if (!prevProject || !prevProject.validationResults) return prevProject;

            try {
                // Get issues for the provided IDs
                const issues = issueIds
                    .map(id => prevProject.validationResults.issues.find(i => i.id === id))
                    .filter(Boolean);

                // Apply all fixable issues
                let updatedProject = prevProject;
                for (const issue of issues) {
                    if (issue.autoFixable) {
                        updatedProject = applyQuickFix(updatedProject, issue, {});
                    }
                }

                // Re-validate entire project
                updatedProject.validationResults = validator.validateProject(updatedProject);

                // Update quality issues flag
                setHasQualityIssues(updatedProject.validationResults.issueCount > 0);

                console.log(`✓ Fixed ${issues.length} issues`);

                return updatedProject;
            } catch (error) {
                console.error('Error applying batch fixes:', error);
                return prevProject;
            }
        });

        setIsDirty(true);
    }, [data]);

    const dismissBatchIssues = useCallback((issueIds) => {
        if (!data || !issueIds || issueIds.length === 0) return;

        setData(prevProject => {
            if (!prevProject || !prevProject.validationResults) return prevProject;

            const newDismissedIssues = new Set(prevProject.validationResults.dismissedIssues || []);
            issueIds.forEach(id => newDismissedIssues.add(id));

            prevProject.validationResults = {
                ...prevProject.validationResults,
                dismissedIssues: newDismissedIssues
            };

            setHasQualityIssues(prevProject.validationResults.issueCount > 0);

            return prevProject;
        });

        setIsDirty(true);
    }, [data]);

    const value = {
        data, // data is the Project instance
        focalPersonId,
        setFocalPersonId,
        selectedPersonId,
        setSelectedPersonId,
        loadGedcom,
        updatePerson,
        addRelative,
        addEvent,
        updateEvent,
        deleteEvent,
        isDirty,
        // Quality assessment
        showQualityReport,
        setShowQualityReport,
        hasQualityIssues,
        dismissQualityIssue,
        restoreQualityIssue,
        revalidateQuality,
        applyQualityFix,
        applyBatchFixes,
        dismissBatchIssues
    };

    return (
        <TreeContext.Provider value={value}>
            {children}
        </TreeContext.Provider>
    );
};

export const useTree = () => {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error('useTree must be used within a TreeProvider');
    }
    return context;
};
