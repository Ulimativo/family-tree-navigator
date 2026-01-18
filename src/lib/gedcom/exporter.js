/**
 * Enhanced GEDCOM exporter for GEDCOM 7.0.
 * Supports expanded attribute sets and complex structures.
 */
export class GedcomExporter {
    export(project) {
        const lines = [];
        this.writeHeader(lines, project);

        // Export Root Objects
        project.individuals.forEach(indi => this.writeIndividual(lines, indi));
        project.families.forEach(fam => this.writeFamily(lines, fam));
        project.media.forEach(obje => this.writeMedia(lines, obje));
        project.sources.forEach(sour => this.writeSource(lines, sour));
        project.repositories.forEach(repo => this.writeRepository(lines, repo));
        project.sharedNotes.forEach(note => this.writeSharedNote(lines, note));

        lines.push('0 TRLR');
        return lines.join('\n');
    }

    writeHeader(lines, project) {
        lines.push('0 HEAD');
        lines.push('1 SOUR GenealogyMVP');
        lines.push('2 VERS 1.0');
        lines.push('2 NAME ' + (project.name || 'Genealogy Project'));
        lines.push('1 GEDC');
        lines.push('2 VERS 7.0');
        lines.push('1 CHAR UTF-8');
    }

    writeIndividual(lines, indi) {
        lines.push(`0 ${indi.id} INDI`);

        // Names
        indi.names.forEach(name => {
            lines.push(`1 NAME ${name.value}`);
            if (name.given) lines.push(`2 GIVN ${name.given}`);
            if (name.surname) lines.push(`2 SURN ${name.surname}`);
            if (name.prefix) lines.push(`2 NPFX ${name.prefix}`);
            if (name.suffix) lines.push(`2 NSFX ${name.suffix}`);
            if (name.nickname) lines.push(`2 NICK ${name.nickname}`);
        });

        if (indi.sex) lines.push(`1 SEX ${indi.sex}`);

        // Events
        indi.events.forEach(event => {
            lines.push(`1 ${event.tag}${event.value ? ' ' + event.value : ''}`);
            if (event.date) lines.push(`2 DATE ${event.date}`);
            if (event.place) {
                lines.push(`2 PLAC ${event.place.value || event.place}`);
            }
        });

        // Attributes
        if (indi.attributes) {
            Object.entries(indi.attributes).forEach(([tag, val]) => {
                if (val) lines.push(`1 ${tag} ${val}`);
            });
        }

        // Lineage
        if (indi.familyAsChild) lines.push(`1 FAMC ${indi.familyAsChild}`);
        indi.familiesAsSpouse.forEach(fams => lines.push(`1 FAMS ${fams}`));

        // Associations
        indi.associations?.forEach(asso => {
            lines.push(`1 ASSO ${asso.personId}`);
            if (asso.role) lines.push(`2 ROLE ${asso.role}`);
        });

        // Contacts
        if (indi.contact?.email) lines.push(`1 EMAIL ${indi.contact.email}`);
        if (indi.contact?.www) lines.push(`1 WWW ${indi.contact.www}`);

        // Media links
        indi.media?.forEach(mId => lines.push(`1 OBJE ${mId}`));

        // Notes
        indi.notes?.forEach(note => {
            // Note: Simplification here, assuming value is the text
            lines.push(`1 NOTE ${note}`);
        });
    }

    writeFamily(lines, fam) {
        lines.push(`0 ${fam.id} FAM`);
        if (fam.husband) lines.push(`1 HUSB ${fam.husband}`);
        if (fam.wife) lines.push(`1 WIFE ${fam.wife}`);
        fam.children.forEach(child => lines.push(`1 CHIL ${child}`));

        fam.events.forEach(event => {
            lines.push(`1 ${event.tag}${event.value ? ' ' + event.value : ''}`);
            if (event.date) lines.push(`2 DATE ${event.date}`);
            if (event.place) lines.push(`2 PLAC ${event.place.value || event.place}`);
        });
    }

    writeMedia(lines, obje) {
        lines.push(`0 ${obje.id} OBJE`);
        obje.files.forEach(file => {
            lines.push(`1 FILE ${file.path}`);
            if (file.form) lines.push(`2 FORM ${file.form}`);
            if (file.mime) lines.push(`3 MIME ${file.mime}`);
        });
        if (obje.title) lines.push(`1 TITL ${obje.title}`);
    }

    writeSource(lines, sour) {
        lines.push(`0 ${sour.id} SOUR`);
        if (sour.title) lines.push(`1 TITL ${sour.title}`);
        if (sour.author) lines.push(`1 AUTH ${sour.author}`);
        if (sour.publication) lines.push(`1 PUBL ${sour.publication}`);
    }

    writeRepository(lines, repo) {
        lines.push(`0 ${repo.id} REPO`);
        if (repo.name) lines.push(`1 NAME ${repo.name}`);
    }

    writeSharedNote(lines, note) {
        lines.push(`0 ${note.id} NOTE ${note.text}`);
    }
}

/**
 * ProjectExporter: Handles high-level export logic for the Project layer.
 */
export class ProjectExporter {
    exportJSON(project) {
        return JSON.stringify(project.toJSON ? project.toJSON() : project, null, 2);
    }

    exportGedcom(project) {
        const exporter = new GedcomExporter();
        return exporter.export(project);
    }
}
