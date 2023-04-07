import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import deuces from 'deuces.js';
import utils from '../utils.js';

const {Card, Evaluator} = deuces;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Player {
    _id;
    _name;
    _sets;
    _selectedSet;
    _images = {};
    _corruption = 0;
    // Cuantas fases tiene cada set
    _stages = {};
    _currentStage;
    _leftStages;
    _firstStage;
    _lastStage;
    _hand = [];
    _characters = [];
    _mission;
    _currentPlacePos;
    _maxCharacters = 4;
    _ko = false;


    constructor(name) {
        this._name = name;
        this._id = name;
        this._currentStage = 5;
        this._firstStage = 5;
        this._lastStage = 0;
        this._leftStages = this._currentStage;

        this._loadImages();
        this._initialize();
    }


    get id() {
        return this._id;
    }

    get sets() {
        return this._sets;
    }

    set sets(value) {
        this._sets = value;
    }

    get selectedSet() {
        return this._selectedSet;
    }

    set selectedSet(value) {
        this._selectedSet = value;
    }

    get images() {
        return this._images;
    }

    set images(value) {
        this._images = value;
    }

    get corruption() {
        return this._corruption;
    }

    set corruption(value) {
        this._corruption = value;
    }

    get stages() {
        return this._stages;
    }

    get hand() {
        return this._hand;
    }

    set hand(value) {
        this._hand = value;
    }

    get characters() {
        return this._characters;
    }

    set characters(value) {
        this._characters = value;
    }

    get maxCharacters() {
        return this._maxCharacters;
    }

    set maxCharacters(value) {
        this._maxCharacters = value;
    }

    get mission() {
        return this._mission;
    }

    set mission(value) {
        this._mission = value;
    }

    get ko() {
        return this._ko;
    }

    set ko(value) {
        this._ko = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get currentStage() {
        return this._currentStage;
    }

    set currentStage(value) {
        this._currentStage = value;
    }

    get firstStage() {
        return this._firstStage;
    }

    set firstStage(value) {
        this._firstStage = value;
    }

    get lastStage() {
        return this._lastStage;
    }

    set lastStage(value) {
        this._lastStage = value;
    }

    get leftStages() {
        return this._leftStages;
    }

    set leftStages(value) {
        this._leftStages = value;
    }


    get currentPlacePos() {
        return this._currentPlacePos;
    }

    set currentPlacePos(value) {
        this._currentPlacePos = value;
    }

    json() {
        return {
            id: this._id,
            name: this._name,
            imagesSet: this._images[this._selectedSet],
            hand: utils.jsonifyArrayOfClasses(this._hand),
            characters: utils.jsonifyArrayOfClasses(this._characters),
            currentStage: this._currentStage,
            lastStage: this._lastStage,
            leftStages: this._leftStages,
            corruption: this._corruption,
            ko: this._ko,
            currentPlacePos: this._currentPlacePos || null,
            mission: this._mission ? this._mission.json() : null,
            maxCharacters: this._maxCharacters

            // _sets;
            // Cuantas fases tiene cada set
            // _stages = {};
        };
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
            }
        }
        this._sets = Object.keys(this._images).length;

        // Estados de cada set {1: 5, 2:5..}
        for (const set of Object.keys(this._images)) {
            this._stages[set] = Object.keys(this._images[set]).length - 1;
        }
    }

    _initialize() {
        // Set aleatorio
        this._selectedSet = Math.floor(Math.random() * this._sets) + 1;
        // Si es old los stages van al revés

        // Es nuevo, el current stage será el máximo de stage del set
        this._currentStage = this._stages[this._selectedSet];
        this._lastStage = 0;
        this._firstStage = this._currentStage;
        this._leftStages = this._currentStage;
        console.debug('Creado rival ' + this._name);
    }


    addCard() {

    }

    playCard() {

    }

    addCharacter(card) {
        this._characters.push(card);
    }


    removeCharacter(id) {
        let removed = null;
        this._characters.forEach((c, idx) => {
            if (c.id === id) {
                removed = this._characters.splice(idx, 1);
            }
        });
        return removed;
    }

    lvlUpCharacter(id) {
        this._characters.forEach((c, idx) => {
            if (c.id === id) {
                c.charLevel++;
            }
        });
    }

    drawCard(card) {
        this._hand.push(card);
    }

    emptyHand() {
        this._hand = [];
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
    }
}

export default Player;
