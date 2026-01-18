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

export const ClusterType = {
    DYNASTY: 'DYNASTY',
    SURNAME: 'SURNAME',
    GEOGRAPHIC: 'GEOGRAPHIC',
    GENETIC: 'GENETIC'
};

export const InheritanceType = {
    AGNATIC: 'AGNATIC', // Only male-line descendants
    COGNATIC: 'COGNATIC' // All biological descendants
};

export const SuccessionLaw = {
    PRIMOGENITURE_ABSOLUTE: 'PRIMOGENITURE_ABSOLUTE', // Oldest child, regardless of gender
    PRIMOGENITURE_MALE_PREFERENCE: 'PRIMOGENITURE_MALE_PREFERENCE' // Males come before females of same degree
};

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

export class Cluster {
    constructor(id) {
        this.id = id;
        this.name = '';
        this.description = '';
        this.type = ClusterType.DYNASTY;
        this.definingAncestorId = null; // Pointer to Person ID
        this.headOfHouseId = null; // Current Head
        this.color = '#3b82f6'; // Default blue
        this.personIds = new Set();
        this.familyIds = new Set();

        // Membership & Succession Rules
        this.inheritance = InheritanceType.COGNATIC;
        this.successionLaw = SuccessionLaw.PRIMOGENITURE_ABSOLUTE;
        this.pruningDegrees = 0; // 0 = no pruning

        this.metadata = {};
    }

    toJSON() {
        return {
            ...this,
            personIds: Array.from(this.personIds),
            familyIds: Array.from(this.familyIds)
        };
    }
}

export class Project {
    constructor(name = 'New Project') {
        this.name = name;
        this.mode = ProjectMode.LIGHTWEIGHT;
        this.individuals = [];
        this.families = [];
        this.clusters = [];
        this.sources = [];
        this.repositories = [];
        this.media = [];
        this.sharedNotes = [];
        this.metadata = {
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '1.0'
        };
        this.settings = {
            defaultDynastyColor: '#3b82f6',
            autoPruningEnabled: false
        };
    }

    toJSON() {
        return {
            ...this,
            metadata: {
                ...this.metadata,
                lastModified: new Date().toISOString()
            }
        };
    }
}
