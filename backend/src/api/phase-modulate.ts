import { ModulateReq, handleModulateData } from '../lib/modem-req-handler';
import { runPython } from '../lib/python-runner';
import { handleRequest } from '../lib/request-handler';

interface PhaseModulateReq extends ModulateReq {
    intervalLength: number;
}

handleRequest<PhaseModulateReq>('/phase-modulate', async (req, res) => {
    const pyReq = handleModulateData(req);
    const pyRes = await runPython('phase_modulate', pyReq);
    res.json(pyRes);
});
