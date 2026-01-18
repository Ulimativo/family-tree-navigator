export const GEDCOM_TAGS = {
    // Individual Events
    ADOP: 'Adoption',
    BAPM: 'Baptism',
    BARM: 'Bar Mitzvah',
    BASM: 'Bat Mitzvah',
    BIRT: 'Birth',
    BLES: 'Blessing',
    BURI: 'Burial',
    CENS: 'Census',
    CHR: 'Christening',
    CHRA: 'Adult Christening',
    CONF: 'Confirmation',
    CREM: 'Cremation',
    DEAT: 'Death',
    EMIG: 'Emigration',
    FCOM: 'First Communion',
    GRAD: 'Graduation',
    IMMI: 'Immigration',
    NATU: 'Naturalization',
    ORDN: 'Ordination',
    PROB: 'Probate',
    RETI: 'Retirement',
    WILL: 'Will',
    RESI: 'Residence',

    // Family Events
    ANUL: 'Annulment',
    DIV: 'Divorce',
    DIVF: 'Divorce Filed',
    ENGA: 'Engagement',
    MARB: 'Marriage Banns',
    MARC: 'Marriage Contract',
    MARR: 'Marriage',
    MARL: 'Marriage License',
    MARS: 'Marriage Settlement',

    // Other
    EVEN: 'Event',
    _CRE: 'Created',
    CHAN: 'Changed'
};

export const formatTag = (tag) => GEDCOM_TAGS[tag] || tag;
