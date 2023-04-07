class Card {
    _id;
    _name;
    _type;
    // Character
    _charAttacks;
    _charActiveEffects;
    _charLevel;
    // Mission
    // -- Conditions: [{type, targetId, reward:{type: card/upgrade/punish, value:3} }]
    _missionConditions;
    // Spell
    _spellEffect;
    // Place
    _placeTypes;
    _placeGuardian;
    _placeLevel;
    _placeEffects;
    _guardianAttacks;
    _guardianEffects;
    _guardianRewards;
    _image;


    constructor(id, name, image, type, charAttacks, charActiveEffects, charLevel, missionConditions, spellEffect, placeTypes, placeGuardian, placeLevel, placeEffects, guardianAttacks, guardianEffects, guardianRewards) {
        this._id = id;
        this._name = name;
        this._image = image;
        this._type = type;
        this._charAttacks = charAttacks;
        this._charActiveEffects = charActiveEffects;
        this._charLevel = charLevel;
        this._missionConditions = missionConditions;
        this._spellEffect = spellEffect;
        this._placeTypes = placeTypes;
        this._placeGuardian = placeGuardian;
        this._placeLevel = placeLevel;
        this._placeEffects = placeEffects;
        this._guardianAttacks = guardianAttacks;
        this._guardianEffects = guardianEffects;
        this._guardianRewards = guardianRewards;
    }


    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get image() {
        return this._image;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get charAttacks() {
        return this._charAttacks;
    }

    set charAttacks(value) {
        this._charAttacks = value;
    }

    get charActiveEffects() {
        return this._charActiveEffects;
    }

    set charActiveEffects(value) {
        this._charActiveEffects = value;
    }

    get charLevel() {
        return this._charLevel;
    }

    set charLevel(value) {
        this._charLevel = value;
    }

    get missionConditions() {
        return this._missionConditions;
    }

    set missionConditions(value) {
        this._missionConditions = value;
    }

    get spellEffect() {
        return this._spellEffect;
    }

    set spellEffect(value) {
        this._spellEffect = value;
    }

    get placeTypes() {
        return this._placeTypes;
    }

    set placeTypes(value) {
        this._placeTypes = value;
    }

    get placeGuardian() {
        return this._placeGuardian;
    }

    set placeGuardian(value) {
        this._placeGuardian = value;
    }

    get placeLevel() {
        return this._placeLevel;
    }

    set placeLevel(value) {
        this._placeLevel = value;
    }

    get placeEffects() {
        return this._placeEffects;
    }

    set placeEffects(value) {
        this._placeEffects = value;
    }

    get guardianAttacks() {
        return this._guardianAttacks;
    }

    set guardianAttacks(value) {
        this._guardianAttacks = value;
    }

    get guardianEffects() {
        return this._guardianEffects;
    }

    set guardianEffects(value) {
        this._guardianEffects = value;
    }

    get guardianRewards() {
        return this._guardianRewards;
    }

    set guardianRewards(value) {
        this._guardianRewards = value;
    }

    json() {
        return {
            id: this._id,
            name: this._name,
            image: this._image,
            type: this._type,
            charAttacks: this._charAttacks,
            charActiveEffects: this._charActiveEffects,
            charLevel: this._charLevel,
            missionConditions: this._missionConditions,
            spellEffect: this._spellEffect,
            placeTypes: this._placeTypes,
            placeGuardian: this._placeGuardian,
            placeLevel: this._placeLevel,
            placeEffects: this._placeEffects,
            guardianAttacks: this._guardianAttacks,
            guardianEffects: this._guardianEffects,
            guardianRewards: this._guardianRewards
        };
    }
}

export default Card;

