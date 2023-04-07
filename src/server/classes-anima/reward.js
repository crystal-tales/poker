class Card {
    _id;
    _number;
    _value;
    _suit;
    _image;

    constructor(id, number, suit) {
        switch (number) {
            case 'A':
                this._value = 14;
                break;
            case 'K':
                this._value = 13;
                break;
            case 'Q':
                this._value = 12;
                break;
            case 'J':
                this._value = 11;
                break;
            case 'T':
                this._value = 10;
                break;
            default:
                this._value = parseInt(number);
        }

        this._image = number + '_of_' + suit + '.png';
        this._number = number;
        this._suit = suit;
        this._id = id;
    }

    get number() {
        return this._number;
    }

    get suit() {
        return this._suit;
    }

    get value() {
        return this._value;
    }

    get image() {
        return this._image;
    }

    get id() {
        return this._id;
    }

    json() {
        return {
            id: this._id,
            number: this._number,
            value: this._value,
            suit: this._suit,
            image: this._image
        };
    }
}

export default Card;

