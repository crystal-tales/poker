class Cell {
    _id = 0;
    _name = '';
    // Tipos: start, police, inspector, mafia, corruption, extortion, stock, subsidy, card, hotel
    _type = '';
    _level = 1;
    _closed = 0;
    _special = 0;
    _owned = false;
    // Costes de compra (1) y mejora
    _costs = {'hotel': {1: 250, 2: 500, 3: 1000, 4: 2000, 5: 5000, 6: 2000, 7: 3500, 8: 5000}};
    // Precios al caer que han de pagar, en el caso de los negativos indican que son "trabajos extra" por los que se recibe dinero en vez de pagar
    _prices = {'hotel': {1: 100, 2: 200, 3: 300, 4: 400, 5: 500, 6: -500, 7: -1500, 8: -2500}};

    constructor(type) {
        this._type = type;
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

    get level() {
        return this._level;
    }

    get closed() {
        return this._closed;
    }

    get special() {
        return this._special;
    }

    get costs() {
        return this._costs;
    }

    get prices() {
        return this._prices;
    }

    get type() {
        return this._type;
    }

    set level(value) {
        this._level = value;
    }

    set closed(value) {
        this._closed = value;
    }

    set special(value) {
        this._special = value;
    }

    get owned() {
        return this._owned;
    }

    set owned(value) {
        this._owned = value;
    }

    json() {
        return {
            id: this._id,
            type: this._type,
            level: this._level,
            closed: this._closed,
            special: this._special,
            costs: this._costs,
            prices: this._prices,
            owned: this._owned,
            name: this._name
        };
    }
}

export default Cell;
