import { Individual, Family, Source, Media, SharedNote, Repository } from './models.js';

/**
 * Robust GEDCOM parser for 5.5.1 and 7.
 * Handles deep nesting and populates extended attributes.
 */
export class GedcomParser {
    constructor() {
        this.reset();
    }

    reset() {
        this.individuals = new Map();
        this.families = new Map();
        this.sources = new Map();
        this.media = new Map();
        this.repositories = new Map();
        this.sharedNotes = new Map();
        this.header = {};
    }

    parse(content) {
        this.reset();

        // Normalize line endings and split
        const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

        let rootNodes = [];
        let contextStack = [];

        // First pass: Build a tree of nodes
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // Regex handles Level, optional @XREF@, Tag, and optional Value
            const match = line.match(/^(\d+)\s+(@[^@]+@\s+)?([A-Z0-9_]+)(\s+.*)?$/);
            if (!match) continue;

            const level = parseInt(match[1]);
            const xref = match[2] ? match[2].trim() : null;
            const tag = match[3];
            let value = match[4] ? match[4].trim() : null;

            // Handle GEDCOM 7 @@ escape
            if (value && value.startsWith('@@')) {
                value = value.substring(1);
            }

            const node = { tag, xref, value, children: [], level };

            if (level === 0) {
                rootNodes.push(node);
                contextStack = [node];
            } else {
                while (contextStack.length > level) {
                    contextStack.pop();
                }
                const parent = contextStack[contextStack.length - 1];
                if (parent) {
                    parent.children.push(node);
                    contextStack.push(node);
                }
            }
        }

        // Second pass: Process CONC/CONT into parent values
        this.resolveContinuations(rootNodes);

        // Third pass: Map nodes to objects
        for (const node of rootNodes) {
            this.processRootNode(node);
        }

        return {
            individuals: Array.from(this.individuals.values()),
            families: Array.from(this.families.values()),
            sources: Array.from(this.sources.values()),
            media: Array.from(this.media.values()),
            repositories: Array.from(this.repositories.values()),
            sharedNotes: Array.from(this.sharedNotes.values()),
            header: this.header
        };
    }

    resolveContinuations(nodes) {
        for (const node of nodes) {
            const filteredChildren = [];
            for (const child of node.children) {
                if (child.tag === 'CONT' || child.tag === 'CONC') {
                    const newline = child.tag === 'CONT' ? '\n' : '';
                    node.value = (node.value || '') + newline + (child.value || '');
                } else {
                    filteredChildren.push(child);
                    this.resolveContinuations([child]);
                }
            }
            node.children = filteredChildren;
        }
    }

    processRootNode(node) {
        let obj;
        switch (node.tag) {
            case 'INDI':
                obj = new Individual(node.xref);
                this.individuals.set(node.xref, obj);
                this.mapChildren(node.children, obj, 'INDI');
                break;
            case 'FAM':
                obj = new Family(node.xref);
                this.families.set(node.xref, obj);
                this.mapChildren(node.children, obj, 'FAM');
                break;
            case 'SOUR':
                obj = new Source(node.xref);
                this.sources.set(node.xref, obj);
                this.mapChildren(node.children, obj, 'SOUR');
                break;
            case 'OBJE':
                obj = new Media(node.xref);
                this.media.set(node.xref, obj);
                this.mapChildren(node.children, obj, 'OBJE');
                break;
            case 'REPO':
                obj = new Repository(node.xref);
                this.repositories.set(node.xref, obj);
                this.mapChildren(node.children, obj, 'REPO');
                break;
            case 'NOTE':
                if (node.xref) {
                    obj = new SharedNote(node.xref);
                    obj.text = node.value;
                    this.sharedNotes.set(node.xref, obj);
                    this.mapChildren(node.children, obj, 'NOTE');
                }
                break;
            case 'HEAD':
                this.header = { value: node.value };
                this.mapChildren(node.children, this.header, 'HEAD');
                break;
        }
    }

    mapChildren(children, obj, type) {
        for (const node of children) {
            this.handleNode(node, obj, type);
        }
    }

    handleNode(node, obj, type) {
        const { tag, value, children } = node;

        // Common mapping for many tags
        if (type === 'INDI') {
            switch (tag) {
                case 'NAME':
                    const nameObj = { value };
                    obj.names.push(nameObj);
                    this.mapChildren(children, nameObj, 'NAME');
                    return;
                case 'SEX': obj.sex = value; return;
                case 'FAMC': obj.familyAsChild = value; return;
                case 'FAMS': obj.familiesAsSpouse.push(value); return;
                case 'ASSO':
                    const asso = { personId: value };
                    obj.associations.push(asso);
                    this.mapChildren(children, asso, 'ASSO');
                    return;
                case 'NOTE':
                    obj.notes.push(value);
                    return;
                case 'OBJE':
                    obj.media.push(value); // Link to OBJE record
                    return;
                case 'ADDR':
                    obj.address = obj.address || { lines: [] };
                    obj.address.value = value;
                    this.mapChildren(children, obj.address, 'ADDR');
                    return;
                case 'CHAN':
                case 'CREA':
                    this.mapChildren(children, obj.metadata, tag);
                    return;
            }
            // Standard attributes
            const attrs = ['CAST', 'DSCR', 'EDUC', 'IDNO', 'NATI', 'NCHI', 'NMR', 'OCCU', 'PROP', 'RELI', 'RESI', 'SSN', 'TITL', 'FACT'];
            if (attrs.includes(tag)) {
                obj.attributes[tag] = value;
                return;
            }
            // Events
            const events = ['BIRT', 'DEAT', 'CHR', 'BURI', 'ADOP', 'CENS', 'EMIG', 'IMMI', 'GRAD', 'RETI', 'EVEN'];
            if (events.includes(tag)) {
                const event = { tag, value };
                obj.events.push(event);
                this.mapChildren(children, event, 'EVENT');
                return;
            }
        }

        if (type === 'FAM') {
            switch (tag) {
                case 'HUSB': obj.husband = value; return;
                case 'WIFE': obj.wife = value; return;
                case 'CHIL': obj.children.push(value); return;
                case 'NOTE': obj.notes.push(value); return;
            }
            // Events
            if (['MARR', 'DIV', 'ENGA', 'DIVF'].includes(tag)) {
                const event = { tag, value };
                obj.events.push(event);
                this.mapChildren(children, event, 'EVENT');
                return;
            }
        }

        if (type === 'EVENT') {
            switch (tag) {
                case 'DATE': obj.date = value; return;
                case 'PLAC':
                    obj.place = { value };
                    this.mapChildren(children, obj.place, 'PLAC');
                    return;
                case 'TYPE': obj.type = value; return;
                case 'CAUS': obj.cause = value; return;
                case 'NOTE': obj.note = value; return;
                case 'SOUR':
                    obj.sources = obj.sources || [];
                    obj.sources.push(value);
                    return;
            }
        }

        if (type === 'NAME') {
            switch (tag) {
                case 'GIVN': obj.given = value; return;
                case 'SURN': obj.surname = value; return;
                case 'NPFX': obj.prefix = value; return;
                case 'NSFX': obj.suffix = value; return;
                case 'NICK': obj.nickname = value; return;
                case 'FONE': obj.phonetic = value; return;
                case 'ROMN': obj.romanized = value; return;
            }
        }

        if (type === 'ASSO') {
            switch (tag) {
                case 'ROLE': obj.role = value; return;
                case 'NOTE': obj.notes = obj.notes || []; obj.notes.push(value); return;
            }
        }

        if (type === 'OBJE') {
            switch (tag) {
                case 'FILE':
                    const fileObj = { path: value };
                    obj.files.push(fileObj);
                    this.mapChildren(children, fileObj, 'FILE');
                    return;
                case 'TITL': obj.title = value; return;
            }
        }

        if (type === 'FILE') {
            switch (tag) {
                case 'FORM': obj.form = value; return;
                case 'MEDI': obj.medi = value; return;
                case 'MIME': obj.mime = value; return;
            }
        }

        // Generic catch-all for anything unrecognized or sub-structures like ADDR
        if (value) {
            if (!obj.customData) obj.customData = {};
            obj.customData[tag] = value;
        }
        if (children.length > 0) {
            // Keep recursing even for unknown structures to preserve data
            this.mapChildren(children, obj, tag);
        }
    }
}
