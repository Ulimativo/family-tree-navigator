
/**
 * Clustering Logic for Dynasty & Group Management
 */

import { ClusterType, InheritanceType, SuccessionLaw } from '../gedcom/models.js';
import { getYear } from './statistics.js';

/**
 * Returns all person and family objects belonging to a cluster.
 */
export const getClusterMembers = (data, clusterId) => {
    if (!data || !data.clusters) return { persons: [], families: [] };

    const cluster = data.clusters.find(c => c.id === clusterId);
    if (!cluster) return { persons: [], families: [] };

    const persons = data.individuals.filter(i => cluster.personIds.includes(i.id));
    const families = data.families.filter(f => cluster.familyIds.includes(f.id));

    return { persons, families };
};

/**
 * Finds the common ancestor(s) of a group of people.
 * This identifies the "Root" of the cluster.
 */
export const findCommonAncestors = (data, personIds) => {
    if (!personIds || personIds.length === 0) return [];

    // Simplistic approach: Find people in the set who have no parents within the set
    // Or more robust: standard LCA (Lowest Common Ancestor) or Root finding
    const personMap = new Map(data.individuals.map(i => [i.id, i]));
    const setOfIds = new Set(personIds);

    const roots = personIds.filter(id => {
        const person = personMap.get(id);
        if (!person) return false;
        if (!person.familyAsChild) return true;

        const fam = data.families.find(f => f.id === person.familyAsChild);
        if (!fam) return true;

        // If neither parent is in the cluster, this person is a "root" relative to the cluster
        const husbandInCluster = fam.husband && setOfIds.has(fam.husband);
        const wifeInCluster = fam.wife && setOfIds.has(fam.wife);

        return !husbandInCluster && !wifeInCluster;
    });

    return roots;
};

/**
 * Logic to find all individuals with a matching surname and group them.
 */
export const autoClusterBySurname = (data, surname) => {
    const query = surname.toLowerCase().trim();
    const matches = data.individuals.filter(indi => {
        return indi.names.some(n => {
            const val = n.value.toLowerCase();
            // Match /Surname/ or just the surname at the end
            return val.includes(`/${query}/`) || val.endsWith(` ${query}`);
        });
    });

    return matches.map(m => m.id);
};

/**
 * Recursively finds all descendants of a set of persons.
 */
export const getAllDescendants = (data, rootPersonIds) => {
    const descendants = new Set();
    const queue = [...rootPersonIds];

    while (queue.length > 0) {
        const currentId = queue.shift();
        if (descendants.has(currentId)) continue;
        descendants.add(currentId);

        const person = data.individuals.find(i => i.id === currentId);
        if (person) {
            person.familiesAsSpouse.forEach(famId => {
                const fam = data.families.find(f => f.id === famId);
                if (fam) {
                    fam.children.forEach(childId => {
                        if (!descendants.has(childId)) {
                            queue.push(childId);
                        }
                    });
                }
            });
        }
    }

    return Array.from(descendants);
};

/**
 * Computes deep insights for a specific cluster.
 */
export const computeClusterStats = (data, personIds) => {
    if (!personIds || personIds.length === 0) return null;

    const persons = data.individuals.filter(i => personIds.includes(i.id));

    let earliest = { year: Infinity, person: null };
    let latest = { year: -Infinity, person: null };
    const surnames = {};

    persons.forEach(person => {
        const birth = person.events.find(e => e.tag === 'BIRT');
        const death = person.events.find(e => e.tag === 'DEAT');
        const bYear = getYear(birth?.date);
        const dYear = getYear(death?.date);

        if (bYear) {
            if (bYear < earliest.year) earliest = { year: bYear, person };
            if (bYear > latest.year) latest = { year: bYear, person };
        }
        if (dYear) {
            if (dYear > latest.year) latest = { year: dYear, person };
        }

        // Surname tracking
        const nameVal = person.names[0]?.value || '';
        const snMatch = nameVal.match(/\/(.*?)\//);
        const sn = snMatch ? snMatch[1] : nameVal.split(' ').pop();
        if (sn) surnames[sn] = (surnames[sn] || 0) + 1;
    });

    const topSurnames = Object.entries(surnames)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name);

    return {
        earliest,
        latest,
        lineageSpan: (earliest.year !== Infinity && latest.year !== -Infinity) ? (latest.year - earliest.year) : 0,
        topSurnames,
        memberCount: persons.length
    };
};

/**
 * Categorizes cluster members into "House" (legal dynasts) vs "Family" (relatives/spouses).
 */
export const categorizeMembers = (data, cluster) => {
    const { individuals, families } = data;
    const personMap = new Map(individuals.map(i => [i.id, i]));
    const rootId = cluster.definingAncestorId;

    if (!rootId) return { memberOfHouse: Array.from(cluster.personIds), memberOfFamily: [] };

    const memberOfHouse = new Set();
    const memberOfFamily = new Set(cluster.personIds);

    // BFS from root to find legal descendants
    const queue = [{ id: rootId, isDynast: true }];
    const visited = new Set();

    const personIdsSet = cluster.personIds instanceof Set ? cluster.personIds : new Set(cluster.personIds);

    while (queue.length > 0) {
        const { id, isDynast } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);

        if (isDynast && personIdsSet.has(id)) {
            memberOfHouse.add(id);
            memberOfFamily.delete(id);
        }

        const person = personMap.get(id);
        if (person) {
            person.familiesAsSpouse.forEach(famId => {
                const fam = families.find(f => f.id === famId);
                if (fam) {
                    fam.children.forEach(childId => {
                        let inherits = false;
                        if (isDynast) {
                            if (cluster.inheritance === InheritanceType.COGNATIC) {
                                inherits = true;
                            } else if (cluster.inheritance === InheritanceType.AGNATIC) {
                                inherits = (person.sex === 'M');
                            }
                        }
                        queue.push({ id: childId, isDynast: inherits });
                    });
                }
            });
        }
    }

    return {
        memberOfHouse: Array.from(memberOfHouse),
        memberOfFamily: Array.from(memberOfFamily)
    };
};

/**
 * Calculates the next heir using Primogeniture.
 */
export const calculateHeir = (data, headId, law) => {
    const { individuals, families } = data;

    const getChildrenOrdered = (pid) => {
        const p = individuals.find(i => i.id === pid);
        if (!p) return [];
        let allChildren = [];
        p.familiesAsSpouse.forEach(famId => {
            const fam = families.find(f => f.id === famId);
            if (fam) allChildren.push(...fam.children);
        });

        return allChildren
            .map(id => individuals.find(i => i.id === id))
            .filter(Boolean)
            .sort((a, b) => {
                const aYear = getYear(a.events.find(e => e.tag === 'BIRT')?.date) || 9999;
                const bYear = getYear(b.events.find(e => e.tag === 'BIRT')?.date) || 9999;
                return aYear - bYear;
            });
    };

    const findHeirRecursive = (pid) => {
        const children = getChildrenOrdered(pid);
        if (children.length === 0) return null;

        let sorted;
        if (law === SuccessionLaw.PRIMOGENITURE_MALE_PREFERENCE) {
            // Males first, then females, but within each gender by age
            const males = children.filter(c => c.sex === 'M');
            const females = children.filter(c => c.sex === 'F');
            sorted = [...males, ...females];
        } else {
            // Absolute: purely by age
            sorted = children;
        }

        for (const child of sorted) {
            // If child is alive, they are the heir. 
            // Minimal heuristic: no DEAT tag
            const isDeceased = child.events.some(e => e.tag === 'DEAT');
            if (!isDeceased) return child.id;

            // If deceased, look at their line
            const grandHeir = findHeirRecursive(child.id);
            if (grandHeir) return grandHeir;
        }
        return null;
    };

    return findHeirRecursive(headId);
};

/**
 * Prunes members by degrees of separation from a head node.
 */
export const pruneByDegrees = (data, startId, maxDegrees, clusterMemberIds) => {
    if (maxDegrees <= 0) return Array.from(clusterMemberIds);

    const { individuals, families } = data;
    const adj = new Map(); // Simple graph: parents <-> children

    const addEdge = (u, v) => {
        if (!adj.has(u)) adj.set(u, new Set());
        if (!adj.has(v)) adj.set(v, new Set());
        adj.get(u).add(v);
        adj.get(v).add(u);
    };

    families.forEach(fam => {
        const parents = [fam.husband, fam.wife].filter(Boolean);
        fam.children.forEach(child => {
            parents.forEach(p => addEdge(p, child));
        });
    });

    const visited = new Map(); // id -> degree
    const queue = [{ id: startId, d: 0 }];
    visited.set(startId, 0);

    while (queue.length > 0) {
        const { id, d } = queue.shift();
        if (d >= maxDegrees) continue;

        const neighbors = adj.get(id) || [];
        neighbors.forEach(nb => {
            if (!visited.has(nb)) {
                visited.set(nb, d + 1);
                queue.push({ id: nb, d: d + 1 });
            }
        });
    }

    return Array.from(clusterMemberIds).filter(id => visited.has(id));
};
