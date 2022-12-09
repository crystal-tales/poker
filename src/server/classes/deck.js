import Card from './card.js';

class Deck {
    _cards;

    constructor() {
    }

    get cards() {
        return this._cards;
    }

    create() {
        this._cards = [];

        const suites = ['clubs', 'diamonds', 'hearts', 'spades'];
        const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        let id = 1;
        suites.forEach(suit => {
            numbers.forEach(num => {
                this._cards.push(new Card(id, num, suit));
                id++;
            });
        });

        this.shuffle();
    }

    shuffle() {
        let copyCards = [...this._cards];
        let currentIndex = copyCards.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [copyCards[currentIndex], copyCards[randomIndex]] = [copyCards[randomIndex], copyCards[currentIndex]];
        }

        this._cards = copyCards;
    }

    draw() {
        return this._cards.shift();
    }
}

export default Deck;

