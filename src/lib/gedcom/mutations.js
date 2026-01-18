import { Individual, Family, Cluster, Source, Media, SharedNote, Repository } from './models.js';

/**
 * Generates a unique ID for new records.
 * @param {string} prefix - 'I', 'F', 'S', 'M', 'R', 'N'
 * @param {Map|Set} existingIds - Existing IDs
 */
const generateId = (prefix, existingIds) => {
    let counter = 1;
    const isMap = existingIds instanceof Map;
    while ((isMap ? existingIds.has(`@${prefix}${counter}@`) : existingIds.has(`@${prefix}${counter}@`))) {
        counter++;
    }
    return `@${prefix}${counter}@`;
};

export class ProjectMutator {
    constructor(project) {
        this.project = project;

        // Fast lookup maps for current state
        this.indiMap = new Map(project.individuals.map(i => [i.id, JSON.parse(JSON.stringify(i))]));
        this.famMap = new Map(project.families.map(f => [f.id, JSON.parse(JSON.stringify(f))]));
        this.sourMap = new Map(project.sources.map(s => [s.id, JSON.parse(JSON.stringify(s))]));
        this.repoMap = new Map(project.repositories.map(r => [r.id, JSON.parse(JSON.stringify(r))]));
        this.mediaMap = new Map(project.media.map(m => [m.id, JSON.parse(JSON.stringify(m))]));
        this.noteMap = new Map(project.sharedNotes.map(n => [n.id, JSON.parse(JSON.stringify(n))]));

        this.clusterMap = new Map((project.clusters || []).map(c => {
            const cluster = new Cluster(c.id);
            Object.assign(cluster, c);
            cluster.personIds = new Set(c.personIds || []);
            cluster.familyIds = new Set(c.familyIds || []);
            return [c.id, cluster];
        }));
    }

    getProject() {
        return {
            ...this.project,
            individuals: Array.from(this.indiMap.values()),
            families: Array.from(this.famMap.values()),
            sources: Array.from(this.sourMap.values()),
            repositories: Array.from(this.repoMap.values()),
            media: Array.from(this.mediaMap.values()),
            sharedNotes: Array.from(this.noteMap.values()),
            clusters: Array.from(this.clusterMap.values()).map(c => c.toJSON()),
            metadata: {
                ...this.project.metadata,
                lastModified: new Date().toISOString()
            }
        };
    }

    updateIndividual(id, updates) {
        const indi = this.indiMap.get(id);
        if (!indi) return this;
        const { name, ...rest } = updates;
        if (name) indi.names = [{ value: name }];
        Object.assign(indi, rest);
        return this;
    }

    addEvent(indiId, eventData) {
        const indi = this.indiMap.get(indiId);
        if (indi) indi.events.push(eventData);
        return this;
    }

    updateEvent(indiId, index, eventData) {
        const indi = this.indiMap.get(indiId);
        if (indi && indi.events[index]) {
            indi.events[index] = { ...indi.events[index], ...eventData };
        }
        return this;
    }

    deleteEvent(indiId, index) {
        const indi = this.indiMap.get(indiId);
        if (indi) indi.events.splice(index, 1);
        return this;
    }

    createIndividual(data = {}) {
        const id = generateId('I', this.indiMap);
        const indi = new Individual(id);
        if (data.name) indi.names.push({ value: data.name });
        Object.assign(indi, data);
        this.indiMap.set(id, indi);
        return indi;
    }

    createFamily() {
        const id = generateId('F', this.famMap);
        const fam = new Family(id);
        this.famMap.set(id, fam);
        return fam;
    }

    addChild(parentId, childData) {
        const parent = this.indiMap.get(parentId);
        if (!parent) return null;
        const child = this.createIndividual(childData);
        let famId = parent.familiesAsSpouse[0];
        let fam;
        if (famId) {
            fam = this.famMap.get(famId);
        } else {
            fam = this.createFamily();
            famId = fam.id;
            parent.familiesAsSpouse.push(famId);
            if (parent.sex === 'M') fam.husband = parentId;
            else fam.wife = parentId;
        }
        child.familyAsChild = famId;
        fam.children.push(child.id);
        return child;
    }

    addSpouse(personId, spouseData) {
        const person = this.indiMap.get(personId);
        if (!person) return null;
        const spouse = this.createIndividual(spouseData);
        spouse.sex = person.sex === 'M' ? 'F' : 'M';
        const fam = this.createFamily();
        if (person.sex === 'M') {
            fam.husband = personId;
            fam.wife = spouse.id;
        } else {
            fam.wife = personId;
            fam.husband = spouse.id;
        }
        person.familiesAsSpouse.push(fam.id);
        spouse.familiesAsSpouse.push(fam.id);
        return spouse;
    }

    addParent(childId, parentData, type = 'husband') {
        const child = this.indiMap.get(childId);
        if (!child) return null;
        const parent = this.createIndividual(parentData);
        parent.sex = type === 'husband' ? 'M' : 'F';
        let famId = child.familyAsChild;
        let fam;
        if (famId) {
            fam = this.famMap.get(famId);
        } else {
            fam = this.createFamily();
            famId = fam.id;
            child.familyAsChild = famId;
            fam.children.push(childId);
        }
        if (type === 'husband') fam.husband = parent.id;
        else fam.wife = parent.id;
        parent.familiesAsSpouse.push(famId);
        return parent;
    }

    createCluster(data) {
        const id = generateId('C', this.clusterMap);
        const cluster = new Cluster(id);
        const { personIds, familyIds, ...rest } = data;
        Object.assign(cluster, rest);
        if (personIds) cluster.personIds = new Set(personIds);
        if (familyIds) cluster.familyIds = new Set(familyIds);
        this.clusterMap.set(id, cluster);
        return cluster;
    }

    updateCluster(id, updates) {
        const cluster = this.clusterMap.get(id);
        if (cluster) Object.assign(cluster, updates);
        return this;
    }

    deleteCluster(id) {
        this.clusterMap.delete(id);
        return this;
    }

    addPersonToCluster(clusterId, personId) {
        const cluster = this.clusterMap.get(clusterId);
        if (cluster) cluster.personIds.add(personId);
        return this;
    }

    removePersonFromCluster(clusterId, personId) {
        const cluster = this.clusterMap.get(clusterId);
        if (cluster) cluster.personIds.delete(personId);
        return this;
    }

    addFamilyToCluster(clusterId, famId) {
        const cluster = this.clusterMap.get(clusterId);
        if (cluster) cluster.familyIds.add(famId);
        return this;
    }
}
