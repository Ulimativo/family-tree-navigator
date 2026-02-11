/**
 * Core data models for Genealogy MVP.
 * Based on GEDCOM 5.5.1 and 7 (Lineage-Linked)
 */

export class Source {
    constructor(id) {
        this.id = id;
        this.title = '';
        this.author = '';
        this.publication = '';
        this.abbr = '';
        this.text = []; // Transcriptions
        this.repository = null; // REPO ID
        this.notes = [];
        this.identifiers = [];
        this.metadata = {};
    }
}

export class Repository {
    constructor(id) {
        this.id = id;
        this.name = '';
        this.address = null;
        this.contact = {};
        this.notes = [];
        this.identifiers = [];
    }
}

export class Media {
    constructor(id) {
        this.id = id;
        this.files = []; // Array of { path, title, form, medi, mime }
        this.title = '';
        this.type = 'PHOTO'; // PHOTO, VIDEO, DOCUMENT
        this.notes = [];
        this.crop = null; // { left, top, right, bottom }
        this.identifiers = [];
    }
}

export class SharedNote {
    constructor(id) {
        this.id = id;
        this.text = '';
        this.identifiers = [];
    }
}

export const ProjectMode = {
    LIGHTWEIGHT: 'LIGHTWEIGHT', // Browser-only, GEDCOM centric
    PERSISTENT: 'PERSISTENT'   // JSON-centric, persistent storage
};

export class Individual {
    constructor(id) {
        this.id = id;
        this.names = []; // Array of { value, type, given, surname, prefix, suffix, nickname, phonetic, romanized }
        this.sex = null;
        this.events = []; // Array of { tag, date, place, note, type, cause, sources }
        this.attributes = {}; // Standard tags: CAST, DSCR, EDUC, IDNO, NATI, NCHI, NMR, OCCU, PROP, RELI, RESI, SSN, TITL, FACT
        this.associations = []; // Array of { personId, role, notes }
        this.familyAsChild = null; // FAMC
        this.familiesAsSpouse = []; // FAMS
        this.notes = []; // Internal notes and references to SharedNote
        this.media = []; // OBJE references
        this.address = null; // { lines: [], city, state, post, country }
        this.contact = {}; // { email, phone, fax, www }
        this.identifiers = []; // REFN, RIN, AFN
        this.customData = {};
        this.metadata = {
            changeDate: null,
            creationDate: null,
            restriction: null
        };
    }
}

export class Family {
    constructor(id) {
        this.id = id;
        this.husband = null; // HUSB (Individual ID)
        this.wife = null; // WIFE (Individual ID)
        this.children = []; // CHIL[] (Individual IDs)
        this.events = []; // Array of { tag, date, place... }
        this.notes = [];
        this.identifiers = []; // REFN, RIN
        this.customData = {};
        this.metadata = {
            changeDate: null,
            creationDate: null,
            restriction: null
        };
    }
}

export class Project {
    constructor(name = 'New Project') {
        this.name = name;
        this.mode = ProjectMode.LIGHTWEIGHT;
        this.individuals = [];
        this.families = [];
        this.sources = [];
        this.repositories = [];
        this.media = [];
        this.sharedNotes = [];
        this.metadata = {
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '1.0'
        };
        this.settings = {};
        // Quality validation results (added for GEDCOM quality assessment feature)
        this.validationResults = {
            score: 100,
            lastValidated: null,
            issueCount: 0,
            issues: [],
            dismissedIssues: new Set(),
            categoryCounts: {
                critical: 0,
                warning: 0,
                quality: 0,
                suggestion: 0
            }
        };
    }

    toJSON() {
        return {
            ...this,
            metadata: {
                ...this.metadata,
                lastModified: new Date().toISOString()
            },
            validationResults: {
                ...this.validationResults,
                dismissedIssues: Array.from(this.validationResults.dismissedIssues || [])
            }
        };
    }
}
