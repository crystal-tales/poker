import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import multer from 'multer';
import Game from './classes/game.js';
import utils from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

let game;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../../.temp-img/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const upload = multer({storage: storage});

// Lista de jugadores disponibles
router.get('/players', (req, res) => {
    const folders = utils.listRivalsAvailable();
    res.json({players: folders});
});


// Ejecuto accion stay
router.get('/player/stay', (req, res) => {
    const result = game.humanActions('stay');
    res.json({data: game.json(), actions: result.actions, final: result.final});
});

// Ejecuto accion call
router.get('/player/call', (req, res) => {
    const result = game.humanActions('call');
    res.json({data: game.json(), actions: result.actions, final: result.final});
});

// Ejecuto accion fold
router.get('/player/fold', (req, res) => {
    const result = game.humanActions('fold');
    res.json({data: game.json(), actions: result.actions, final: result.final});
});

// Ejecuto accion discard
router.post('/player/discard', (req, res) => {
    const result = game.humanActions('discard', req.body.cards);
    res.json({data: game.json(), actions: result.actions, final: result.final});
});

// Ejecuto accion bid
router.post('/player/bid/:amount', (req, res) => {
    const you = game.getPlayer('you');
    if (you.estimatedMoney() < req.params.amount) {
        res.status(400).json({error: 'Not enough money'});
    } else {
        // Apuesto
        const result = game.humanActions('bid', req.params.amount);
        res.json({data: game.json(), actions: result.actions, final: result.final});
    }
});

// Obtener datos del juego
router.get('/game', (req, res) => {
    res.json({data: game.json()});
});

// Ejecuto acciones de IA hasta que vuelva a tocarle al jugador
router.get('/game/ia', (req, res) => {
    const result = game.iaActions();
    res.json({data: game.json(), actions: result.actions, final: result.final});
});

// Empieza un juego
router.post('/game', (req, res) => {
    game = new Game(req.body.players);
    res.json({data: game.json()});
});

// Añadimos rivales
router.post('/game/new-player/:player?', (req, res) => {
    let param = null, err = false;
    if (req.params.player) {
        param = req.params.player;
    }
    const r = game.addPlayer(param);
    if (r === false) {
        err = 'Can`t add more rivals';
    } else if (r === null) {
        err = 'No more rivals available';
    }
    res.json({data: game.json(), error: err});
});

// Reparto inicial de cartas en un turno para todos los jugadores
router.post('/game/new-turn', (req, res) => {
    const r = game.newTurn();
    res.json({data: game.json(), actions: r, final: null});
});

// CHEATS
router.get('/cheat/show-cards', (req, res) => {
    if (game.showCards) {
        res.status(400).json({error: 'Cheat already active'});
    }
    const you = game.getPlayer('you');
    if (you.money >= 25) {
        you.money -= 25;
        game.showCards = true;
        res.json({data: game.json()});
    } else {
        res.status(400).json({error: 'Not enough money'});
    }
});
router.get('/cheat/cannot-fold', (req, res) => {
    if (game.cheatCannotFold) {
        res.status(400).json({error: 'Cheat already active'});
    }
    const you = game.getPlayer('you');
    if (you.money >= 50) {
        you.money -= 50;
        game.cheatCannotFold = true;
        res.json({data: game.json()});
    } else {
        res.status(400).json({error: 'Not enough money'});
    }
});
router.get('/cheat/winning-hand', (req, res) => {
    if (game.cheatWinHand) {
        res.status(400).json({error: 'Cheat already active'});
    }
    const you = game.getPlayer('you');
    if (you.money >= 100) {
        you.money -= 100;
        game.cheatWinHand = true;
        res.json({data: game.json()});
    } else {
        res.status(400).json({error: 'Not enough money'});
    }
});

// Creamos un rival
router.post('/player/create', upload.fields([
    {name: 'portrait', maxCount: 1},
    {name: 'stage5', maxCount: 10},
    {name: 'stage4', maxCount: 10},
    {name: 'stage3', maxCount: 10},
    {name: 'stage2', maxCount: 10},
    {name: 'stage1', maxCount: 10},
    {name: 'stage0', maxCount: 10}
]), (req, res) => {
    let aux = JSON.parse(req.body.data);
    aux = aux.name.split(' ');
    let name = '';
    aux.forEach(trozo => {
        name += utils.capitalizeFirstLetter(trozo.toLowerCase());
    });

    utils.saveImages(name, req.files)
        .then((result) => {
            res.json({data: 'Set ' + result + ' created for ' + name});
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({error: 'Error saving images'});
        });
});

export default router;
