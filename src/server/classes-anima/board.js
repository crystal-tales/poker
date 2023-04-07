import utils from '../utils.js';

class Board {
    _maxPlaces = 4;
    _places = [];
    _guardians = [];

    constructor() {
    }

    get maxPlaces() {
        return this._maxPlaces;
    }

    get places() {
        return this._places;
    }

    get guardians() {
        return this._guardians;
    }

    addGuardian(guardianCard, placeId) {
        let placed = false;
        this._places.forEach((pl, idx) => {
            if (pl.id === placeId) {
                this._guardians[idx] = guardianCard;
                placed = true;
            }
        });
    }

    addPlace(placeCard) {
        if (this.freePlaces() > 0) {
            this._places.push(placeCard);
        } else {
            return null;
        }
    }

    freePlaces() {
        return this._maxPlaces - this._places.length;
    }

    json() {
        return {
            maxPlaces: this._maxPlaces,
            freePlaces: this.freePlaces(),
            places: utils.jsonifyArrayOfClasses(this._places),
            guardians: utils.jsonifyArrayOfClasses(this._guardians)
        };
    }
}

export default Board;
