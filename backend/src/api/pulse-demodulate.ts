import { DemodulateReq } from '../lib/modem-req-handler';
import { runPython } from '../lib/python-runner';
import { handleRequest } from '../lib/request-handler';

interface PulseDemodulateReq extends DemodulateReq {
    pulseLength: number;
    interval0Length: number;
    interval1Length: number;
    threshold: number;
}

handleRequest<PulseDemodulateReq>('/pulse-demodulate', async (req, res) => {
    const pyRes = await runPython('pulse_demodulate', req);
    res.json(pyRes);
});
