import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';
import routesMonopoly from './routes-monopoly.js';
import routesAnima from './routes-anima.js';
import routesBar from './routes-bar.js';
import {join} from 'node:path';
import helmet from 'helmet';
import cors from 'cors';

const root = './';
const port = '7777';
const app = express();
const debug = true;
if (!debug) {
    console.debug = function () {
    };
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));
app.use(cors());

app.use(express.static(join(root, 'src/assets/')));
app.use(express.static(join(root, 'dist/poker/')));

app.use('/api', routes);
app.use('/api/m/', routesMonopoly);
app.use('/api/a/', routesAnima);
app.use('/api/b/', routesBar);

app.get('*', (req, res) => {
    res.sendFile('dist/poker/index.html', {root});
});

app.listen(port, () => console.log('Game running on http://localhost:' + port));

/*

const {Card, Evaluator} = deuces;
let cases = [
    ['Td', '2d', '3d', '4d', '5d'],
    ['Jd', '2d', '3d', '4d', '5d'],
    ['Td', '2d', '3d', '4d', '5d'],
    ['Ad', '2d', '3d', '4d', '6d'],
    ['Ad', 'Kd', '3d', '4d', '6d']
];

for (let caser of cases) {

    let hand = [];
    for (let card of caser) {
        hand.push(Card.newCard(card));
    }

    const evaluator = new Evaluator();
    const rank = evaluator.evaluate(hand, []);
    const ply_class = evaluator.get_rank_class(rank);

    console.log('++++++++++++++++++');
    console.log('%O => %O', caser, {'rank': rank, 'class': ply_class, 'text': evaluator.class_to_string(ply_class)});
    console.log('++++++++++++++++++');
}

*/
