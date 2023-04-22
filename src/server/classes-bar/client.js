class Client {
    _id;
    _name;
    _sex = '';
    _race = '';
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
    _location = '';


    json() {
        return {
            id: this._id,
            name: this._name

        };
    }
}

export default Client;
