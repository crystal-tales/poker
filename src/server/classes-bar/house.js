import utils from '../utils.js';

class House {
    _bar = {id: 'bar', players: [], clients: []};
    _stage = {id: 'stage', players: [], clients: []};

    _private = {id: 'private', players: [], clients: []};
    _bedroom = {id: 'bedroom', players: [], clients: []};

    _school = {id: 'school', players: []};
    _restroom = {id: 'restroom', players: []};
    _dungeon = {id: 'dungeon', players: []};

    constructor() {
    }

    get bar() {
        return this._bar;
    }

    get stage() {
        return this._stage;
    }

    get private() {
        return this._private;
    }

    get bedroom() {
        return this._bedroom;
    }

    get school() {
        return this._school;
    }

    get dungeon() {
        return this._dungeon;
    }

    get restroom() {
        return this._restroom;
    }

    json() {
        console.log('HOUSE JSON');
        console.log(this._bar.players);
        console.log(this._bar.clients);
        return {
            bar: {
                id: this._bar.id,
                players: utils.jsonifyArrayOfClasses(this._bar.players),
                clients: utils.jsonifyArrayOfClasses(this._bar.clients)
            },
            stage: {
                id: this._stage.id,
                players: utils.jsonifyArrayOfClasses(this._stage.players),
                clients: utils.jsonifyArrayOfClasses(this._stage.clients)
            },
            private: {
                id: this._private.id,
                players: utils.jsonifyArrayOfClasses(this._private.players),
                clients: utils.jsonifyArrayOfClasses(this._private.clients)
            },
            bedroom: {
                id: this._bedroom.id,
                players: utils.jsonifyArrayOfClasses(this._bedroom.players),
                clients: utils.jsonifyArrayOfClasses(this._bedroom.clients)
            },
            school: {id: this._school.id, players: utils.jsonifyArrayOfClasses(this._school.players)},
            dungeon: {id: this._dungeon.id, players: utils.jsonifyArrayOfClasses(this._dungeon.players)},
            restroom: {id: this._restroom.id, players: utils.jsonifyArrayOfClasses(this._restroom.players)}
        };
    }


    sendToDungeon(player) {
        player.location = this._dungeon.id;
        this._dungeon.players.push(player);
    }

    sendToRestroom(player) {
        player.location = this._restroom.id;
        this._restroom.players.push(player);
    }

    sendToBar(player, client) {
        if (player !== null) {
            player.location = this._bar.id;
            this._bar.players.push(player);
        }
        if (client !== null) {
            client.location = this._bar.id;
            this._bar.clients.push(client);
        }
    }

    sendToStage(player, client) {
        if (player) {
            player.location = this._stage.id;
            this._stage.players.push(player);
        }
        if (client) {
            client.location = this._stage.id;
            this._stage.clients.push(client);
        }
    }

    sendToPrivate(player, client) {
        if (player) {
            player.location = this._private.id;
            this._private.players.push(player);
        }
        if (client) {
            client.location = this._private.id;
            this._private.clients.push(client);
        }
    }

    sendToBedroom(player, client) {
        if (player) {
            player.location = this._bedroom.id;
            this._bedroom.players.push(player);
        }
        if (client) {
            client.location = this._bedroom.id;
            this._bedroom.clients.push(client);
        }
    }

    sendToSchool(player) {
        player.location = this._school.id;
        this._school.players.push(player);
    }

    clientsWaits() {
        let newArr = [];
        this._bar.clients.forEach((client) => {
            if (client.attended === null) {
                client.wait--;
                if (client.wait >= 0) {
                    newArr.push(client);
                }
            } else {
                // the attended
                newArr.push(client);
            }
        });

        this._bar.clients = newArr;
    }
}

export default House;
