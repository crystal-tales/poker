import Deck from './deck.js';
import Player from './player.js';

const bidSteps = [1, 2, 5, 6];
const callSteps = [1, 2, 3, 5, 6, 7];
const foldSteps = [1, 2, 3, 5, 6, 7];


class Game {
    _players = [];
    _currentPlayer;
    _startingPlayer;
    _deck;
    _currentStep = 0;
    _pot = 0;
    _newGame = true;
    _showCards = false;
    _cheatCannotFold = false;
    _cheatWinHand = false;

    constructor(players) {
        this._deck = new Deck();
        this._players.push(new Player('you'));
        players.forEach(ply => {
            this._players.push(new Player(ply));
        });

        // Random starter
        const starter = Math.floor(Math.random() * this._players.length);
        this._startingPlayer = this._players[starter].name;
        this._currentPlayer = this._startingPlayer;
    }


    get currentPlayer() {
        return this._currentPlayer;
    }

    get startingPlayer() {
        return this._startingPlayer;
    }

    get currentStep() {
        return this._currentStep;
    }

    set currentStep(value) {
        this._currentStep = value;
    }

    get deck() {
        return this._deck;
    }

    get pot() {
        return this._pot;
    }

    get players() {
        return this._players;
    }

    get showCards() {
        return this._showCards;
    }

    set showCards(value) {
        this._showCards = value;
    }

    get cheatCannotFold() {
        return this._cheatCannotFold;
    }

    set cheatCannotFold(value) {
        this._cheatCannotFold = value;
    }

    get cheatWinHand() {
        return this._cheatWinHand;
    }

    set cheatWinHand(value) {
        this._cheatWinHand = value;
    }

    getPlayer(name) {
        let pl;
        this._players.forEach((ply) => {
            if (ply.name === name) {
                pl = ply;
            }
        });
        return pl;
    }

    getPlayerIndex(name) {
        let pl;
        this._players.forEach((ply, idx) => {
            if (ply.name === name) {
                pl = idx;
            }
        });
        return pl;
    }

    json() {
        let plys = [], you;
        this._players.forEach(ply => {
            if (ply.name === 'you') {
                you = ply.json();
            } else {
                plys.push(ply.json());
            }
        });

        return {
            game: {
                pot: this._pot,
                currentPlayer: this._currentPlayer,
                currentStep: this._currentStep,
                showCards: this._showCards,
                possibleYouActions: {
                    stay: this.canStay('you'),
                    call: this.canCall('you'),
                    bid5: this.canBid('you', 5),
                    bid10: this.canBid('you', 10),
                    bid15: this.canBid('you', 15),
                    bid20: this.canBid('you', 20),
                    bid25: this.canBid('you', 25),
                    fold: this.canFold('you'),
                    discard: this.canDiscard(),
                    cheat1: this.canCheat(25),
                    cheat2: this.canCheat(50),
                    cheat3: this.canCheat(100)
                }
            },
            rivals: plys,
            you: you
        };
    }

    newTurn(keepPot = false) {
        let actions = [];
        // Si es el primer turno de un juego, el jugador que es mano ya viene decidido
        if (this._newGame) {
            this._newGame = false;
        } else {
            // Empieza el turno el siguiente jugador al del turno anterior (this._startingPlayer)
            this._startingPlayer = this.nextPlayer(this._startingPlayer);
            this._currentPlayer = this._startingPlayer;
        }
        actions.push({who: '#separator', msg: '----------'});
        console.debug('Turno nuevo, empieza: ' + this._startingPlayer);

        // Reseteo ver cartas y los trucos
        this._showCards = false;
        this._cheatCannotFold = false;
        if (!keepPot) {
            this._pot = 0;
        }
        this._cheatWinHand = false;

        // Reinicio el mazo y barajo
        this._deck.create();
        actions.push({who: '#system', msg: 'Dealing new cards...'});
        // Reparto 5 cartas y ponog el pot inicial de 5
        this._players.forEach(player => {
            if (!player.ko) {
                player.toYou = 0;
                player.hasFolded = false;
                player.resetDecision();

                player.emptyHand();
                for (let i = 1; i <= 5; i++) {
                    // Cojo carta del mazo
                    const card = this._deck.draw();
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
        this.nextStep();
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
        // Si el jugador no ha foldeado o está ko, será el siguiente
        if (!ply.ko && !ply.hasFolded) {
            console.debug('...que es ' + ply.name + ' (idx ' + position + ')');
            return ply.name;
        } else {
            // en otro caso tengo que volver a calcular
            console.debug('...seguimos que ' + ply.name + ' (idx ' + position + ')' + ' no vale...');
            return this.nextPlayer(ply.name);
        }
    }

    nextStep() {
        console.debug(':::::::::: [FIN] Voy a pasar del step: ' + this._currentStep);
        this._currentStep++;
        if (this._currentStep > 8) {
            this._currentStep = 0;
        }
        console.debug(':::::::::: [FIN] al siguiente step: ' + this._currentStep);
    }

    // Ejecuta acciones de IA hasta que le vuelve a tocar al humano
    iaActions(actions = []) {
        let final = null;
        // Paso por todos los jugadores
        while (this._currentPlayer !== 'you') {
            console.debug('IAActions de ' + this._currentPlayer);
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
        const player = this.getPlayer(this._currentPlayer);

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
            bid5: this.canBid(player.name, 5),
            bid10: this.canBid(player.name, 10),
            bid15: this.canBid(player.name, 15),
            bid20: this.canBid(player.name, 20),
            bid25: this.canBid(player.name, 25),
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
                    actions.push({who: '#system', msg: 'All players but ' + check.whoDontFold + ' fold. The pot is kept for the next game.'});
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
        if (this._currentPlayer !== 'you') {
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
        this._currentPlayer = this.nextPlayer(this._currentPlayer);
        console.debug('[FIN] Siguiente jugador: ' + this._currentPlayer);

        // Siguiente Step, si se ha terminado el previo ya
        // Si no vengo directo a 4 u 8 de que todos hagan call/fold
        if (!directTo4 && !directTo8 && this.isStepFinished()) {
            this.nextStep();
        }

        // Si el siguiente es descarte de cartas, pongo al humano primero -> Da errores cambiar el orden
        // if (this._currentStep === 4) {
        //     this._currentPlayer = 'you';
        // }
        // Si el siguiente es la fase posterior a descarte, empezará el jugador inicial siempre
        // if (this._currentStep === 5) {
        //     this._currentPlayer = this._startingPlayer;
        // }

        // Si el siguiente step es el 8 Resuelvo el turno y devuelvo los resultados finales
        let final = null;
        if (this._currentStep === 8) {
            // Pongo el usuario en you ya que será quien controle el botón de continuar (que será el Deal que hará un newTurn)
            this._currentPlayer = 'you';
            // El siguiente step, para dejarlo en 0
            this.nextStep();

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
                actions.push({who: '#system', msg: win.winners[0] + ' wins' + cheto + '. Pot: ' + this._pot});
            } else {
                actions.push({who: '#system', msg: 'There is a tie between ' + win.winners.join(', ') + '. Pot distributed: ' + this._pot});
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
            if (!p.hasFolded) {
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

        let anyRivalAlive = false;
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
                anyRivalAlive = true;
            }
        });

        let endGame = false;
        // Comprobar si ha terminado la partida por estar ko el you o todos los demás
        if (this.getPlayer('you').ko || !anyRivalAlive) {
            endGame = true;
        }

        return {
            actions: actions,
            final: {
                endGame: endGame,
                areYouWinner: !anyRivalAlive
            }
        };
    }


    canBid(playerName, amount) {
        // Si no es mi momento de actuar, fuera
        if (this._currentPlayer !== playerName) return false;

        let can = false;
        // Si estoy en una de las fases adecuadas
        if (bidSteps.includes(this._currentStep)) {
            const pl = this.getPlayer(playerName);
            // Miro si lo que me viene más lo que quiero subir es menor que el dinero que tengo
            if ((pl.toYou + amount) <= pl.estimatedMoney()) {
                can = true;
            }
        }
        return can;
    }

    canCall(playerName) {
        // Si no es mi momento de actuar, fuera
        if (this._currentPlayer !== playerName) return false;

        let can = false;
        // Si estoy en una de las fases adecuadas
        if (callSteps.includes(this._currentStep)) {
            // En el caso de call, aunque no tenga dinero suficiente para cubrir el toYou, le dejo hacer call siempre
            can = true;
        }
        return can;
    }

    canFold(playerName) {
        // Si no es mi momento de actuar, fuera
        if (this._currentPlayer !== playerName) return false;
        // Si está el cheto activado y no es el humano, no puede fold
        if (this.cheatCannotFold && this.currentPlayer !== 'you') return false;

        return foldSteps.includes(this._currentStep);
    }

    canDiscard() {
        return this._currentStep === 4;
    }

    canStay(playerName) {
        // Si no es mi momento de actuar, fuera
        if (this._currentPlayer !== playerName || this._currentStep !== 1) return false;

        // Puedo Stay si es primer step y todos los demás que han actuado han stay
        let can = true;
        this._players.forEach(r => {
            if (r.name !== playerName && r.decision['1'] !== null && r.decision['1'] !== 'stay') {
                can = false;
            }
        });
        return can;
    }

    canCheat(cost) {
        return this._players[0].money >= cost;
    }

    /**
     * Comprueba si todos han tomado cierta acción en un step concreto
     * @param action Para stay miro si todos stay, para call todos call, para fold todos menos uno
     */
    checkIfAll(action) {
        let count = 0, dontFold;
        this._players.forEach(p => {
            if (p.decision[this._currentStep] === action) {
                count++;
            } else if (action === 'fold') {
                dontFold = p.name;
            }
        });

        let result = false;
        switch (action) {
            case'stay':
            case'call':
                if (count === this._players.length) result = true;
                break;
            case'fold':
                if (count === (this._players.length - 1)) result = true;
                break;
        }
        return {all: result, whoDontFold: dontFold};
    }

    refillAfterDiscard(player) {
        const cardsInHand = player.hand.length;

        for (let i = cardsInHand; i < 5; i++) {
            // Cojo carta del mazo
            const card = this._deck.draw();
            // Se la doy al jugador
            player.drawCard(card);
        }
    }
}

export default Game;

