import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import utils from '../utils.js';
import constants from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const playerDir = __dirname + '/../../assets/players/';

class Player {
    _id;
    _name;
    _selectedSet;
    _images = {};
    _portrait = false;
    _price = 0;
    _salary = 0;
    _location = 'market';

    _stats = {
        stamina: 100,
        mood: 100,
        age: 0,
        tits: 0,
        etnia: 0,
        sex: 0
    };
    _skills = {
        flirt: 0,
        strip: 0,
        vaginal: 0,
        anal: 0,
        facial: 0,
        creampie: 0,
        lesbian: 0,
        interracial: 0
    };


    get baseSalary() {
        return this._baseSalary;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get portrait() {
        return this._portrait;
    }

    get price() {
        return this._price;
    }

    set price(value) {
        this._price = value;
    }

    get salary() {
        return this._salary;
    }

    set salary(value) {
        this._salary = value;
    }

    get skills() {
        return this._skills;
    }

    set skills(value) {
        this._skills = value;
    }


    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    constructor(player, baseSalary) {
        this._id = player.name;
        this._name = player.name;
        this._portrait = player.portrait;
        this._stats.age = player.age;
        this._stats.tits = player.tits;
        this._stats.etnia = player.etnia;
        this._stats.sex = player.sex;
        this._stats.age = player.age;

        // Randomize
        this._skills.flirt = this._generateStat();
        this._skills.strip = this._generateStat();
        this._skills.vaginal = this._generateStat();
        this._skills.anal = this._generateStat();
        this._skills.facial = this._generateStat();
        this._skills.creampie = this._generateStat();
        this._skills.lesbian = this._generateStat();
        this._skills.interracial = this._generateStat();

        const sum = this._skills.flirt + this._skills.strip + this._skills.vaginal + this._skills.anal + this._skills.facial + this._skills.creampie + this._skills.lesbian + this._skills.creampie;
        const amount = Object.keys(this._skills).length;
        const median = Math.round(sum / amount);
        const basePrice = constants.MAXPRICE - constants.MINPRICE;

        // Price and salary
        this._price = constants.MINPRICE + (basePrice * median / 100);
        this._salary = baseSalary + (baseSalary * median * 2 / 100);

        this._loadImages();
        this._baseSalary = baseSalary;
    }

    json() {
        return {
            id: this._id,
            name: this._name,
            imagesSet: this._images[this._selectedSet],
            portrait: this._portrait,
            price: this._price,
            salary: this._salary,
            location: this._location,
            stats: this._stats,
            skills: this._skills
        };
    }

    // Methods
    _loadImages() {
        const files = readdirSync(playerDir + this._name);
        let sets = new Set();
        for (const img of files) {
            const num = img.substring(0, 3);
            sets.add(num[0]);
            // Es un fichero de imagen de set
            if (!isNaN(parseInt(num[0]))) {
                if (!this._images[num[0]]) {
                    this._images[num[0]] = {};
                }

                let resta = parseInt(num[1]);
                resta = '' + (5 - resta);

                if (!this._images[num[0]][resta]) {
                    this._images[num[0]][resta] = [];
                }

                // Sets
                this._images[num[0]][resta].push(img);
            }
        }

        // Random set
        let items = Array.from(sets);
        this._selectedSet = items[Math.floor(Math.random() * items.length)];
    }

    _generateStat() {
        const random = utils.random(1, 100);
        let max = 50;
        if (random > 50 && random <= 75) {
            max = 75;
        } else if (random > 75) {
            max = 100;
        }
        return utils.random(1, max);
    }
}

export default Player;
