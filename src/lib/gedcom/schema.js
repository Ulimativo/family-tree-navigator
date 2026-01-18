/**
 * GEDCOM Tag Metadata Registry
 * Generated from data/gedcom_attribute_table.csv
 */

export const TAG_METADATA = {
    "ABBR": {
        "label": "Abkürzung",
        "desc_de": "Für einen Titel, eine Beschreibung oder einen Namen",
        "desc_en": "A short name of a title, description, or name."
    },
    "ADDR": {
        "label": "Adresse",
        "desc_de": "Aktuelle Adresse einer Person, eines Übermittlers, eines Ablageorts, eines Geschäfts, einer Schule oder einer Firma",
        "desc_en": "The contemporary place, usually required for postal purposes, of an individual, a submitter of information, a repository, a business, a school, or a company."
    },
    "ADR1": {
        "label": "Erste Zeile einer Adresse",
        "desc_de": "Erste Zeile einer Adresse",
        "desc_en": "The first line of an address."
    },
    "ADR2": {
        "label": "Zweite Zeile einer Adresse",
        "desc_de": "Zweite Zeile einer Adresse",
        "desc_en": "The second line of an address."
    },
    "ADR3": {
        "label": "Dritte Zeile einer Adresse neu in GEDCOM 5.5.1",
        "desc_de": "Dritte Zeile einer Adresse",
        "desc_en": "The third line of an address. This is the value of the second CONT line subordinate to the ADDR tag in the address structure."
    },
    "ADOP": {
        "label": "Adoption",
        "desc_de": "Dokumentation einer Kind - Eltern – Beziehung, die nicht biologisch begründet ist",
        "desc_en": "Pertaining to creation of a child-parent relationship that does not exist biologically."
    },
    "AFN": {
        "label": "Ancestral File Nummer",
        "desc_de": "Eindeutige Satznummer in Ancestral File (LDS Programm)",
        "desc_en": "A unique permanent record file number of an individual record stored in Ancestral File."
    },
    "AGE": {
        "label": "Alter",
        "desc_de": "Alter einer Person zur Zeit eines Ereignisses oder das Alter, das in einem Dokument genannt wird",
        "desc_en": "The age of the individual at the time an event occurred, or the age listed in the document."
    },
    "AGNC": {
        "label": "Behörde",
        "desc_de": "Institution oder Person mit der Befugnis und/oder Verantwortung zu verwalten oder zu regieren",
        "desc_en": "The institution or individual having authority and/or responsibility to manage or govern."
    },
    "ALIA": {
        "label": "Alias-Name",
        "desc_de": "Verknüpfung zu einem anderen Satz, der vielleicht dieselbe Person beschreibt",
        "desc_en": "An indicator to link different record descriptions of a person who may be the same person."
    },
    "ANCE": {
        "label": "Vorfahren",
        "desc_de": "Vorfahren einer Person",
        "desc_en": "Pertaining to forbearers of an individual."
    },
    "ANCI": {
        "label": "Interessent an Vorfahren",
        "desc_de": "Gibt Interesse an zusätzlicher Forschung nach Vorfahren dieser Person an",
        "desc_en": "Indicates an interest in additional research for ancestors of this individual. (See also DESI)"
    },
    "ANUL": {
        "label": "Annullierung",
        "desc_de": "Ungültigkeitserklärung einer Ehe von Anfang an",
        "desc_en": "Declaring a marriage void from the beginning (never existed)."
    },
    "ASSO": {
        "label": "Beziehung zu einer Person",
        "desc_de": "Verweis auf Freunde, Nachbarn, Angehörige, Mitarbeiter oder Gefährten einer Person",
        "desc_en": "An indicator to link friends, neighbors, relatives, or associates of an individual."
    },
    "AUTH": {
        "label": "Autor",
        "desc_de": "Name des Autors oder Sammlers der Daten",
        "desc_en": "The name of the individual who created or compiled information."
    },
    "BAPL": {
        "label": "LDS-Taufe",
        "desc_de": "Taufe mit 8 Jahren oder später durch einen Priester der LDS (siehe auch BAPM)",
        "desc_en": "The event of baptism performed at age eight or later by priesthood authority of the LDS Church. (See also BAPM)"
    },
    "BAPM": {
        "label": "Taufe",
        "desc_de": "Taufe (nicht LDS) als Kind oder später (siehe auch BAPL und CHR)",
        "desc_en": "The event of baptism (not LDS), performed in infancy or later. (See also BAPL and CHR)"
    },
    "BARM": {
        "label": "Bar-Mitzwah",
        "desc_de": "Jüdische Zeremonie für 13-jährige Jungen",
        "desc_en": "The ceremonial event held when a Jewish boy reaches age 13."
    },
    "BASM": {
        "label": "Bas-Mitzwah",
        "desc_de": "Jüdische Zeremonie für 13-jährige Mädchen (auch Bat-Mizwa genannt)",
        "desc_en": "The ceremonial event held when a Jewish girl reaches age 13, also known as Bat Mitzvah."
    },
    "BIRT": {
        "label": "Geburt",
        "desc_de": "Das Geburtsereignis",
        "desc_en": "The event of entering into life."
    },
    "BLES": {
        "label": "Segnung",
        "desc_de": "Religiöse Zeremonie göttliche Fürsorge zu bescheren; manchmal in Verbindung mit der Zeremonie der Namensgebung",
        "desc_en": "A religious event of bestowing divine care or intercession. Sometimes given in connection with a naming ceremony."
    },
    "BLOB": {
        "label": "Binär-Datei entfernt in GEDCOM 5.5.1",
        "desc_de": "Bild-, Audio-, Video-Daten, z.B. Fotos, Dokumenten-Scans",
        "desc_en": "A grouping of data used as input to a multimedia system that processes binary data to represent images, sound, and video."
    },
    "BURI": {
        "label": "Beerdigung",
        "desc_de": "Das Ereignis, bei dem die sterbliche Hülle einer verstorbenen Person angemessen beigesetzt wird.",
        "desc_en": "The event of the proper disposing of the mortal remains of a deceased person."
    },
    "CALN": {
        "label": "Signatur",
        "desc_de": "Identifikationsnummer dieses Objekts in einem Aufbewahrungsort",
        "desc_en": "The number used by a repository to identify the specific items in its collections."
    },
    "CAST": {
        "label": "Stand",
        "desc_de": "Stand einer Person in der Gesellschaft nach Unterschieden in Rasse, Religion, Reichtum, ererbtem Rang, Beruf, Tätigkeit usw.",
        "desc_en": "The name of an individual's rank or status in society, based on racial or religious differences, or differences in wealth, inherited rank, profession, occupation, etc."
    },
    "CAUS": {
        "label": "Ursache",
        "desc_de": "(Haupt)Ursache eines Ereignisses oder einer Tatsache, z.B. Todesursache",
        "desc_en": "A description of the cause of the associated event or fact, such as the cause of death."
    },
    "CENS": {
        "label": "Volkszählung",
        "desc_de": "Zählung der Bevölkerung für einen bestimmtes Gebiet wie Land oder Staat",
        "desc_en": "The event of the periodic count of the population for a designated locality, such as a national or state Census."
    },
    "CHAN": {
        "label": "Änderung",
        "desc_de": "Zeigt eine Änderung oder Korrektur an, normalerweise mit dem Datum der Änderung",
        "desc_en": "Indicates a change, correction, or modification. Typically used in connection with a DATE to specify when a change in information occurred."
    },
    "CHAR": {
        "label": "Zeichensatz",
        "desc_de": "In dieser Datei benutzter Zeichensatz",
        "desc_en": "An indicator of the character set used in writing this automated information."
    },
    "CHIL": {
        "label": "Kind",
        "desc_de": "Natürliches, angenommenes oder gesiegeltes (LDS) Kind eines Vaters und einer Mutter",
        "desc_en": "The natural, adopted, or sealed (LDS) child of a father and a mother."
    },
    "CHR": {
        "label": "Taufe",
        "desc_de": "Religiöse Zeremonie (nicht LDS) der Taufe und/oder Namensgebung eines Kindes",
        "desc_en": "The religious event (not LDS) of baptizing and/or naming a child."
    },
    "CHRA": {
        "label": "Erwachsenentaufe",
        "desc_de": "Religiöse Zeremonie (nicht LDS) der Taufe und/oder Namensgebung einer erwachsenen Person",
        "desc_en": "The religious event (not LDS) of baptizing and/or naming an adult person."
    },
    "CITY": {
        "label": "Stadt",
        "desc_de": "Niedrige Gebietskörperschaft",
        "desc_en": "A lower level jurisdictional unit. Normally an incorporated municipal unit."
    },
    "CONC": {
        "label": "Verkettung",
        "desc_de": "Zusatzdaten des übergeordneten Wertes. Die Daten werden ohne Leerzeichen und Zeilenumbruch an die Daten der vorherigen Zeile angehängt. Die Daten dürfen nicht an einem Leerzeichen aufgespaltet werden, da es dabei verloren gehen würde. Leerzeichen sind GEDCOM Begrenzer. Bei vielen GEDCOM Werten werden die Leerzeichen am Ende abgeschnitten. Einige Programme nehmen das erste Nicht- Leerzeichen nach dem Feldnamen als Beginn des Wertes.",
        "desc_en": "An indicator that additional data belongs to the superior value. The information from the CONC value is to be connected to the value of the superior preceding line without a space and without a carriage return and/or new line character. Values that are split for a CONC tag must always be split at a non-space. If the value is split on a space the space will be lost when concatenation takes place. This is because of the treatment that spaces get as a GEDCOM delimiter, many GEDCOM values are trimmed of trailing spaces and some systems look for the first non-space starting after the tag to determine the beginning of the value."
    },
    "CONF": {
        "label": "Konfirmation/Firmung",
        "desc_de": "Religiöse Zeremonie (nicht LDS) der Übertragung des Geschenks des Heiligen Geistes und bei Protestanten der vollen Kirchenmitgliedschaft",
        "desc_en": "The religious event (not LDS) of conferring the gift of the Holy Ghost and, among protestants, full church membership."
    },
    "CONL": {
        "label": "Konfirmation (LDS)",
        "desc_de": "Religiöse Zeremonie, mit der eine Person Mitglied der LDS wird",
        "desc_en": "The religious event by which a person receives membership in the LDS Church."
    },
    "CONT": {
        "label": "Fortsetzung",
        "desc_de": "Zusatzdaten des übergeordneten Wertes. Die Daten werden mit Zeilenumbruch an die Daten der vorherigen Zeile angehängt. Führende Leerzeichen können für die Formatierung des folgenden Textes wichtig sein. Programme nach dem Feldnamen nur 1 Leerzeichen als Begrenzer nehmen und eventuelle weitere als Beginn des Wertes annehmen.",
        "desc_en": "An indicator that additional data belongs to the superior value. The information from the CONT value is to be connected to the value of the superior preceding line with a carriage return and/or new line character. Leading spaces could be important to the formatting of the resultant text. When importing values from CONT lines the reader should assume only one delimiter character following the CONT tag. Assume that the rest of the leading spaces are to be a part of the value."
    },
    "COPR": {
        "label": "Copyright",
        "desc_de": "Vermerk, der Daten vor unberechtigter Vervielfältigung und Verteilung schützt",
        "desc_en": "A statement that accompanies data to protect it from unlawful duplication and distribution."
    },
    "CORP": {
        "label": "Institution",
        "desc_de": "Name einer Einrichtung, Behörde oder Firma",
        "desc_en": "A name of an institution, agency, corporation, or company."
    },
    "CREM": {
        "label": "Feuerbestattung",
        "desc_de": "Beseitigung der sterblichen Hülle einer Person durch Verbrennung",
        "desc_en": "Disposal of the remains of a person's body by fire."
    },
    "CTRY": {
        "label": "Land",
        "desc_de": "Name oder Kennzeichen des Landes",
        "desc_en": "The name or code of the country."
    },
    "DATA": {
        "label": "Quelleninformationen",
        "desc_de": "Gespeicherte automatische Informationen",
        "desc_en": "Pertaining to stored automated information."
    },
    "DATE": {
        "label": "Datum",
        "desc_de": "Zeitpunkt eines Ereignisses in einem Kalenderformat",
        "desc_en": "The time of an event in a calendar format."
    },
    "DEAT": {
        "label": "Tod",
        "desc_de": "Das Todesereignis",
        "desc_en": "The event when mortal life terminates."
    },
    "DESC": {
        "label": "Nachkommen",
        "desc_de": "Nachkommen einer Person",
        "desc_en": "Pertaining to offspring of an individual."
    },
    "DESI": {
        "label": "Interessent an Nachkommen",
        "desc_de": "Gibt Interesse an zusätzlicher Forschung nach Nachkommen dieser Person an",
        "desc_en": "Indicates an interest in research to identify additional descendants of this individual. (See also ANCI)"
    },
    "DEST": {
        "label": "Zielsystem",
        "desc_de": "Programm, das die Daten empfängt",
        "desc_en": "A system receiving data."
    },
    "DIV": {
        "label": "Scheidung",
        "desc_de": "Offizielle Trennung einer Ehe",
        "desc_en": "An event of dissolving a marriage through civil action."
    },
    "DIVF": {
        "label": "Scheidung eingereicht",
        "desc_de": "Beantragung der Scheidung durch einen Ehepartner",
        "desc_en": "An event of filing for a divorce by a spouse."
    },
    "DSCR": {
        "label": "Körperliche Beschreibung",
        "desc_de": "Die körperlichen Eigenschaften einer Person, eines Ortes oder einer Sache",
        "desc_en": "The physical characteristics of a person, place, or thing."
    },
    "EDUC": {
        "label": "Ausbildung",
        "desc_de": "Grad der erreichten Ausbildung",
        "desc_en": "Indicator of a level of education attained."
    },
    "EMAIL": {
        "label": "E-Mail-Adresse neu in GEDCOM 5.5.1",
        "desc_de": "E-Mail-Adresse",
        "desc_en": "An electronic address that can be used for contact such as an email address."
    },
    "EMIG": {
        "label": "Auswanderung",
        "desc_de": "Verlassen des Herkunftslands mit der Absicht woanders zu leben",
        "desc_en": "An event of leaving one's homeland with the intent of residing elsewhere."
    },
    "ENDL": {
        "label": "Endowment (Begabung)",
        "desc_de": "Religiöse Zeremonie (LDS)",
        "desc_en": "A religious event where an endowment ordinance for an individual was performed by priesthood authority in an LDS temple."
    },
    "ENGA": {
        "label": "Verlobung",
        "desc_de": "Das Ereignis der Dokumentation oder Ankündigung der Absicht zweier Personen zu heiraten",
        "desc_en": "An event of recording or announcing an agreement between two people to become married."
    },
    "EVEN": {
        "label": "Ereignis",
        "desc_de": "Nennenswertes Ereignis für eine Person, Gruppe oder Organisation",
        "desc_en": "A noteworthy happening related to an individual, a group, or an organization."
    },
    "FACT": {
        "label": "Fakt oder Merkmal neu in GEDCOM 5.5.1",
        "desc_de": "Nennenswertes Merkmal oder Tatsache für eine Person, Gruppe oder Organisation. Wird normalerweise durch TYPE näher erläutert",
        "desc_en": "Pertaining to a noteworthy attribute or fact concerning an individual, a group, or an organization. A FACT structure is usually qualified or classified by a subordinate use of the TYPE tag."
    },
    "FAM": {
        "label": "Familie",
        "desc_de": "Rechtliche oder allgemein übliche Verbindung von Mann und Frau und ihrer Kinder (soweit vorhanden) oder eine Verbindung durch die Geburt eines Kindes mit seinen biologischen Eltern",
        "desc_en": "Identifies a legal, common law, or other customary relationship of man and woman and their children, if any, or a family created by virtue of the birth of a child to its biological father and mother."
    },
    "FAMC": {
        "label": "Kind einer Familie",
        "desc_de": "Familie, in der diese Person als Kind erscheint",
        "desc_en": "Identifies the family in which an individual appears as a child."
    },
    "FAMF": {
        "label": "Familiendatei",
        "desc_de": "",
        "desc_en": "Pertaining to, or the name of, a family file. Names stored in a file that are assigned to a family for doing temple ordinance work."
    },
    "FAMS": {
        "label": "Partner",
        "desc_de": "Familie, in der diese Person als Partner erscheint",
        "desc_en": "Identifies the family in which an individual appears as a spouse or as a partner."
    },
    "FAX": {
        "label": "Fax-Nummer neu in GEDCOM 5.5.1",
        "desc_de": "Fax-Nummer",
        "desc_en": "A FAX telephone number appropriate for sending data facsimiles."
    },
    "FCOM": {
        "label": "Erstkommunion",
        "desc_de": "Religiöse Zeremonie der ersten Teilnahme am Heiligen Abendmahl",
        "desc_en": "A religious rite, the first act of sharing in the Lord's supper as part of church worship."
    },
    "FILE": {
        "label": "Datei",
        "desc_de": "Informationsspeicher, der für die Aufbewahrung und Referenzierung eingerichtet ist",
        "desc_en": "An information storage place that is ordered and arranged for preservation and reference."
    },
    "FONE": {
        "label": "Audio-Variante eines Textes neu in GEDCOM 5.5.1",
        "desc_de": "Audio-Variante eines Textes",
        "desc_en": "A phonetic variation of a superior text string."
    },
    "FORM": {
        "label": "Format",
        "desc_de": "Name eines beständigen Formats, in dem Information übertragen wird",
        "desc_en": "An assigned name given to a consistent format in which information can be conveyed."
    },
    "GEDC": {
        "label": "GEDCOM",
        "desc_de": "Information über die Anwendung von GEDCOM bei einer Übertragung",
        "desc_en": "Information about the use of GEDCOM in a transmission."
    },
    "GIVN": {
        "label": "Vornamen",
        "desc_de": "Verliehene oder erworbene Namen zur offiziellen Identifikation einer Person",
        "desc_en": "A given or earned name used for official identification of a person."
    },
    "GRAD": {
        "label": "Ausbildungsabschluss",
        "desc_de": "Verleihung von Ausbildungs-Diplomen oder akademischen Graden an Personen",
        "desc_en": "An event of awarding educational diplomas or degrees to individuals."
    },
    "HEAD": {
        "label": "Vorspann",
        "desc_de": "Information, die die gesamte GEDCOM Übertragung betrifft",
        "desc_en": "Identifies information pertaining to an entire GEDCOM transmission."
    },
    "HUSB": {
        "label": "Ehemann",
        "desc_de": "Person in der Rolle eines verheirateten Mannes oder Vaters",
        "desc_en": "An individual in the family role of a married man or father."
    },
    "IDNO": {
        "label": "Identitätsnummer",
        "desc_de": "Nummer zur Identifizierung einer Person in einem maßgeblichen externen System",
        "desc_en": "A number assigned to identify a person within some significant external system."
    },
    "IMMI": {
        "label": "Einwanderung",
        "desc_de": "Zuzug in ein anderes Land mit der Absicht, dort zu leben",
        "desc_en": "An event of entering into a new locality with the intent of residing there."
    },
    "INDI": {
        "label": "Person",
        "desc_de": "Person",
        "desc_en": "A person."
    },
    "LANG": {
        "label": "Sprache",
        "desc_de": "Sprache, die in einer Kommunikation oder Übertragung von Information verwendet wird",
        "desc_en": "The name of the language used in a communication or transmission of information."
    },
    "LATI": {
        "label": "Breitengrad neu in GEDCOM 5.5.1",
        "desc_de": "Breitengrad",
        "desc_en": "A value indicating a coordinate position on a line, plane, or space."
    },
    "LONG": {
        "label": "Längengrad neu in GEDCOM 5.5.1",
        "desc_de": "Längengrad",
        "desc_en": "A value indicating a coordinate position on a line, plane, or space."
    },
    "MAP": {
        "label": "Karte neu in GEDCOM 5.5.1",
        "desc_de": "",
        "desc_en": "Pertains to a representation of measurements usually presented in a graphical form."
    },
    "MARB": {
        "label": "Aufgebot",
        "desc_de": "Das Ereignis der offiziellen, öffentlichen Bekanntmachung, dass zwei Menschen heiraten wollen.",
        "desc_en": "An event of an official public notice given that two people intend to marry."
    },
    "MARC": {
        "label": "Ehevertrag",
        "desc_de": "Ereignis des Abschlusses des Formalen Ehevertrages, u.a. mit der Vereinbarung der Eigentumsrechte der Ehepartner und der Kinder",
        "desc_en": "An event of recording a formal agreement of marriage, including the prenuptial agreement in which marriage partners reach agreement about the property rights of one or both, securing property to their children."
    },
    "MARL": {
        "label": "Eheerlaubnis",
        "desc_de": "Ereignis der Erteilung der rechtlichen Erlaubnis zu heiraten",
        "desc_en": "An event of obtaining a legal license to marry."
    },
    "MARR": {
        "label": "Heirat",
        "desc_de": "Rechtliches oder allgemein übliches Ereignis der Gründung einer Familie von Mann und Frau",
        "desc_en": "A legal, common-law, or customary event of creating a family unit of a man and a woman as husband and wife."
    },
    "MARS": {
        "label": "Ehevereinbarung",
        "desc_de": "Rechtliches oder allgemein übliches Ereignis der Gründung einer Familie von Mann und Frau",
        "desc_en": "An event of creating an agreement between two people contemplating marriage, at which time they agree to release or modify property rights that would otherwise arise from the marriage."
    },
    "MEDI": {
        "label": "Medientyp",
        "desc_de": "Art des Mediums in einem Aufbewahrungsort",
        "desc_en": "Identifies information about the media or having to do with the medium in which information is stored."
    },
    "NAME": {
        "label": "Name",
        "desc_de": "Ein oder mehrere Wörter zur Identifikation einer Person, eines Titels oder einer anderen Sache. Für Personen, die durch mehrere Namen bekannt sind, sollten mehrere NAME Zeilen verwendet werden.",
        "desc_en": "A word or combination of words used to help identify an individual, title, or other item. More than one NAME line should be used for people who were known by multiple names."
    },
    "NATI": {
        "label": "Nationalität",
        "desc_de": "Nationalität einer Person",
        "desc_en": "The national heritage of an individual."
    },
    "NATU": {
        "label": "Einbürgerung",
        "desc_de": "Erhalt der Bürgerrechte",
        "desc_en": "The event of obtaining citizenship."
    },
    "NCHI": {
        "label": "Anzahl Kinder",
        "desc_de": "Als Attribut einer Person: Anzahl ihrer Kinder aus allen ihrer Familien; als Attribut einer Familie: Anzahl ihrer Kinder",
        "desc_en": "The number of children that this person is known to be the parent of (all marriages) when subordinate to an individual, or that belong to this family when subordinate to a FAM_RECORD."
    },
    "NICK": {
        "label": "Spitzname",
        "desc_de": "Ein beschreibender oder gebräuchlicher Name, der anstatt oder zusätzlich zum eigentlichen Namen verwendet wird",
        "desc_en": "A descriptive or familiar that is used instead of, or in addition to, one's proper name."
    },
    "NMR": {
        "label": "Anzahl Heiraten",
        "desc_de": "Anzahl wie oft diese Person Partner in Familien war als Ehepartner oder Elternteil",
        "desc_en": "The number of times this person has participated in a family as a spouse or parent."
    },
    "NOTE": {
        "label": "Notiz",
        "desc_de": "Zusätzliche Information des Übermittlers zum Verstehen dieser Daten",
        "desc_en": "Additional information provided by the submitter for understanding the enclosing data."
    },
    "NPFX": {
        "label": "vorangestellter Namenszusatz (Titel)",
        "desc_de": "Text, der vor dem Vor- und Zunamen erscheint, z.B. Titel: Regierungsrat Otto Meier (wird nicht indexiert)",
        "desc_en": "Text which appears on a name line before the given and surname parts of a name. i.e. ( Lt. Cmndr. ) Joseph /Allen/ jr. In this example Lt. Cmndr. is considered as the name prefix portion."
    },
    "NSFX": {
        "label": "nachgestellter Namenszusatz",
        "desc_de": "Text, der nach dem Namen erscheint, z.B. Otto Meier sen. (wird nicht indexiert)",
        "desc_en": "Text which appears on a name line after or behind the given and surname parts of a name. i.e. Lt. Cmndr. Joseph /Allen/ ( jr. ) In this example jr. is considered as the name suffix portion."
    },
    "OBJE": {
        "label": "Verweis auf Daten",
        "desc_de": "Normalerweise Verweis auf Bild-, Audio-, Video-Daten, z.B. Fotos, Dokumenten-Scans",
        "desc_en": "Pertaining to a grouping of attributes used in describing something. Usually referring to the data required to represent a multimedia object, such an audio recording, a photograph of a person, or an image of a document."
    },
    "OCCU": {
        "label": "Beruf",
        "desc_de": "Art der Arbeit oder Beruf einer Person",
        "desc_en": "The type of work or profession of an individual."
    },
    "ORDI": {
        "label": "Heilige Handlung",
        "desc_de": "Religiöse Zeremonie allgemein",
        "desc_en": "Pertaining to a religious ordinance in general."
    },
    "ORDN": {
        "label": "Ordinierung",
        "desc_de": "Religiöse Zeremonie des Erhalts der Befugnis, in religiösen Angelegenheiten zu handeln",
        "desc_en": "A religious event of receiving authority to act in religious matters."
    },
    "PAGE": {
        "label": "Seite",
        "desc_de": "Nummer oder Beschreibung, wo die Information in einem referenzierten Werk gefunden werden kann",
        "desc_en": "A number or description to identify where information can be found in a referenced work."
    },
    "PEDI": {
        "label": "Ahnentafel",
        "desc_de": "Information zu einer Person zu Eltern Verbindung",
        "desc_en": "Information pertaining to an individual to parent lineage chart."
    },
    "PHON": {
        "label": "Telefon",
        "desc_de": "Telefonnummer",
        "desc_en": "A unique number assigned to access a specific telephone."
    },
    "PLAC": {
        "label": "Ort",
        "desc_de": "Offizieller Name des Ortes eines Ereignisses",
        "desc_en": "A jurisdictional name to identify the place or location of an event."
    },
    "POST": {
        "label": "Postleitzahl",
        "desc_de": "Code zur Identifikation eines Gebietes zur leichteren Postzustellung",
        "desc_en": "A code used by a postal service to identify an area to facilitate mail handling."
    },
    "PROB": {
        "label": "Testamentsbestätigung",
        "desc_de": "Rechtliche Feststellung der Gültigkeit eines Testaments; kann mehrere Gerichtstermine umfassen",
        "desc_en": "An event of judicial determination of the validity of a will. May indicate several related court activities over several dates."
    },
    "PROP": {
        "label": "Besitz",
        "desc_de": "Grundbesitz oder anderes wesentliches Eigentum",
        "desc_en": "Pertaining to possessions such as real estate or other property of interest."
    },
    "PUBL": {
        "label": "Veröffentlichung",
        "desc_de": "Beschreibt wann und wo ein Dokument geschaffen oder veröffentlicht wurde",
        "desc_en": "Refers to when and/or were a work was published or created."
    },
    "QUAY": {
        "label": "Datenqualität",
        "desc_de": "Bewertung der Zuverlässigkeit der Daten",
        "desc_en": "An assessment of the certainty of the evidence to support the conclusion drawn from evidence."
    },
    "REFN": {
        "label": "Referenznummer",
        "desc_de": "Identifikation eines Objekts zum Katalogisieren, Ablegen oder andere Verweiszwecke",
        "desc_en": "A description or number used to identify an item for filing, storage, or other reference purposes."
    },
    "RELA": {
        "label": "Beziehung",
        "desc_de": "Art der Beziehung zwischen Personen",
        "desc_en": "A relationship value between the indicated contexts."
    },
    "RELI": {
        "label": "Religion",
        "desc_de": "Glaubensgemeinschaft, an die sich eine Person angeschlossen hat oder für die dieser Eintrag gilt",
        "desc_en": "A religious denomination to which a person is affiliated or for which a record applies."
    },
    "REPO": {
        "label": "Aufbewahrungsort",
        "desc_de": "Einrichtung oder Person, die das betroffene Objekt in ihrer Sammlung hat",
        "desc_en": "An institution or person that has the specified item as part of their collection(s)."
    },
    "RESI": {
        "label": "Wohnort",
        "desc_de": "Wohnen an einer Adresse für einen Zeitraum",
        "desc_en": "The act of dwelling at an address for a period of time."
    },
    "RESN": {
        "label": "vertrauliche Daten",
        "desc_de": "Kennzeichnung, dass Zugriff zu Informationen abgewiesen oder begrenzt worden ist",
        "desc_en": "A processing indicator signifying access to information has been denied or otherwise restricted."
    },
    "RETI": {
        "label": "Ruhestand",
        "desc_de": "Beendigung des Arbeitsverhältnisses",
        "desc_en": "An event of exiting an occupational relationship with an employer after a qualifying time period."
    },
    "RFN": {
        "label": "Datensatznummer",
        "desc_de": "Permanente Satznummer, die eindeutig in dieser Datei ist",
        "desc_en": "A permanent number assigned to a record that uniquely identifies it within a known file."
    },
    "RIN": {
        "label": "Datensatzidentnummer",
        "desc_de": "Satznummer aus dem erzeugenden Programm, die ein empfangendes Programm benutzen kann, um Ergebnisse zu berichten, die diesen Satz betreffen",
        "desc_en": "A number assigned to a record by an originating automated system that can be used by a receiving system to report results pertaining to that record."
    },
    "ROLE": {
        "label": "Rolle",
        "desc_de": "Bezeichnung der Rolle, die eine Person bei einem Ereignis spielte",
        "desc_en": "A name given to a role played by an individual in connection with an event."
    },
    "ROMN": {
        "label": "romanisierte Textform neu in GEDCOM 5.5.1",
        "desc_de": "Umschrift des übergeordneten Textes in lateinische Buchstaben",
        "desc_en": "A romanized variation of a superior text string."
    },
    "SEX": {
        "label": "Geschlecht",
        "desc_de": "Geschlecht einer Person",
        "desc_en": "Indicates the sex of an individual--male or female."
    },
    "SLGC": {
        "label": "Siegelung an Eltern",
        "desc_de": "Das Ereignis der Siegelung eines Kindes an seine Eltern im Rahmen einer LDS-Tempelzeremonie",
        "desc_en": "A religious event pertaining to the sealing of a child to his or her parents in an LDS temple ceremony."
    },
    "SLGS": {
        "label": "Siegelung an Ehepartner",
        "desc_de": "Das Ereignis der Siegelung an den Ehepartner im Rahmen einer LDS-Tempelzeremonie",
        "desc_en": "A religious event pertaining to the sealing of a husband and wife in an LDS temple ceremony."
    },
    "SOUR": {
        "label": "Quelle",
        "desc_de": "Ursprungsmaterial, von dem Informationen herausgezogen wurden",
        "desc_en": "The initial or original material from which information was obtained."
    },
    "SPFX": {
        "label": "Nachnamenspräfix",
        "desc_de": "Text, der vor dem Nachnamen erscheint, z.B. von Hagestolz (wird nicht indexiert)",
        "desc_en": "A name piece used as a non-indexing pre-part of a surname."
    },
    "SSN": {
        "label": "Sozialversicherungsnummer",
        "desc_de": "Nummer zur Identifizierung einer Person in der Sozialversicherung und/oder bei der Steuer",
        "desc_en": "A number assigned by the United States Social Security Administration. Used for tax identification purposes."
    },
    "STAE": {
        "label": "Bundesland",
        "desc_de": "Große Gebietskörperschaft innerhalb eines Staates",
        "desc_en": "A geographical division of a larger jurisdictional area, such as a State within the United States of America."
    },
    "STAT": {
        "label": "Status",
        "desc_de": "Bewertung des Zustands einer Sache",
        "desc_en": "An assessment of the state or condition of something."
    },
    "SUBM": {
        "label": "Einsender, Übermittler",
        "desc_de": "Person oder Organisation, die genealogische Daten in eine Datei einspeist oder an jemand anderen übermittelt",
        "desc_en": "An individual or organization who contributes genealogical data to a file or transfers it to someone else."
    },
    "SUBN": {
        "label": "Übertragung",
        "desc_de": "",
        "desc_en": "Pertains to a collection of data issued for processing."
    },
    "SURN": {
        "label": "Nachname",
        "desc_de": "Familienname",
        "desc_en": "A family name passed on or used by members of a family."
    },
    "TEMP": {
        "label": "LDS-Tempel",
        "desc_de": "Name bzw. Code, der für einen LDS-Tempel steht",
        "desc_en": "The name or code that represents the name a temple of the LDS Church."
    },
    "TEXT": {
        "label": "Zitat",
        "desc_de": "Genauer Wortlaut aus einem Originaldokument",
        "desc_en": "The exact wording found in an original source document."
    },
    "TIME": {
        "label": "Zeit",
        "desc_de": "Zeitangabe im 24-Stundenformat mit Stunden, Minuten und optional Sekunden getrennt durch Doppelpunkt. Sekundenbruchteile in dezimaler Notation",
        "desc_en": "A time value in a 24-hour clock format, including hours, minutes, and optional seconds, separated by a colon (:). Fractions of seconds are shown in decimal notation."
    },
    "TITL": {
        "label": "Titel",
        "desc_de": "Bezeichnung eines Dokuments oder anderen Werks wie der Titel eines Buches als Quelle oder eine formelle Bezeichnung einer Person in Verbindung mit einer Herrschaftsposition oder anderem sozialen Status, z.B. Großherzog",
        "desc_en": "A description of a specific writing or other work, such as the title of a book when used in a source context, or a formal designation used by an individual in connection with positions of royalty or other social status, such as Grand Duke."
    },
    "TRLR": {
        "label": "Dateiende",
        "desc_de": "Kennzeichnet auf Ebene 0 das Ende einer GEDCOM Übertragung",
        "desc_en": "At level 0, specifies the end of a GEDCOM transmission."
    },
    "TYPE": {
        "label": "Typ",
        "desc_de": "Weitere Qualifikation der Bedeutung des übergeordneten Feldnamens. Dieser Wert ist nicht standardisiert für eine automatische Bearbeitung, sondern eher eine Notiz mit 1 – 2 Wörtern, die angezeigt werden, wenn die zugehörigen Daten dargestellt werden.",
        "desc_en": "A further qualification to the meaning of the associated superior tag. The value does not have any computer processing reliability. It is more in the form of a short one or two word note that should be displayed any time the associated data is displayed."
    },
    "VERS": {
        "label": "Version",
        "desc_de": "Kennzeichnet, welche Version eines Produkts, Gegenstands oder Veröffentlichung benutzt oder referenziert wird",
        "desc_en": "Indicates which version of a product, item, or publication is being used or referenced."
    },
    "WIFE": {
        "label": "Ehefrau",
        "desc_de": "Person in der Rolle einer verheirateten Frau oder einer Mutter",
        "desc_en": "An individual in the role as a mother and/or married woman."
    },
    "WWW": {
        "label": "URL, Internet-Adresse neu in GEDCOM 5.5.1",
        "desc_de": "World Wide Web home page",
        "desc_en": "World Wide Web home page."
    },
    "WILL": {
        "label": "Testament",
        "desc_de": "Das Ereignis der Unterzeichnung des juristischen Dokuments, in dem eine Person über ihren Nachlass nach ihrem Ableben verfügt (Siehe auch PROBate)",
        "desc_en": "A legal document treated as an event, by which a person disposes of his or her estate, to take effect after death. The event date is the date the will was signed while the person was alive. (See also PROBate)"
    }
};

/**
 * Retrieves metadata for a GEDCOM tag.
 * @param {string} tag - The GEDCOM tag (e.g., 'BIRT', 'DEAT')
 * @param {string} locale - 'en' or 'de' (default 'en')
 * @returns {Object} { label, description }
 */
export function getTagInfo(tag, locale = 'en') {
    const info = TAG_METADATA[tag];
    if (!info) return { label: tag, description: '' };
    
    return {
        label: info.label || tag,
        description: locale === 'de' ? info.desc_de : info.desc_en
    };
}
