const cards = {
    characters: [
        {name: 'Manolo', type: 'character', attacks: [3, 5, 7, 9, 12], level: 1, activeEffects: [], image: 'one'},
        {name: 'Pepe', type: 'character', attacks: [3, 5, 7, 9, 12], level: 1, activeEffects: [], image: 'one'},
        {name: 'Julia', type: 'character', attacks: [3, 5, 7, 9, 12], level: 1, activeEffects: [], image: 'one'},
        {name: 'Carla', type: 'character', attacks: [3, 5, 7, 9, 12], level: 1, activeEffects: [], image: 'one'}
    ],
    places: [
        {
            name: 'Aqui',
            type: 'place',
            placeTypes: [],
            placeGuardian: '',
            placeLevel: 1,
            placeEffects: [],
            image: 'one'
        },
        {
            name: 'Alla',
            type: 'place',
            placeTypes: [],
            placeGuardian: '',
            placeLevel: 1,
            placeEffects: [],
            image: 'one'
        },
        {
            name: 'Aculla',
            type: 'place',
            placeTypes: [],
            placeGuardian: '',
            placeLevel: 1,
            placeEffects: [],
            image: 'one'
        }
    ],
    spells: [
        {name: 'Bola de fuego', type: 'spell', effect: '', image: 'one'},
        {name: 'Curacion', type: 'spell', effect: '', image: 'one'},
        {name: 'Teletransporte', type: 'spell', effect: '', image: 'one'}
    ],
    guardians: [
        {name: 'Perro', type: 'guardian', attack: 1, effects: [], rewards: [], image: 'one'},
        {name: 'Gato', type: 'guardian', attack: 1, effects: [], rewards: [], image: 'one'},
        {name: 'Koala', type: 'guardian', attack: 1, effects: [], rewards: [], image: 'one'}
    ],
    missions: [
        {name: 'Mis1', type: 'mission', conditions: [], image: 'mis'},
        {name: 'Mis2', type: 'mission', conditions: [], image: 'mis'}
    ]
};

export default cards;
