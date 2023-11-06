import express from 'express';
import path from 'path';
import fs from 'fs';
import { STATIC_DIR, FILES_DIR, SCRIPT_DIR, GENERATED_DIR, UPLOADED_DIR } from './lib/paths';
import { rimraf } from 'rimraf';
import { exec } from 'child_process';

const app = express();

app.use(express.json());

app.get(/^\/(?!api)(?!files).*/, (req, res) => {
    const match = req.path.match(/^\/(.*)/);
    if (!match) {
        res.status(404).send('404 Not found');
        return;
    }

    let file = match[1];
    if (file.endsWith('/') || file === '') {
        file += 'index.html';
    }

    if (!fs.existsSync(path.resolve(STATIC_DIR, file))) {
        res.status(404).send('404 Not found');
        return;
    }

    res.sendFile(path.resolve(STATIC_DIR, file));
});

app.get('/files/*', (req, res) => {
    const match = req.path.match(/^\/files\/(.*)/);
    if (!match) {
        res.status(404).send('404 Not found');
        return;
    }

    let file = match[1];

    if (!fs.existsSync(path.resolve(FILES_DIR, file))) {
        res.status(404).send('404 Not found');
        return;
    }

    if (fs.statSync(path.resolve(FILES_DIR, file)).isDirectory()) {
        res.status(404).send('404 Not found');
        return;
    }

    res.sendFile(path.resolve(FILES_DIR, file));
});

const router = express.Router();

global.router = router;

function listFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const files = fs.readdirSync(dir);
    const result: string[] = [];
    for (const file of files) {
        const filePath = path.resolve(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            result.push(...listFiles(filePath));
        } else if (file.endsWith('.js')) {
            result.push(filePath);
        }
    }
    return result;
}

async function main() {
    await rimraf.rimraf(GENERATED_DIR);
    await rimraf.rimraf(UPLOADED_DIR);
    fs.mkdirSync(GENERATED_DIR);
    fs.mkdirSync(UPLOADED_DIR);

    const files = listFiles(SCRIPT_DIR);
    for (const file of files) {
        const script = await import(file);
        if (script.default) {
            script.default();
        }
    }

    app.use('/api', router);

    app.listen(3000, () => {
        console.log('Server listening on port 3000!');
    });

    exec('start http://localhost:3000/');
}

main();
