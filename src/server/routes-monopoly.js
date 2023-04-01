import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import multer from 'multer';
import Game from './classes-monopoly/game.js';
import utils from './utils.js';
import {createReadStream, readdirSync} from 'node:fs';
import wrap from 'express-async-wrapper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

let game;
let existingFolders = [];
const videos = findVideos();

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

// Empieza un juego
router.post('/game', (req, res) => {
    game = new Game(req.body.players);
    res.json({data: game.json()});
});
// Devuelve estado de game
router.get('/game', (req, res) => {
    res.json({data: game.json()});
});
// Siguiente turno
router.get('/game/turn', (req, res) => {
    const result = game.nextTurn();
    res.json({data: game.json(), message: result.message, corrupt: result.corrupt});
});

// Usar coacción
// router.post('/game/duress', (req, res) => {
//     res.json({data: game.json()});
// });

// Lugares
router.post('/cell/buy/:cell', (req, res) => {
    try {
        // Check si puedo comprar
        const cellId = parseInt(req.params.cell);
        const cell = game.getCell(cellId);
        if (cell.owned || cell.type !== 'hotel') {
            return res.status(400).json({error: 'Cannot buy that'});
        }
        if (cell.costs[cell.type]['1'] > game.money) {
            return res.status(400).json({error: 'Not enough money'});
        }

        // Compro
        game.buyCell(cellId);
        return res.json({data: game.json()});
    } catch (e) {
        console.error(e);
        return res.status(400).json({error: 'Error buying that'});
    }
});
router.post('/cell/upgrade/:cell', (req, res) => {
    try {
        // Check si puedo mejorar
        const cellId = parseInt(req.params.cell);
        const cell = game.getCell(cellId);
        const maxLvl = Object.keys(cell.costs[cell.type]).reverse();
        if (!cell.owned || cell.type !== 'hotel' || cell.level === parseInt(maxLvl[0])) {
            return res.status(400).json({error: 'Cannot upgrade that'});
        }
        if (cell.costs[cell.type]['' + (cell.level + 1)] > game.money) {
            return res.status(400).json({error: 'Not enough money'});
        }

        // Compro
        game.upgradeCell(cellId);
        return res.json({data: game.json()});
    } catch (e) {
        console.error(e);
        return res.status(400).json({error: 'Error buying that'});
    }
});

router.get('/video/:folder/:cat', wrap(async (req, res) => {
    console.log(getVideo(req.params.folder, req.params.cat));
    // const tempStream = createReadStream(getVideo(req.params.folder, req.params.cat));
    // const type = await fileTypeStream(tempStream, {sampleSize: 1024});
    // console.log(type.fileType?.mime);
    res.writeHead(200, {'Content-Type': 'video/mp4'});
    createReadStream(getVideo(req.params.folder, req.params.cat)).pipe(res);
}));

function findVideos() {
    let tree = {};
    const dir = __dirname + '/../assets/videos/';

    // Leo las carpetas y videos
    readdirSync(dir).forEach(folder => {
        existingFolders.push(folder);
        readdirSync(dir + folder).forEach(subfolder => {
            readdirSync(dir + folder + '/' + subfolder).forEach(file => {
                if (!tree[folder]) {
                    tree[folder] = {};
                }
                if (!tree[folder][subfolder]) {
                    tree[folder][subfolder] = [];
                }
                tree[folder][subfolder].push(dir + folder + '/' + subfolder + '/' + file);
            });
        });
    });

    return tree;
}

function getVideo(folder, subfolder) {
    // Si no existe el folder, voy a general
    if (!existingFolders.includes(folder)) {
        console.log('noexite ' + folder + ' -- ' + subfolder);
        folder = 'general';
    }
    return videos[folder][subfolder][Math.floor(Math.random() * videos[folder][subfolder].length)];
}

export default router;
