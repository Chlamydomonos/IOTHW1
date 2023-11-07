import { runPython } from '../lib/python-runner';
import { handleRequest } from '../lib/request-handler';

interface NoiseReq {
    sampleRate: number;
    path: string;
    snr: number;
}

handleRequest<NoiseReq>('/noise', async (req, res) => {
    const pyRes = await runPython('noise', req);
    res.json(pyRes);
});
