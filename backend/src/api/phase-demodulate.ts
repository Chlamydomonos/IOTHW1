import { DemodulateReq } from '../lib/modem-req-handler';
import { runPython } from '../lib/python-runner';
import { handleRequest } from '../lib/request-handler';

interface PulseDemodulateReq extends DemodulateReq {
    intervalLength: number;
}

handleRequest<PulseDemodulateReq>('/phase-demodulate', async (req, res) => {
    const pyRes = await runPython('phase_demodulate', req);
    res.json(pyRes);
});
