type Dict = Record<string, any>;
type Merged<T extends Dict, U extends Dict> = Omit<T, keyof U> & U;

export function mergeObjects<T extends Dict, U extends Dict>(a: T, b: U): Merged<T, U> {
    return { ...a, ...b };
}

export interface ModulateReq {
    frequency: number;
    sampleRate: number;
    initialPhase: number;
    amplitude: number;
    data: string;
    isBinary: boolean;
}

export interface DemodulateReq {
    frequency: number;
    sampleRate: number;
    interval: number;
    path: string;
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

export function handleModulateData<T extends ModulateReq>(req: T) {
    const { data, isBinary } = req;
    const dataBytes = Buffer.from(data).length;
    const dataLength = isBinary ? dataBytes : dataBytes * 8;
    let dataBuffer: Buffer;
    if (isBinary) {
        dataBuffer = convertBinaryData(data);
    } else {
        dataBuffer = Buffer.from(data);
    }

    return mergeObjects(req, { dataLength, data: dataBuffer.toString('base64') });
}
