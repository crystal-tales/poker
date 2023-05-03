import Player from './player.js';
import {default as BarClient} from './client.js';
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

            // Salary cada 7 días ¿?
            if ((this._day % 7) === 0) {
                this.paySalaries();
            }
        }

        // New clients
        this.attendNewClients();
        this._house.clientsWaits();
        this.checkNewClients();

        // Attend rooms
        this.attendClients();

        return true;
    }

    attendNewClients() {
        // mira si hay clientes esperando
        if (this._house.bar.clients.length === 0) {
            return null;
        }

        // si no hay player libre en restroom para atender al bar, nada
        if (this._house.restroom.players.length === 0) {
            return null;
        }

        // TODO

        // de entre los libres elige al que cuadre mejor según exp del player y pref del cliente
        // puede no cuadrar ninguno (skill por debajo de 20 no vale, y de ahi hasta 50 puede rechazar)
        // Los que cuadren los enlaza al attending y los manda al bar
    }

    attendClients() {
        // Bar -> Stage -> Private -> Bedroom -> Dungeon
        if (this._house.bar.clients.length > 0) {
            // TODO
        }
    }

    checkNewClients() {
        // Random influyendo la hora, entre 1 y 100 he de conseguir un valor menor que maxR
        let probNewClient = 100;
        if (this._hour >= 22 && this._hour < 2) {
            probNewClient = 20;
        } else if (this._hour >= 2 && this._hour < 10) {
            probNewClient = 0;
        } else if (this._hour >= 10 && this._hour < 14) {
            probNewClient = 5;
        } else if (this._hour >= 14 && this._hour < 19) {
            probNewClient = 10;
        } else if (this._hour >= 19 && this._hour < 22) {
            probNewClient = 5;
        }

        const rr = utils.random(1, 100);
        if (rr <= probNewClient) {
            // New client
            const cc = new BarClient();
            this._house.sendToBar(null, cc);
        }
    }

    listPlayers() {
        const folders = readdirSync(playerDir);
        let plys = [];
        folders.forEach((f, index) => {
            if (f !== 'readme.md' && f !== 'noimage.png') {
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
        // TODO
    }
}

export default Game;
