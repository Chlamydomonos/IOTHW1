import { handleRequest } from '../lib/request-handler';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { FILES_DIR, GENERATED_DIR } from '../lib/paths';

interface ConvertToWavReq {
    path: string;
    sampleRate: number;
}

handleRequest<ConvertToWavReq>('/convert-to-wav', (req, res) => {
    const { path: reqPath, sampleRate } = req;
    const match = /^\/files\/(.*)/.exec(reqPath);
    if (!match) {
        res.status(400).json({ error: 'Invalid path' });
        return;
    }
    const fileName = match[1];
    const inputPath = path.resolve(FILES_DIR, fileName);

    const outFileName = new Date().getTime().toString();
    const outputPath = path.resolve(GENERATED_DIR, `${outFileName}.wav`);

    const outStream = fs.createWriteStream(outputPath);

    ffmpeg(inputPath).audioFrequency(sampleRate).format('wav').pipe(outStream);

    outStream.on('finish', () => {
        res.json({ path: `/files/generated/${outFileName}.wav` });
    });
});
