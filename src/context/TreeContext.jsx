import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ProjectMutator } from '../lib/gedcom/mutations.js';
import { GedcomParser } from '../lib/gedcom/parser.js';
import { Project, ProjectMode } from '../lib/gedcom/models.js';

const TreeContext = createContext(null);

export const TreeProvider = ({ children }) => {
    const [data, setData] = useState(null); // data is now a Project instance
    const [focalPersonId, setFocalPersonId] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

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
            newProject.clusters = result.clusters || [];

            setData(newProject);

            if (newProject.individuals.length > 0) {
                setFocalPersonId(newProject.individuals[0].id);
            }

            setIsDirty(false);
        } catch (error) {
            console.error("Error loading GEDCOM:", error);
            setData(null);
            setFocalPersonId(null);
            setSelectedPersonId(null);
            setIsDirty(false);
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

    // --- Cluster Actions ---

    const createCluster = useCallback((clusterData) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.createCluster(clusterData);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const updateCluster = useCallback((id, updates) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.updateCluster(id, updates);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const deleteCluster = useCallback((id) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.deleteCluster(id);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const addPersonToCluster = useCallback((clusterId, personId) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.addPersonToCluster(clusterId, personId);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const removePersonFromCluster = useCallback((clusterId, personId) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.removePersonFromCluster(clusterId, personId);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);

    const addFamilyToCluster = useCallback((clusterId, famId) => {
        setData(prevProject => {
            const mutator = new ProjectMutator(prevProject);
            mutator.addFamilyToCluster(clusterId, famId);
            return mutator.getProject();
        });
        setIsDirty(true);
    }, []);



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
        createCluster,
        updateCluster,
        deleteCluster,
        addPersonToCluster,
        removePersonFromCluster,
        addFamilyToCluster,
        isDirty
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
