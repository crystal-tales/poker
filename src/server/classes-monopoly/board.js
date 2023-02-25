import Cell from './cell.js';
import {faker} from '@faker-js/faker';

const numCells = {police: 2, inspector: 2, mafia: 2, corruption: 2, extortion: 2, stock: 2, subsidy: 2, card: 8, hotel: 27};
const numCards = {a: 1, b: 2};

class Board {
    _cells = [];
    _cards = [];

    constructor() {
        let cells = [];
        Object.keys(numCells).forEach(type => {
            for (let i = 0; i < numCells[type]; i++) {
                cells.push(new Cell(type));
            }
        });
        cells = shuffle(cells);
        // La primera siempre start
        this._cells = [new Cell('start'), ...cells];
        let i = 0;
        this._cells.forEach(cell => {
            cell.id = i;
            if (cell.type === 'hotel') {
                cell.name = faker.address.city();
            }
            i++;
        });

        // Deck de cartas
        let cards = [];
        Object.keys(numCards).forEach(card => {
            for (let i = 0; i < numCards[card]; i++) {
                cards.push(card);
            }
        });
        this._cards = shuffle(cards);
    }

    get cells() {
        return this._cells;
    }

    get cards() {
        return this._cards;
    }

    // Saca carta y la devuelve al final
    draw() {
        let card = this._cards.shift();
        this._cards.push(card);
        return card;
    }

    json() {
        let clls = [];
        this._cells.forEach(cell => {
            clls.push(cell.json());
        });

        return {
            cells: clls,
            cards: this._cards
        };
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

export default Board;
