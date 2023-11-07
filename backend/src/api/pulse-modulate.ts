import { ModulateReq, handleModulateData } from '../lib/modem-req-handler';
import { runPython } from '../lib/python-runner';
import { handleRequest } from '../lib/request-handler';

interface PulseModulateReq extends ModulateReq {
    pulseLength: number;
    interval0Length: number;
    interval1Length: number;
}

handleRequest<PulseModulateReq>('/pulse-modulate', async (req, res) => {
    const pyReq = handleModulateData(req);
    const pyRes = await runPython('pulse_modulate', pyReq);
    res.json(pyRes);
});
