import { Readable } from 'stream';
import { handleRequest } from '../lib/request-handler';
import { FileWriter } from 'wav';
import path from 'path';
import { GENERATED_DIR } from '../lib/paths';

interface GenerateWaveReq {
    frequency: number;
    sampleRate: number;
    amplitude: number;
    duration: number;
    initialPhase: number;
}

handleRequest<GenerateWaveReq>('/generate-wave', (req, res) => {
    const { frequency, sampleRate, amplitude, duration, initialPhase } = req;
    const samples = new Int16Array(sampleRate * duration);
    const phaseShift = (2 * Math.PI * frequency * initialPhase) / sampleRate;
    for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate + phaseShift) * 32767 * amplitude;
    }
    const stream = new Readable();
    stream.push(Buffer.from(samples.buffer));
    stream.push(null);

    const fileName = new Date().getTime().toString();
    const writer = new FileWriter(path.resolve(GENERATED_DIR, `${fileName}.wav`), {
        sampleRate,
        channels: 1,
        bitDepth: 16,
    });
    stream.pipe(writer);

    writer.on('done', () => {
        res.json({ path: `/files/generated/${fileName}.wav` });
    });

    writer.on('error', (e) => {
        console.log(e);
        //This is weird, an error is thrown but actually the file is written
        res.json({ path: `/files/generated/${fileName}.wav` });
    });
});
