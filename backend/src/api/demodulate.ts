import { handleRequest } from '../lib/request-handler';
import { Reader } from 'wav';
import fs from 'fs';
import { Writable } from 'stream';
import { FILES_DIR } from '../lib/paths';
import path from 'path';

interface DemodulateReq {
    frequency: number;
    sampleRate: number;
    interval: number;
    threshold: number;
    path: string;
}

interface ChunkQueueItem {
    chunk: Int16Array;
    offset: number;
}

interface DemodulateHandlerEventEmitter {
    on(event: 'demodulated', listener: (data: boolean[]) => void): this;
}

class DemodulateHandler extends Writable implements DemodulateHandlerEventEmitter {
    constructor(
        frequency: number,
        sampleRate: number,
        interval: number,
        private threshold: number,
    ) {
        super();
        this.samplesPerInterval = (sampleRate * interval) / 1000;
        this.wavesPerInterval = (frequency * interval) / 1000;
        this.samplesPerWave = sampleRate / frequency;
        this.currentInterval = new Int16Array(this.samplesPerInterval);
        this.on('finish', () => {
            while (this.calculateTotalLength() >= this.samplesPerInterval) {
                this.processChunkQueue();
            }
            if (this.bits.length > 0) {
                this.emit('demodulated', this.bits);
            }
        });
    }

    private samplesPerInterval: number;
    private wavesPerInterval: number;
    private samplesPerWave: number;
    private currentInterval: Int16Array;
    private chunkQueue: ChunkQueueItem[] = [];
    private bits: boolean[] = [];

    _write(chunk: Buffer, _encoding: string, callback: () => void) {
        this.chunkQueue.push({
            chunk: new Int16Array(chunk.buffer),
            offset: 0,
        });
        while (this.calculateTotalLength() >= this.samplesPerInterval) {
            this.processChunkQueue();
        }

        callback();
    }

    calculateTotalLength() {
        let totalLength = 0;
        for (const item of this.chunkQueue) {
            totalLength += item.chunk.length - item.offset;
        }
        return totalLength;
    }

    processChunkQueue() {
        let totalLength = 0;
        while (totalLength < this.samplesPerInterval) {
            const item = this.chunkQueue[0];
            const length = Math.min(item.chunk.length - item.offset, this.samplesPerInterval - totalLength);
            this.currentInterval.set(item.chunk.subarray(item.offset, item.offset + length), totalLength);
            item.offset += length;
            totalLength += length;
            if (item.offset >= item.chunk.length) {
                this.chunkQueue.shift();
            }
        }

        this.handleCurrentInterval();
    }

    handleCurrentInterval() {
        let totalAmplitude = 0;

        let maxValue = 0;
        let minValue = 0;
        let lastWave = 0;
        for (let i = 0; i < this.samplesPerInterval; i++) {
            let value = this.currentInterval[i];
            if (value > maxValue) {
                maxValue = value;
            }
            if (value < minValue) {
                minValue = value;
            }

            let currentWave = Math.floor(i / this.samplesPerWave);
            if (currentWave > lastWave) {
                totalAmplitude += (maxValue - minValue) / 65536;
                maxValue = 0;
                minValue = 0;
                lastWave = currentWave;
            }
        }

        let averageAmplitude = totalAmplitude / this.wavesPerInterval;
        this.bits.push(averageAmplitude > this.threshold);
    }
}

handleRequest<DemodulateReq>('/demodulate', (req, res) => {
    const { frequency, sampleRate, interval, threshold, path: reqPath } = req;

    const match = /^\/files\/(.*)/.exec(reqPath);
    if (!match) {
        res.status(400).json({ error: 'Invalid path' });
        return;
    }
    const fileName = match[1];
    const filePath = path.resolve(FILES_DIR, fileName);

    const readStream = fs.createReadStream(filePath);

    const reader = new Reader();

    reader.on('format', () => {
        const handler = new DemodulateHandler(frequency, sampleRate, interval, threshold);

        handler.on('demodulated', (bits) => {
            if (bits.length % 8 !== 0) {
                let out = '';
                for (const bit of bits) {
                    out += bit ? '1' : '0';
                }
                res.json({ data: out, isBinary: true });
            } else {
                let buffer = Buffer.alloc(bits.length / 8);
                for (let i = 0; i < bits.length; i += 8) {
                    let byte = 0;
                    for (let j = 0; j < 8; j++) {
                        byte |= bits[i + j] ? 1 << (7 - j) : 0;
                    }
                    buffer[i / 8] = byte;
                }
                res.json({ data: buffer.toString('base64'), isBinary: false });
            }
        });

        reader.pipe(handler);
    });

    readStream.pipe(reader);
});
