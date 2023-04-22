import cardList from './card-list.js';
import Card from './card.js';

class Deck {
    _characters = [];
    _places = [];
    _spells = [];
    _missions = [];
    _guardians = [];

    constructor() {
    }

    get characters() {
        return this._characters;
    }

    get places() {
        return this._places;
    }

    get spells() {
        return this._spells;
    }

    get missions() {
        return this._missions;
    }

    get guardians() {
        return this._guardians;
    }

    create() {
        this._characters = [];
        this._missions = [];
        this._places = [];
        this._spells = [];
        this._guardians = [];

        // Creamos las cartas
        let id = 0;
        // characters
        cardList.characters.forEach(c => {
            this._characters.push(new Card(id, c.name, c.image, c.type, c.attacks, c.activeEffects, c.level));
            id++;
        });
        // places
        cardList.places.forEach(c => {
            this._places.push(new Card(id, c.name, c.image, c.type, null, null, null, null, null, c.placeTypes, c.placeGuardian, c.placeLevel, c.placeEffects));
            id++;
        });
        // spells
        cardList.spells.forEach(c => {
            this._spells.push(new Card(id, c.name, c.image, c.type, null, null, null, null, c.effect));
            id++;
        });
        // missions
        cardList.missions.forEach(c => {
            this._missions.push(new Card(id, c.name, c.image, c.type, null, null, null, c.conditions));
            id++;
        });
        // guardians
        cardList.guardians.forEach(c => {
            this._guardians.push(new Card(id, c.name, c.image, c.type, null, null, null, null, null, null, null, null, null, c.attacks, c.effects, c.rewards));
            id++;
        });

        this._characters = this.shuffle(this._characters);
        this._missions = this.shuffle(this._missions);
        this._places = this.shuffle(this._places);
        this._spells = this.shuffle(this._spells);
        this._guardians = this.shuffle(this._guardians);
    }

    shuffle(cards) {
        let copyCards = [...cards];
        let currentIndex = copyCards.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [copyCards[currentIndex], copyCards[randomIndex]] = [copyCards[randomIndex], copyCards[currentIndex]];
        }

        return copyCards;
    }

    drawMission() {
        let card = this._missions.shift();
        return card === undefined ? null : card;
    }

    drawPlace() {
        let card = this._places.shift();
        return card === undefined ? null : card;
    }

    drawSpell() {
        let card = this._spells.shift();
        return card === undefined ? null : card;
    }

    drawCharacter() {
        let card = this._characters.shift();
        return card === undefined ? null : card;
    }

    drawGuardian() {
        let card = this._guardians.shift();
        return card === undefined ? null : card;
    }

    returnMission(card) {
        this._missions.push(card);
    }

    returnPlace(card) {
        return this._places.push(card);
    }

    returnSpell(card) {
        return this._spells.push(card);
    }

    returnCharacter(card) {
        return this._characters.push(card);
    }

    returnGuardian(card) {
        return this._guardians.push(card);
    }
}

export default Deck;

