import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import deuces from 'deuces.js';

const {Card, Evaluator} = deuces;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Rival {
    _name;
    _money = 1000;
    _sets;
    _selectedSet;
    _images = {};
    // Cuantas fases tiene cada set
    _stages = {};
    _old = false;
    _corruption = 0;
    _currentCellId = 0;
    _out = false;
    _color = '';

    // propiedades relativas a un turno

    constructor(name) {
        this._name = name;
        this._color = this._randomColor();
        this._loadImages();
        this._initialize();
    }


    get sets() {
        return this._sets;
    }

    get selectedSet() {
        return this._selectedSet;
    }

    get images() {
        return this._images;
    }

    get money() {
        return this._money;
    }

    set money(value) {
        this._money = value;
    }

    get stages() {
        return this._stages;
    }

    get name() {
        return this._name;
    }

    get old() {
        return this._old;
    }

    get corruption() {
        return this._corruption;
    }

    set corruption(value) {
        this._corruption = value;
    }

    get currentCellId() {
        return this._currentCellId;
    }

    set currentCellId(value) {
        this._currentCellId = value;
    }


    get out() {
        return this._out;
    }

    set out(value) {
        this._out = value;
    }


    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }

    json() {
        return {
            name: this._name,
            imagesSet: this._images[this._selectedSet],
            money: this._money,
            old: this._old,
            corruption: this._corruption,
            currentCellId: this._currentCellId,
            out: this._out,
            color: this._color
        };
    }

    _randomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Methods
    _loadImages() {
        const files = readdirSync(__dirname + '/../../assets/players/' + this._name);
        for (const img of files) {
            const num = img.substring(img.length - 7);
            // Es un fichero de imagen de set
            if (!isNaN(parseInt(num[0]))) {
                if (!this._images[num[0]]) {
                    this._images[num[0]] = {};
                }
                if (!this._images[num[0]][num[1]]) {
                    this._images[num[0]][num[1]] = [];
                }

                // Sets
                this._images[num[0]][num[1]].push(img);

                // ¿Es nuevo o no? Si tiene más de 7 chars es img de set antigua
                if (img.length > 7) {
                    this._old = true;
                }
            }
        }
        this._sets = Object.keys(this._images).length;

        // Estados de cada set {1: 5, 2:5..}
        for (const set of Object.keys(this._images)) {
            if (this._old) {
                this._stages[set] = Object.keys(this._images[set]).length;
            } else {
                this._stages[set] = Object.keys(this._images[set]).length - 1;
            }
        }
    }

    _initialize() {
        // Set aleatorio
        this._selectedSet = Math.floor(Math.random() * this._sets) + 1;
        console.debug('Creado rival ' + this._name);
    }

    /*
        estimatedMoney() {
            let mon = 0;
            mon += this._money;
            // Le sumo también el dinero de los stage pendientes que tengo
            mon += this._leftStages * 100;
            return mon;
        }

        drawCard(card) {
            this._hand.push(card);
        }

        emptyHand() {
            this._hand = [];
        }

        fold(step) {
            // Marco todas sus decisiones de aquí al final como fold
            for (let i = step; i <= 7; i++) {
                this._decision[i] = 'fold';
            }
        }

        // El amount será el bid + toYou si es bid, y sólo toYou si es call
        bidOrCall(amount) {
            console.debug('[BID-CALL] ' + this._name + ' apuesta o call: ' + amount);
            let bet = 0, initialB = 0;
            // Calculo cuantos stages he apostado ya antes para no repetir
            let initialM = this._money;
            while (initialM < 0) {
                initialM += 100;
                initialB++;
            }

            // Resto lo apostado
            this._money -= amount;
            let aux = this._money;

            // Calculo cuantos stages apuesto
            while (aux < 0) {
                aux += 100;
                bet++;
            }
            // La apuesta final es los que apuesto en total menos los que ya había apostado previamente
            bet -= initialB;
            console.debug('A ' + this._name + ' le queda ' + this._money + ' apostando stages ' + bet);

            return bet;
        }

        // Si tengo más de 100 de dinero y no todos los stages, recupero
        recoverDebts() {
            let recovers = 0;

            while (this._money > 100 && (this._currentStage !== this._firstStage)) {
                if (this._old) {
                    // Los old van creciendo segun pierdes
                    this._currentStage--;
                    this._leftStages = this._lastStage - this._currentStage;
                } else {
                    // Los otros decrecen segun pierdes
                    this._currentStage++;
                    this._leftStages = this._currentStage;
                }
                this._money -= 100;
                recovers++;
            }
            console.debug('[RECOVER]' + this._name + ' recupera: ' + recovers);
            return recovers;
        }

        payDebts() {
            let debts = 0;

            console.debug('[PayDebts]' + this._name + ' debe este dinero: ' + this._money);
            // Si tengo money negativo resto stage
            while (this._money < 0) {
                if (this._old) {
                    // Los old van creciendo segun pierdes
                    this._currentStage++;
                    this._leftStages = this._lastStage - this._currentStage;
                } else {
                    // Los otros decrecen segun pierdes
                    this._currentStage--;
                    this._leftStages = this._currentStage;
                }
                this._money += 100;
                debts++;
            }
            console.debug('[PayDebts]' + this._name + ' paga estos stages: ' + debts);

            // Si me paso del último stage, dejo el último siempre. Puede pasar que apuestes más del último, le dejo ese margen
            if (this._old && (this._currentStage > this._lastStage)) {
                this._currentStage = this._lastStage;
                this._leftStages = this._lastStage - this._currentStage;
            }
            if (!this._old && (this._currentStage < this._lastStage)) {
                this._currentStage = this._lastStage;
                this._leftStages = this._currentStage;
            }

            // Si no tengo más stages, he perdido
            if (this._leftStages <= 0) {
                this._corruption = true;
                this._leftStages = 0;
                this._money = 0;
                console.debug('[PayDebts]' + this._name + ' ha perdido.');
            }

            return debts;
        }

        /!**
         *  5 card hand's unique prime product => rank in range [1, 7462]
         *     Examples:
         *     * Royal flush (best hand possible)          => 1
         *     * 7-5-4-3-2 unsuited (worst hand possible)  => 7462
         *!/
        evalHand() {
            let hand = [];
            for (let card of this._hand) {
                hand.push(Card.newCard(card.number + card.suit.charAt(0)));
            }

            const evaluator = new Evaluator();
            const rank = evaluator.evaluate(hand, []);
            const ply_class = evaluator.get_rank_class(rank);

            return {
                'rank': rank,
                'class': ply_class,
                'text': evaluator.class_to_string(ply_class)
            };
        }

        /!* class
            MAX_STRAIGHT_FLUSH: 1, - No tocar
            MAX_FOUR_OF_A_KIND: 2, - Buscar las 4 iguales
            MAX_FULL_HOUSE: 3, - No tocar
            MAX_FLUSH: 4, - No tocar
            MAX_STRAIGHT: 5, - No tocar
            MAX_THREE_OF_A_KIND: 6, - Buscar el trio
            MAX_TWO_PAIR: 7, - Buscar los pares
            MAX_PAIR: 8, - Buscar la pareja
            MAX_HIGH_CARD: 9 - Me quedo la mayor, o si tengo casi straights (4 seguidas de lo que sea) o casi flush (4 suits iguales)
        *!/
        iaDiscardCards(evaluation) {
            let discardedCards = 0;
            console.debug('++++ IA descarte: tengo una mano de ' + JSON.stringify(evaluation));
            switch (evaluation.class) {
                case 2:
                case 6:
                case 7:
                case 8:
                    discardedCards = this.discardNotSimilar();
                    break;
                case 9:
                    discardedCards = this.discardOther();
                    break;
            }

            return discardedCards;
        }

        discardNotSimilar() {
            let numbers = [];
            for (let c = 0; c < 5; c++) {
                numbers.push(this._hand[c].value);
            }
            // Busco los similares Output: [1, 3, 3, 3]
            const dupes = numbers.filter((item, index) => numbers.indexOf(item) !== index);
            // Cojo los únicos
            const uniques = [...new Set(dupes)];

            // Descarto las cartas que no sean estas uniques (que son las parejas)
            let newHand = [];
            for (let c = 0; c < 5; c++) {
                if (uniques.includes(this._hand[c].value)) {
                    newHand.push(this._hand[c]);
                } else {
                    console.debug('++++ Descarto: ' + this._hand[c].number + this._hand[c].suit);
                }
            }
            this._hand = newHand;

            // Devuelvo cuántas me he quitado
            return 5 - newHand.length;
        }

        discardOther() {
            let discarded = 0, end = false;

            // Primero miro a ver los suits iguales
            let suits = {c: 0, d: 0, s: 0, h: 0};
            for (let c = 0; c < 5; c++) {
                suits[this._hand[c].suit]++;
            }
            // A ver si alguno tiene valor 4
            Object.keys(suits).forEach(suit => {
                if (suits[suit] === 4) {
                    console.debug('++++ Tengo 4 del mismo palo, descartaré una.');
                    discarded = this.discardAllExceptSuit(suit);
                    end = true;
                }
            });

            // Si no terminé, miro si tengo casi straight
            let numbers = [];
            if (!end) {
                for (let c = 0; c < 5; c++) {
                    numbers.push(this._hand[c].value);
                }
                numbers = numbers.sort();

                let out = null;
                // Si las 4 primeras van seguidas descarto la 5
                if ((numbers[1] === numbers[0] + 1) && (numbers[2] === numbers[1] + 1) && (numbers[3] === numbers[2] + 1) && (numbers[4] === numbers[3] + 1)) {
                    out = numbers[5];
                }
                // Si los 4 últimos van seguidos, descarto el primero
                else if ((numbers[5] === numbers[4] + 1) && (numbers[2] === numbers[1] + 1) && (numbers[3] === numbers[2] + 1) && (numbers[4] === numbers[3] + 1)) {
                    out = numbers[0];
                }

                if (out !== null) {
                    console.debug('++++ Tengo casi un straight, descarto una buscándolo.');
                    let newHand = [];
                    for (let c = 0; c < 5; c++) {
                        if (this._hand[c].value !== out) {
                            newHand.push(this._hand[c]);
                        } else {
                            console.debug('++++ Descarto: ' + this._hand[c].number + this._hand[c].suit);
                        }
                    }
                    this._hand = newHand;
                    discarded = 1;
                    end = true;
                }
            }

            // Si no terminé, me quedo la mayor si es J o más
            const max = Math.max(numbers);
            if (!end && max >= 11) {
                console.debug('++++ Me quedo la mayor si es J o más, el resto la descarto.');
                let newHand = [];
                for (let c = 0; c < 5; c++) {
                    if (this._hand[c].value === max) {
                        newHand.push(this._hand[c]);
                    } else {
                        console.debug('++++ Descarto: ' + this._hand[c].number + this._hand[c].suit);
                    }
                }
                this._hand = newHand;
                discarded = 5 - newHand.length;
                end = true;
            }

            // Si llego aquí, me quito todo
            if (!end) {
                console.debug('++++ Me descarto toda la mano.');
                this._hand = [];
                discarded = 5;
                end = true;
            }

            return discarded;
        }

        discardAllExceptSuit(suit) {
            let newHand = [];
            for (let c = 0; c < 5; c++) {
                if (this._hand[c].suit === suit) {
                    newHand.push(this._hand[c]);
                } else {
                    console.debug('++++ Descarto: ' + this._hand[c].number + this._hand[c].suit);
                }
            }
            this._hand = newHand;
            return 5 - newHand.length;
        }

        // cards = [id, id, id]
        humanDiscardCards(cards) {
            let newHand = [];
            for (let c = 0; c < 5; c++) {
                if (!cards.includes(this._hand[c].id)) {
                    newHand.push(this._hand[c]);
                }
            }
            this._hand = newHand;
            return 5 - newHand.length;
        }

        iaDecideAction(options, rank) {
            const myStrategy = this._strategyMatrixByRank[this._strategy];
            let decisionTemp;

            // Meto un factor aleatorio, alterando el rank hasta un +-15%
            const percent = Math.floor(Math.random() * 15) + 1;
            let sign = [-1, 1];
            sign = sign[Math.floor(Math.random() * 2)];
            const diff = Math.floor(rank * percent / 100);
            rank = rank + sign * diff;
            // Que no se me vaya de los rangos
            rank = Math.max(1, rank);
            rank = Math.min(7492, rank);

            // Farol, según strategy un % de tirarme farol si no he bid
            const myFarol = this._strategyFarol[this._strategy];
            const dice = Math.floor(Math.random() * 100) + 1;
            if (myFarol <= dice) {
                // Lo que hago es cambiar el rank a otro como si tuviera suficiente para apostar
                switch (this._strategy) {
                    case 1:
                        if (rank >= 1940) rank = 900;
                        break;
                    case 2:
                        if (rank >= 2930) rank = 1000;
                        break;
                    case 3:
                        if (rank >= 4206) rank = 2000;
                        break;
                }
            }

            // Según venga un toYou mayor o menor y mi estrategia, pues apuesto más o menos o me rajo.
            // con strat 1 sumo la mitad, con 2 me mantengo y con 3 resto la mitad (para que parezca que viene menos)
            let toMe = this._toYou - Math.round((this._toYou * (this._strategy - 2)) / 2);
            if (toMe <= 5) {
                rank = rank + Math.ceil(rank * 0.20);
            } else if (toMe > 5 && toMe <= 20) {
                rank = rank + Math.ceil(rank * 0.10);
            } else if (toMe > 20 && toMe <= 35) {
                rank = rank + Math.ceil(rank * 0.05);
            } else if (toMe > 35 && toMe <= 50) {
                rank = rank - Math.ceil(rank * 0.10);
            } else if (toMe > 50) {
                rank = rank - Math.ceil(rank * 0.20);
            }
            // Que no se me vaya de los rangos
            rank = Math.max(1, rank);
            rank = Math.min(7492, rank);

            // Busco la decisión
            Object.keys(myStrategy).forEach(k => {
                const limits = k.split('-');
                if (rank >= limits[0] && rank <= limits[1]) {
                    decisionTemp = myStrategy[k];
                }
            });

            // Miro a ver si mi decisión está permitida o no. Si no lo está, paso a la siguiente en cascada hasta encontrar una válida
            let maxDecision;
            switch (decisionTemp.action + decisionTemp.extras) {
                case 'bid15':
                    maxDecision = {action: 'bid', extras: 15};
                    if (options.bid15) break;
                case 'bid10':
                    maxDecision = {action: 'bid', extras: 10};
                    if (options.bid10) break;
                case 'bid5':
                    maxDecision = {action: 'bid', extras: 5};
                    if (options.bid5) break;
                case 'bid2':
                    maxDecision = {action: 'bid', extras: 2};
                    if (options.bid2) break;
                case 'bid1':
                    maxDecision = {action: 'bid', extras: 1};
                    if (options.bid1) break;
                // Con call, puede ser stay o call
                case 'call':
                    maxDecision = {action: 'stay', extras: ''};
                    if (options.stay) break;
                    maxDecision = {action: 'call', extras: ''};
                    if (options.call) break;
                case 'fold':
                    maxDecision = {action: 'fold', extras: ''};
                    if (options.fold) break;
            }

            return maxDecision;
        }*/
}

export default Rival;
