import {existsSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import Resize from './classes/resize.js';
import {mkdirSync, readFileSync, unlinkSync} from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const playerDir = __dirname + '/../assets/players/';

const saveImages = async function (name, files) {
    let newSet = 1;
    // Compruebo si existe la carpeta name
    const exists = existsSync(playerDir + name);
    if (exists) {
        // Si existe, cojo los ficheros de ahí para ver qué set corresponde al nuevo
        const files = readdirSync(playerDir + name);
        let sets = [];
        files.forEach(file => {
            // Busco los ficheros sX.jpg
            if (file.charAt(0) === 's' && file.length > 5) {
                let set = file.slice(1).slice(0, -4);
                sets.push(parseInt(set));
            }
        });
        newSet = Math.max(...sets) + 1;
    } else {
        // Creo el directorio
        mkdirSync(playerDir + name);
    }

    if (isNaN(newSet)) {
        throw new Error('Max set not found');
    }

    const resharp = new Resize(playerDir + name);

    // Recojo la portrait y la guardo como s.jpg
    if (files['portrait'] && files['portrait'].length === 1) {
        const pt = files['portrait'][0];
        // const ptBuf = readFileSync(pt.path, pt.encoding);
        const ptBuf = readFileSync(pt.path);
        await resharp.save(ptBuf, 's', true);
        // Limpio la carpeta temporal para no acumular mierda
        unlinkSync(pt.path);
    }

    // Recojo las imágenes de cada stage y las guardo con su nombre adecuado
    for (let i = 0; i <= 5; i++) {
        const imgs = files['stage' + i];
        if (!imgs) {
            throw new Error('Stage ' + i + ' not found');
        }

        for (let j = 0; j < imgs.length; j++) {
            // const imBuf = readFileSync(imgs[j].path, imgs[j].encoding);
            const imBuf = readFileSync(imgs[j].path);
            await resharp.save(imBuf, '' + newSet + i + j);

            // Limpio la carpeta temporal para no acumular mierda
            unlinkSync(imgs[j].path);

            // La primera del stage5 es la s<SET>.jpg
            if (i === 5 && j === 0) {
                await resharp.save(imBuf, 's' + newSet);
            }
        }
    }

    return newSet;
};

const capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const listRivalsAvailable = function () {
    const folders = readdirSync(__dirname + '/../assets/players/');
    let idx;
    folders.forEach((f, index) => {
        if (f === 'readme.md') {
            idx = index;
        }
    });
    folders.splice(idx, 1);
    return folders;
};

const jsonifyArrayOfClasses = function (array) {
    let jsonA = [];
    for (let d of array) {
        jsonA.push(d.json());
    }
    return jsonA;
};

export default {saveImages, capitalizeFirstLetter, listRivalsAvailable, jsonifyArrayOfClasses};
