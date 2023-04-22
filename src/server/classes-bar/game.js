import Player from './player.js';
import utils from '../utils.js';
import House from './house.js';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {readFileSync} from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const playerDir = __dirname + '/../../assets/players/';

class Game {
    _house;
    _market = [];
    _money = 5000;
    _hour = 0;
    _day = 0;
    _baseSalary = 500;

    constructor() {
        this._house = new House();
        const players = this.listPlayers();

        players.forEach(p => {
            let ply = new Player(p, this._baseSalary);
            this._market.push(ply);
        });
    }

    json() {
        const out = {
            house: this._house.json(),
            market: utils.jsonifyArrayOfClasses(this._market),
            money: this._money,
            baseSalary: this._baseSalary,
            hour: this._hour,
            day: this._day
        };
        return out;
    }

    nextHour() {
        this._hour++;
        if (this._hour === 24) {
            this._hour = 0;
            this._day++;

            // Salary
            if ((this._day % 7) === 0) {
                this.paySalaries();
            }
        }
    }


    listPlayers() {
        const folders = readdirSync(playerDir);
        let plys = [];
        folders.forEach((f, index) => {
            if (f !== 'readme.md') {
                const imgs = readdirSync(playerDir + f);
                let p = false, txt = null;
                imgs.forEach(i => {
                    if (i === 'p.jpg') {
                        p = true;
                    }
                    if (i === 'p.txt') {
                        txt = readFileSync(playerDir + f + '/' + i);
                        txt = JSON.parse(txt);
                    }
                });

                if (txt !== null) {
                    plys.push({
                        name: f,
                        portrait: p,
                        age: txt.age,
                        tits: txt.tits,
                        etnia: txt['race'],
                        sex: txt.sex
                    });
                }
            }
        });
        return plys;
    }

    findPlayer(id, where) {
        let playersInPlace, foundPlayer;
        switch (where) {
            case 'market':
                playersInPlace = this._market;
                break;
            case 'restroom':
                playersInPlace = this._house.restroom.players;
                break;
            case 'bar':
                playersInPlace = this._house.bar.players;
                break;
            case 'stage':
                playersInPlace = this._house.stage.players;
                break;
            case 'private':
                playersInPlace = this._house.private.players;
                break;
            case 'bedroom':
                playersInPlace = this._house.bedroom.players;
                break;
            case 'school':
                playersInPlace = this._house.school.players;
                break;
        }
        playersInPlace.forEach((p) => {
            if (p.id === id) {
                foundPlayer = p;
            }
        });
        return foundPlayer;
    }

    buyPlayer(playerId) {
        const player = this.findPlayer(playerId, 'market');
        // ¿Puedo?
        if (this._money < player.price) {
            return null;
        }

        this._money -= player.price;
        this._house.sendToRestroom(player);
        this.removeFromMarket(player);
    }

    removeFromMarket(player) {
        let index;
        this._market.forEach((p, idx) => {
            if (p.id === player.id) {
                index = idx;
            }
        });
        this._market.splice(index, 1);
    }

    paySalaries() {

    }
}

export default Game;
