import sharp from 'sharp';
import path from 'node:path';

class Resize {
    ptW = 144;
    ptH = 170;
    setW = 1045;
    setH = 750;
    ext = '.jpg';

    constructor(folder) {
        this.folder = folder;
    }

    async save(buffer, filename, portrait = false) {
        const filepath = path.resolve(this.folder + '/' + filename + this.ext);

        let w = this.setW, h = this.setH;
        if (portrait) {
            w = this.ptW;
            h = this.ptH;
        }

        await sharp(buffer)
            .resize(w, h, {
                fit: 'contain',
                fastShrinkOnLoad: false
            })
            .jpeg({quality: 90})
            .toFile(filepath);

        return filename;
    }
}

export default Resize;
