import Player from './player.js';
import utils from '../utils.js';
import Board from './board.js';
import Deck from './deck.js';

const cheat = true;

class Game {
    _players = [];
    _currentPlayerId;
    _humanPlayerId;
    _usedPlayers = [];
    _board;
    _newGame = false;
    _decks;
    _cementeries = {};

    constructor(players) {
        this._newGame = true;
        this._board = new Board();

        // Genero decks
        this._decks = new Deck();
        this._decks.create();

        this._cementeries = {
            characters: [],
            places: [],
            guardians: [],
            spells: [],
            missions: []
        };

        // Genero players. El primero será el human
        players.forEach(id => {
            let ply = new Player(id);

            // Cada player roba un char inicial
            ply.addCharacter(this._decks.drawCharacter());

            // También una misión
            ply.mission = this._decks.drawMission();

            this._players.push(ply);
            this._usedPlayers.push(id);
            if (!this._humanPlayerId) {
                this._humanPlayerId = id;
                this._currentPlayerId = id;
            }
        });
    }

    get currentPlayerId() {
        return this._currentPlayerId;
    }

    get currentPlayer() {
        let ply = null;
        for (const p of this._players) {
            if (p.id === this._currentPlayerId) {
                ply = p;
            }
        }
        return ply;
    }

    get board() {
        return this._board;
    }

    get players() {
        return this._players;
    }

    get humanPlayerId() {
        return this._humanPlayerId;
    }

    get humanPlayer() {
        let ply = null;
        for (const p of this._players) {
            if (p.id === this._humanPlayerId) {
                ply = p;
            }
        }
        return ply;
    }

    get decks() {
        return this._decks;
    }

    get cementeries() {
        return this._cementeries;
    }


    getPlayer(name) {
        console.log(name);
        let pl, idx;
        this._players.forEach((ply, index) => {
            console.log(ply.name + ' === ' + name);
            if (ply.name === name) {
                pl = ply;
                idx = index;
            }
        });
        console.log({player: pl, index: idx});
        return {player: pl, index: idx};
    }

    setPlayer(data) {
        this._players[data.index] = data.player;
    }

    getRandomNewPlayer() {
        let selected = null;
        const listPlayers = utils.listRivalsAvailable();
        while (selected === null && (this._usedPlayers.length < listPlayers.length)) {
            const item = listPlayers[Math.floor(Math.random() * listPlayers.length)];
            if (!this._usedPlayers.includes(item)) {
                selected = item;
            }
        }
        return selected;
    }

    /**
     * @returns {null|boolean} true si se ha agregado, false si no había hueco libre, null si no hay más playeres disponibles
     */
    addPlayer(playerOut = null) {
        const np = this.getRandomNewPlayer();
        if (np === null) {
            return null;
        }

        if (playerOut === null) {
            // Si no sustituyo a nadie y no hay hueco, fuera
            if (this._players.length === 5) {
                return false;
            }
            // Creo un nuevo player el último de la lista, si hay huecos
            this._players.push(new Player(np));
        } else {
            // pongo al jugador en la posición del jugador sustituido
            this._players.forEach((p, idx) => {
                if (p.name === playerOut) {
                    this._players[idx] = new Player(np);
                }
            });
        }
        this._usedPlayers.push(np);
        return true;
    }

    json() {
        const out = {
            currentPlayer: this._currentPlayerId,
            board: this._board.json(),
            currentPlayerId: this._currentPlayerId,
            humanPlayerId: this._humanPlayerId,
            decks: {
                characters: utils.jsonifyArrayOfClasses(this._decks.characters),
                places: utils.jsonifyArrayOfClasses(this._decks.places),
                guardians: utils.jsonifyArrayOfClasses(this._decks.guardians),
                missions: utils.jsonifyArrayOfClasses(this._decks.missions),
                spells: utils.jsonifyArrayOfClasses(this._decks.spells)
            },
            cementeries: {
                characters: utils.jsonifyArrayOfClasses(this._cementeries.characters),
                places: utils.jsonifyArrayOfClasses(this._cementeries.places),
                guardians: utils.jsonifyArrayOfClasses(this._cementeries.guardians),
                missions: utils.jsonifyArrayOfClasses(this._cementeries.missions),
                spells: utils.jsonifyArrayOfClasses(this._cementeries.spells)
            },
            players: utils.jsonifyArrayOfClasses(this._players)
        };
        console.log(JSON.stringify(out));
        return out;
    }

    nextTurn() {
        // Primero paso al player siguiente
        this.nextPlayer();

        // Si el siguiente es el jugador, no haré nada
        if (this._currentPlayerId === null) {
            console.log('Toca al jugador');
            return {message: 'Your turn'};
        }


        // Devuelvo los resultados al jugador para que elija si ha de elegir o continue al siguiente turno
        return result;
    }

    nextPlayer() {
        let found = false, end = true;
        for (const player of this._players) {
            // Si encontré en el bucle anterior al current, entonces este es el siguiente, o si vengo del jugador (entonces el siguiente será el primer player)
            if (found || this._currentPlayerId === null) {
                this._currentPlayerId = player.name;
                // Encontré al siguiente y no he terminado con la lista
                end = false;
                break;
            } else if (this._currentPlayerId === player.name) {
                // He encontrado al current, lo marco para escoger al siguiente si es que existe
                found = true;
            }
        }

        // Si terminé la lista de playeres, entonces es que no había siguiente (di toda la vuelta) y le toca al jugador
        if (end) {
            this._currentPlayerId = null;
        }
    }

    rollDice(max) {
        const min = 1;
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    moveCells(number) {
        const data = this.getPlayer(this._currentPlayerId);
        const currentCellId = data.player.currentCellId;

        // posición en el tablero de la celda actual
        let position = cellOrder.indexOf(currentCellId);
        // Avanzo las posiciones del dado
        let pasoMeta = false;
        for (let i = 0; i < number; i++) {
            position++;
            // Si me salgo del tablero... voy a la primera casilla y paso por meta
            if (position > (cellOrder.length - 1)) {
                position = 0;
                pasoMeta = true;
            }
        }

        data.player.currentCellId = cellOrder[position];
        this.setPlayer(data);
        return pasoMeta;
    }

    execCell() {
        let msg = '', n = 0, corrupt = false;
        const data = this.getPlayer(this._currentPlayerId);
        const cell = this.getCell(data.player.currentCellId);

        // Dependiendo del tipo de celda hago una cosa u otra
        switch (cell.type) {
            case 'police':
                // x turnos
                n = this.random(2, 4);
                this._counters.police += n;
                msg = 'Police: ' + n + ' turns';
                break;
            case 'inspector':
                n = this.random(2, 4);
                this._counters.inspector += n;
                msg = 'Inspection: ' + n + ' turns';
                break;
            case 'mafia':
                n = this.random(2, 4);
                this._counters.mafia += n;
                msg = 'Mafia: ' + n + ' turns';
                break;
            case 'corruption':
                n = this.random(2, 4);
                this._counters.corruption += n;
                msg = 'Corruption: ' + n + ' turns';
                break;
            case 'extortion':
                n = this.random(1, 4) * 500;
                data.player.money -= n;
                this.setPlayer(data);
                msg = 'Extortion for $-' + n;
                break;
            case 'subsidy':
                n = this.random(1, 4) * 1000;
                data.player.money += n;
                this.setPlayer(data);
                msg = 'Subsidy for $' + n;
                break;
            case 'stock':
                n = this.random(-2, 5) * 1000;
                if (n === 0) {
                    n = 1000;
                }
                this._money = this._money + n;
                msg = 'Stock for $' + n;
                break;
            case 'card':
                msg = '';
                break;
            case 'hotel':
                if (!cell.owned) {
                    break;
                }

                // Cojo dinero del player
                if (data.player.money > 0) {
                    // Nivel máximo 5 de la parte hotel
                    let lvl = Math.min(cell.level, 5);
                    // Cojo precio del hotel (solo parte de hotel)
                    let price = cell.prices['hotel'][lvl];
                    let alreadyDoubled = false;

                    // Si hay que duplicar o hacer gratis hotel
                    if (this._counters.inspector > 0) {
                        // this._counters.inspector--;
                        msg = 'Hotels shutdown due to inspection';
                        break;
                    }
                    if (this._counters.corruption > 0) {
                        // this._counters.corruption--;
                        price = price * 2;
                        alreadyDoubled = true;
                        msg = 'Politician corruption doubled hotel prices. ';
                    }

                    // Los modificadores de celda
                    if (cell.closed > 0) {
                        cell.closed--;
                        msg = 'This hotel is temporary closed';
                        this.setCell(cell);
                        break;
                    }
                    if (cell.special > 0 && !alreadyDoubled) {
                        cell.special--;
                        msg = 'This hotel is very popular and have prices doubled temporary';
                        price = price * 2;
                        this.setCell(cell);
                    }

                    data.player.money -= price;
                    this._money += price;
                    msg += 'Hotel: billed for ' + price;
                } else {
                    let lvl = cell.level;
                    // Cojo precio del hotel (solo parte de hotel)
                    let reward = cell.prices['hotel'][lvl];
                    let alreadyFree = false;

                    // Si el nivel del h+++ no es 6 o más no pasa nada especial, se devuelve algo de dinero
                    if (lvl < 6) {
                        reward = 100;
                        msg = ' Player had no money and worked cleaning dishes. ';
                    } else {
                        // Si hay que duplicar o hacer gratis hotel
                        if (this._counters.police > 0) {
                            // this._counters.police--;
                            msg = 'Parlour shutdown due to police raid';
                            break;
                        }
                        if (this._counters.mafia > 0) {
                            // this._counters.mafia--;
                            reward = 0;
                            alreadyFree = true;
                            msg = 'Mafia forced parlour workers to work for free. ';
                        }

                        // Los modificadores de celda
                        if (cell.closed > 0) {
                            cell.closed--;
                            msg = 'This parlour is temporary closed';
                            this.setCell(cell);
                            break;
                        }
                        if (cell.special > 0 && !alreadyFree) {
                            cell.special--;
                            reward = 0;
                            msg = 'This parlour is very popular and made workers to work for free temporary. ';
                            this.setCell(cell);
                        }

                        // Funcionamiento normal
                        if ((cell.level === 6 && data.player.corruption < 6) || (cell.level === 7 && data.player.corruption < 9) || (cell.level === 8)) {
                            data.player.corruption++;
                        }
                        // TODO aqui podría comprobar si corruption 10 para sacarle del juego
                        corrupt = true;
                    }

                    data.player.money += reward;
                    this._money -= reward;
                    msg += 'Parlour: paid workers ' + reward;
                }
                this.setPlayer(data);
                break;
        }

        return {message: msg, corrupt: corrupt};
    }

    random(min, max) {
        max = max + 1;
        return Math.floor(Math.random() * (max - min) + min);
    }

    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////
    //////////////////////////////////////


    newTurn(keepPot = false) {
        let actions = [];
        // Si es el primer turno de un juego, el jugador que es mano ya viene decidido
        if (this._newGame) {
            this._newGame = false;
        } else {
            // Empieza el turno el siguiente jugador al del turno anterior (this._startingPlayer)
            this._startingPlayer = this.nextPlayer(this._startingPlayer);
            this._currentPlayerId = this._startingPlayer;
        }
        actions.push({who: '#separator', msg: '- - - - - - - - - -'});
        console.debug('Turno nuevo, empieza: ' + this._startingPlayer);

        // Reseteo ver cartas y los trucos
        this._showCards = false;
        this._cheatCannotFold = false;
        if (!keepPot) {
            this._pot = 0;
        }
        this._cheatWinHand = false;

        // Reinicio el mazo y barajo
        this._board.create();
        actions.push({who: '#system', msg: 'Dealing new cards...'});
        // Reparto 5 cartas y pongo el pot inicial de 5
        this._players.forEach(player => {
            if (!player.ko) {
                player.toYou = 0;
                player.hasFolded = false;
                player.resetDecision();

                player.emptyHand();
                for (let i = 1; i <= 5; i++) {
                    // Cojo carta del mazo
                    const card = this._board.draw();
                    // Se la doy al jugador
                    player.drawCard(card);
                }

                // Poteo
                const resPot = player.bidOrCall(5);
                if (resPot > 0) {
                    actions.push({who: player.name, msg: 'I bet 1 cloth to pay the initial pot.'});
                }
                this._pot += 5;
            }
        });

        // Avanzo el juego al siguiente paso
        actions = this.nextStep(actions);
        return actions;
    }

    /**
     * Pasa la acción o turno al siguiente jugador
     * @param current Name del jugador actual (bien sea de turno [startingPlayer] o de acción dentro del turno [currentPlayer])
     */
    nextPlayer(current) {
        // Cojo al jugador que tenía la mano en el turno y paso al siguiente
        let position = this.getPlayerIndex(current);
        console.debug('Pasamos al siguiente jugador (index del actual ' + position + ')...');

        position = position + 1;
        if (position >= this._players.length) {
            position = 0;
        }

        const ply = this._players[position];
        // Si el jugador está ko, será el siguiente
        if (!ply.ko) {
            console.debug('...que es ' + ply.name + ' (idx ' + position + ')');
            return ply.name;
        } else {
            // en otro caso tengo que volver a calcular
            console.debug('...seguimos que ' + ply.name + ' (idx ' + position + ')' + ' no vale...');
            return this.nextPlayer(ply.name);
        }
    }

    nextStep(actions) {
        actions.push({who: '#separator', msg: '- - - - - - - - - -'});
        console.debug(':::::::::: [FIN] Voy a pasar del step: ' + this._currentStep);
        this._currentStep++;
        if (this._currentStep > 8) {
            this._currentStep = 0;
        }
        console.debug(':::::::::: [FIN] al siguiente step: ' + this._currentStep);
        return actions;
    }

    // Ejecuta acciones de IA hasta que le vuelve a tocar al humano
    iaActions(actions = []) {
        let final = null;
        // Paso por todos los jugadores
        while (this._currentPlayerId !== 'you') {
            console.debug('IAActions de ' + this._currentPlayerId);
            const iaAction = this.executeIAAction();
            actions = actions.concat(iaAction.actions);

            const acts = this.finalizeActions(iaAction.directTo4, iaAction.directTo8);
            actions = actions.concat(acts.actions);
            final = acts.final;
        }

        console.debug('[IA] Acciones IA: ' + JSON.stringify({actions: actions, final: final}));
        return {actions: actions, final: final};
    }

    executeIAAction() {
        let actions = [], clothesBet = 0, check, directTo4 = false, directTo8 = false;

        // Cojo los datos: jugador actual, step actual
        const player = this.getPlayer(this._currentPlayerId);

        // Calculo el valor de la mano
        const evaluation = player.evalHand();
        console.debug('[EIA] ' + player.name + ' tiene mano ' + JSON.stringify(evaluation));

        // Según mi estrategia, cuánto me viene y el valor de mi mano, actúo de forma más temeraria o conservadora
        const actionToTake = this.decideIAAction(player, evaluation);
        player._decision[this._currentStep] = actionToTake.action;

        switch (actionToTake.action) {
            case 'discard':
                const discarded = player.iaDiscardCards(evaluation);
                // Una vez descartado, robo más cartas
                this.refillAfterDiscard(player);
                actions.push({who: player.name, msg: 'I discard ' + discarded + ' cards.'});
                break;
            case 'stay':
                actions.push({who: player.name, msg: 'I`ll stay.'});
                check = this.checkIfAll('stay');
                if (check.all) {
                    console.debug('[EIA] ' + player.name + ' todos stay');
                    actions.push({who: '#system', msg: 'All players stay. The pot is kept.'});
                    // Inicio turno nuevo sin resetear el pot
                    // TODO comprobar si he reseteado todo lo necesario, decisions y demás cosas, reparto de mano...
                    const r = this.newTurn(true);
                    actions = actions.concat(r);
                    return {actions: actions, final: null};
                }
                break;
            case 'fold':
                player.hasFolded = true;
                player.fold(this._currentStep);
                actions.push({who: player.name, msg: 'I fold.'});
                check = this.checkIfAll('fold');
                if (check.all) {
                    console.debug('[EIA] ' + player.name + ' todos fold, paso a 8.');
                    actions.push({who: '#system', msg: 'All players but ' + check.whoDontFold + ' fold.'});
                    // Paso directamente a la fase de comprobar ganadores, que será solo uno
                    this._currentStep = 8;
                    directTo8 = true;
                }
                break;
            case 'call':
                clothesBet = player.bidOrCall(player.toYou);
                actions.push({who: player.name, msg: 'I call.'});
                if (clothesBet > 0) {
                    actions.push({who: player.name, msg: 'I bet ' + clothesBet + ' of my clothes.'});
                }
                this._pot += player.toYou;
                // El mío lo pongo a 0 porque ya lo he pagado
                player.toYou = 0;

                check = this.checkIfAll('call');
                if (check.all) {
                    console.debug('[EIA] ' + player.name + ' todos call...');
                    actions.push({who: '#system', msg: 'All players call.'});
                    // Paso directamente a la fase de descarte o la final, según esté en una u otra
                    if (this._currentStep === 1 || this._currentStep === 2) {
                        this._currentStep = 4;
                        directTo4 = true;
                        console.debug('[EIA] ...paso a 4');
                    }
                    if (this._currentStep === 5 || this._currentStep === 6) {
                        this._currentStep = 8;
                        directTo8 = true;
                        console.debug('[EIA] ...paso a 8');
                    }
                }
                break;
            case 'bid':
                let much = parseInt(actionToTake.data);
                // Además de lo que subo, tengo que restar el toYou que venía
                clothesBet = player.bidOrCall(much + player.toYou);
                if (player.toYou > 0) actions.push({who: player.name, msg: 'I raise ' + much + '.'});
                else actions.push({who: player.name, msg: 'I bet ' + much + '.'});

                // Aumento el toYou del resto de jugadores, con lo que he apostado
                this._players.forEach(p => {
                    if (p.name !== player.name) {
                        p.toYou += much;
                    }
                });
                this._pot += (much + player.toYou);
                // El mío lo pongo a 0 porque ya lo he pagado
                player.toYou = 0;

                if (clothesBet > 0) {
                    actions.push({who: player.name, msg: 'I bet ' + clothesBet + ' of my clothes.'});
                }
                break;
        }

        return {actions: actions, directTo4: directTo4, directTo8: directTo8};
    }

    /**
     * Decide qué hacer la IA
     * @param player Objeto del jugador IA
     * @param evaluation Objeto {"rank": 7162, "class": 9, "text": "High Card" }
     * @returns {{data: null, action: null}}
     */
    decideIAAction(player, evaluation) {
        let action = null, extras = null;

        // Calculo las opciones que puedo tomar: bid, call, stay, etc.
        const options = {
            stay: this.canStay(player.name),
            call: this.canCall(player.name),
            bid1: this.canBid(player.name, 1),
            bid2: this.canBid(player.name, 2),
            bid5: this.canBid(player.name, 5),
            bid10: this.canBid(player.name, 10),
            bid15: this.canBid(player.name, 15),
            fold: this.canFold(player.name),
            discard: this.canDiscard()
        };
        console.debug('[DIA] ' + player.name + ' puede: ' + JSON.stringify(options));
        // Si está activo el cheat de no poder foldear
        if (this._cheatCannotFold) {
            options.fold = false;
        }

        // Si puedo descartar es que estoy en ese paso así que descartaré
        if (options.discard) {
            action = 'discard';
        } else {
            // Decido qué hacer
            const todo = player.iaDecideAction(options, evaluation.rank);
            action = todo.action;
            extras = todo.extras;
        }
        console.debug('[DIA] ' + player.name + ' decide: ' + JSON.stringify({action, extras}));

        return {action: action, data: extras};
    }

    /**
     * Ejecuta las acciones humanas
     * @param action
     * @param data
     * @returns {{final: null, actions: []}}
     */
    humanActions(action, data = null) {
        const you = this.getPlayer('you');
        let actions = [], clothesBet = 0, check, directTo8 = false, directTo4 = false;

        // Guardo la acción hecha
        you._decision[this._currentStep] = action;

        // ejecuto mi acción
        switch (action) {
            case 'discard':
                const discarded = you.humanDiscardCards(data);
                // Una vez descartado, robo más cartas
                this.refillAfterDiscard(you);
                actions.push({who: you.name, msg: 'I discard ' + discarded + ' cards.'});
                break;
            case 'stay':
                actions.push({who: you.name, msg: 'I stay.'});
                check = this.checkIfAll('stay');
                if (check.all) {
                    actions.push({who: '#system', msg: 'All players stay. The pot is kept.'});
                    // Inicio turno nuevo sin resetear el pot
                    const r = this.newTurn(true);
                    actions = actions.concat(r);
                    return {actions: actions, final: null};
                }
                break;
            case 'fold':
                you.hasFolded = true;
                you.fold(this._currentStep);
                actions.push({who: you.name, msg: 'I fold.'});
                check = this.checkIfAll('fold');
                if (check.all) {
                    actions.push({
                        who: '#system',
                        msg: 'All players but ' + check.whoDontFold + ' fold. The pot is kept for the next game.'
                    });
                    // Paso directamente a la fase de comprobar ganadores, que será solo uno
                    this._currentStep = 8;
                    directTo8 = true;
                }
                break;
            case 'call':
                clothesBet = you.bidOrCall(you.toYou);
                actions.push({who: you.name, msg: 'I call.'});
                if (clothesBet > 0) {
                    actions.push({who: you.name, msg: 'I bet ' + clothesBet + ' of my clothes.'});
                }
                this._pot += (you.toYou);
                // El mío lo pongo a 0 porque ya lo he pagado
                you.toYou = 0;

                check = this.checkIfAll('call');
                if (check.all) {
                    actions.push({who: '#system', msg: 'All players call.'});
                    // Paso directamente a la fase de descarte o la final, según esté en una u otra
                    if (this._currentStep === 1 || this._currentStep === 2) {
                        this._currentStep = 4;
                        directTo4 = true;
                    }
                    if (this._currentStep === 5 || this._currentStep === 6) {
                        this._currentStep = 8;
                        directTo8 = true;
                    }
                }
                break;
            case 'bid':
                let much = parseInt(data);
                // Además de lo que subo, tengo que restar el toYou que venía
                clothesBet = you.bidOrCall(much + you.toYou);
                if (you.toYou > 0) actions.push({who: you.name, msg: 'I raise ' + much + '.'});
                else actions.push({who: you.name, msg: 'I bet ' + much + '.'});

                // Aumento el toYou del resto de jugadores, con lo que he apostado
                this._players.forEach(p => {
                    if (p.name !== you.name) {
                        p.toYou += much;
                    }
                });
                this._pot += (much + you.toYou);
                // El mío lo pongo a 0 porque ya lo he pagado
                you.toYou = 0;

                if (clothesBet > 0) {
                    actions.push({who: you.name, msg: 'I bet ' + clothesBet + ' of my clothes.'});
                }
                break;
        }

        const acts = this.finalizeActions(directTo4, directTo8);
        actions = actions.concat(acts.actions);

        // Si el siguiente jugador no es humano, le doy paso a la IA
        if (this._currentPlayerId !== 'you') {
            console.debug('[HUMAN] Doy paso a la IA: ' + JSON.stringify(actions));
            return this.iaActions(actions);
        } else {
            console.debug('[HUMAN] Acciones humanas: ' + JSON.stringify({actions: actions, final: acts.final}));
            return {actions: actions, final: acts.final};
        }
    }

    /**
     * Comprueba si un step ha finalizado, que es cuando todos han decidido una acción
     */
    isStepFinished() {
        let is = true;
        this._players.forEach(p => {
            // Si alguno no ha decidido aún, no hemos terminado
            if (p.decision[this._currentStep] === null) {
                is = false;
            }
        });
        return is;
    }

    /**
     * Finalizo el proceso de ejecutar acciones
     * @returns {{final: null, actions: []}}
     */
    finalizeActions(directTo4, directTo8) {
        let actions = [];
        // Siguiente jugador
        this._currentPlayerId = this.nextPlayer(this._currentPlayerId);
        console.debug('[FIN] Siguiente jugador: ' + this._currentPlayerId);

        // Siguiente Step, si se ha terminado el previo ya
        // Si no vengo directo a 4 u 8 de que todos hagan call/fold
        if (!directTo4 && !directTo8 && this.isStepFinished()) {
            actions = this.nextStep(actions);
        }

        // Si el siguiente es descarte de cartas, pongo al humano primero -> Da errores cambiar el orden
        // if (this._currentStep === 4) {
        //     this._currentPlayerId = 'you';
        // }
        // Si el siguiente es la fase posterior a descarte, empezará el jugador inicial siempre
        // if (this._currentStep === 5) {
        //     this._currentPlayerId = this._startingPlayer;
        // }

        // Si el siguiente step es el 8 Resuelvo el turno y devuelvo los resultados finales
        let final = null;
        if (this._currentStep === 8) {
            // Pongo el usuario en you ya que será quien controle el botón de continuar (que será el Deal que hará un newTurn)
            this._currentPlayerId = 'you';
            // El siguiente step, para dejarlo en 0
            actions = this.nextStep(actions);

            // Evaluamos ganador
            const win = this.evalWinner();
            console.debug('[WIN] Evaluacion de ganador: ' + JSON.stringify(win));

            // mensajes de la mano de cada uno salvo que hayan fold
            if (!directTo8) {
                win.hands.forEach(h => {
                    actions.push({who: h.name, msg: 'I have ' + h.text});
                });
                // Muestro las manos de todos
                this._showCards = true;
            }
            if (win.winners.length === 1) {
                let cheto = this._cheatWinHand ? ' (cheating)' : '';
                let txt = '';
                if (win.winners[0] === 'you') {
                    txt = 'You win';
                } else {
                    txt = win.winners[0] + ' wins';
                }
                actions.push({who: '#system', msg: txt + cheto + '. Pot: ' + this._pot});
            } else {
                actions.push({
                    who: '#system',
                    msg: 'There is a tie between ' + win.winners.join(', ') + '. Pot distributed: ' + this._pot
                });
            }

            // Pagamos deudas y damos premios
            const resT = this.resolveTurn(win);
            console.debug('[WIN] Resolución de turno: ' + JSON.stringify(resT));
            actions = actions.concat(resT.actions);
            final = resT.final;
        }

        console.debug('[FIN] FinalizeActions: ' + JSON.stringify({actions: actions, final: final}));
        return {
            actions: actions,
            final: final
        };
    }

    evalWinner() {
        let winners = [], hands = [], ranks = [];
        // Evalúo manos
        this._players.forEach(p => {
            if (!p.hasFolded && !p.ko) {
                const evl = p.evalHand();
                hands.push({name: p.name, rank: evl.rank, text: evl.text});
                ranks.push(evl.rank);
            }
        });
        console.debug('[WIN] Las manos y rangos evaluados: ' + JSON.stringify(hands) + ' --- ' + ranks);

        // El rank ganador, es el que tenga el rank más bajo (a menos mejor)
        const winRank = Math.min(...ranks);
        console.debug('[WIN] Winner rank: ' + winRank);
        hands.forEach(h => {
            if (h.rank === winRank) {
                winners.push(h.name);
            }
        });

        // Si está el cheto de ganar, el ganador eres tú, siempre que no hayas fold
        const y = this.getPlayer('you');
        if (this._cheatWinHand && !y.hasFolded) {
            winners = [y.name];
        }

        return {winners: winners, hands: hands};
    }

    resolveTurn(win) {
        let actions = [];
        // Reparto el bote entre los ganadores
        const eachPot = Math.floor(this._pot / win.winners.length);
        const remainder = this._pot % win.winners.length;
        // El remanente va a uno de los ganadores aleatorio
        const remainWinner = win.winners[Math.floor(Math.random() * win.winners.length)];
        this._players.forEach(p => {
            if (win.winners.includes(p.name)) {
                p.money = p.money + eachPot;
            }
            if (p.name === remainWinner) {
                p.money = p.money + remainder;
            }
        });

        let anyPlayerAlive = false;
        // Pago deudas para dejar moneys en positivo, y también recupero stages
        this._players.forEach(p => {
            const debts = p.payDebts();
            const recover = p.recoverDebts();
            if (debts > 0) {
                actions.push({who: p.name, msg: 'I lose ' + debts + ' clothes. Hope you like it!'});
            }
            if (recover > 0) {
                actions.push({who: p.name, msg: 'I recover ' + recover + ' clothes. Yeah!'});
            }

            // miro si está aún vivo este jugador
            if (p.name !== 'you' && !p.ko) {
                anyPlayerAlive = true;
            }
        });

        let endGame = false;
        // Comprobar si ha terminado la partida por estar ko el you o todos los demás
        if (this.getPlayer('you').ko || !anyPlayerAlive) {
            endGame = true;
        }

        return {
            actions: actions,
            final: {
                endGame: endGame,
                areYouWinner: !anyPlayerAlive
            }
        };
    }

    /**
     * Comprueba si todos han tomado cierta acción en un step concreto
     * @param action Para stay miro si todos stay, para call todos call, para fold todos menos uno
     */
    checkIfAll(action) {
        let count = 0, dontFold, countKO = 0;
        this._players.forEach(p => {
            if (p.ko) countKO++;

            // Excluyo a los KO
            if (!p.ko && p.decision[this._currentStep] === action) {
                count++;
            }

            if (!p.ko && p.decision[this._currentStep] !== action && action === 'fold') {
                dontFold = p.name;
            }
        });

        let result = false, countAllActivePlayers = this._players.length - countKO;
        switch (action) {
            case'stay':
            case'call':
                if (count === countAllActivePlayers) result = true;
                break;
            case'fold':
                // Aquí es todos fold menos uno que será el que gane
                if (count === (countAllActivePlayers - 1)) result = true;
                break;
        }
        return {all: result, whoDontFold: dontFold};
    }

    refillAfterDiscard(player) {
        const cardsInHand = player.hand.length;

        for (let i = cardsInHand; i < 5; i++) {
            // Cojo carta del mazo
            const card = this._board.draw();
            // Se la doy al jugador
            player.drawCard(card);
        }
    }
}

export default Game;

