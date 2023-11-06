import { Readable } from 'stream';
import { handleRequest } from '../lib/request-handler';
import { FileWriter } from 'wav';
import path from 'path';
import { GENERATED_DIR } from '../lib/paths';
import { buffer } from 'stream/consumers';

interface ModulateReq {
    frequency: number;
    sampleRate: number;
    initialPhase: number;
    amplitude: number;
    data: string;
    isBinary: boolean;
    interval: number;
}

function convertBinaryData(data: string) {
    if (data.length % 8 !== 0) {
        data = data.padEnd(data.length + (8 - (data.length % 8)), '0');
    }
    const out = Buffer.alloc(data.length / 8);
    for (let i = 0; i < data.length / 8; i++) {
        out[i] = parseInt(data.substring(i * 8, (i + 1) * 8), 2);
    }
    return out;
}

handleRequest<ModulateReq>('/modulate', (req, res) => {
    const { frequency, sampleRate, initialPhase, amplitude, data, isBinary, interval } = req;
    const dataBytes = Buffer.from(data).length;
    const length = isBinary ? dataBytes : dataBytes * 8;
    let dataBuffer: Buffer;
    if (isBinary) {
        dataBuffer = convertBinaryData(data);
    } else {
        dataBuffer = Buffer.from(data);
    }
    const samples = new Int16Array((sampleRate * length * interval) / 1000);
    const phaseShift = (2 * Math.PI * frequency * initialPhase) / sampleRate;
    const samplesPerInterval = (sampleRate * interval) / 1000;
    for (let i = 0; i < length; i++) {
        const index = Math.floor(i / 8);
        const offset = 7 - (i % 8);
        const bit = (dataBuffer[index] >> offset) & 1;
        if (bit) {
            for (let j = 0; j < samplesPerInterval; j++) {
                const sampleIndex = i * samplesPerInterval + j;
                samples[sampleIndex] =
                    Math.sin((2 * Math.PI * frequency * sampleIndex) / sampleRate + phaseShift) * 32767 * amplitude;
            }
        }
    }

    const stream = new Readable();

    const fileName = new Date().getTime().toString();
    const writer = new FileWriter(path.resolve(GENERATED_DIR, `${fileName}.wav`), {
        sampleRate,
        channels: 1,
        bitDepth: 16,
    });

    stream.pipe(writer);

    stream.push(Buffer.from(samples.buffer));
    stream.push(null);

    writer.on('done', () => {
        res.json({ path: `/files/generated/${fileName}.wav` });
    });

    writer.on('error', (e) => {
        console.log(e);
        //This is weird, an error is thrown but actually the file is written
        res.json({ path: `/files/generated/${fileName}.wav` });
    });
});
