import constants from './constants.js';
import utils from '../utils.js';
import {faker} from '@faker-js/faker';

class Client {
    _id = 0;
    _name;
    _sex = '';
    _etnia = '';
    // Prefs goes from 1 to 3 except age, tits and etnia and sex
    _prefs = {
        age: 0,
        tits: 0,
        etnia: 0,
        sex: 0,
        flirt: 0,
        strip: 0,
        vaginal: 0,
        anal: 0,
        facial: 0,
        creampie: 0,
        lesbian: 0,
        interracial: 0
    };
    _wait = 0;
    _attended = null;
    _location = '';

    constructor() {
        // Randomiza todos los datos
        this._sex = faker.helpers.objectValue(constants.SEX);
        this._etnia = faker.helpers.objectValue(constants.RACES);
        this._id = faker.finance.litecoinAddress();
        this._name = faker.name.fullName({sex: 'male'});

        this._wait = utils.random(2, 4);

        this._prefs.age = faker.helpers.objectValue(constants.AGE);
        this._prefs.tits = faker.helpers.objectValue(constants.TITS);
        this._prefs.sex = faker.helpers.objectValue(constants.SEX);
        this._prefs.etnia = faker.helpers.objectValue(constants.RACES);
        this._prefs.flirt = this._generatePref();
        this._prefs.strip = this._generatePref();
        this._prefs.vaginal = this._generatePref();
        this._prefs.anal = this._generatePref();
        this._prefs.facial = this._generatePref();
        this._prefs.creampie = this._generatePref();
        this._prefs.lesbian = this._generatePref();
        this._prefs.interracial = this._generatePref();
    }


    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    get wait() {
        return this._wait;
    }

    set wait(value) {
        this._wait = value;
    }

    get prefs() {
        return this._prefs;
    }

    get attended() {
        return this._attended;
    }

    set attended(value) {
        this._attended = value;
    }

    json() {
        return {
            id: this._id,
            name: this._name,
            sex: this._sex,
            etnia: this._etnia,
            wait: this._wait,
            location: this._location,
            prefs: this._prefs,
            attended: this._attended
        };
    }


    _generatePref() {
        return utils.random(1, 5);
    }

}

export default Client;
