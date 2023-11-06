import { Router } from 'express';

type RawReq = Router['post'] extends (path: any, handler: (req: infer R, res: any) => any) => any ? R : never;
type Res = Router['post'] extends (path: any, handler: (req: any, res: infer R) => any) => any ? R : never;

export function handleRequest<Req>(
    path: string | RegExp,
    handler: (req: Req, res: Res, rawReq?: RawReq) => Promise<void> | void,
) {
    router.post(path, async (req, res) => {
        await handler(req.body, res);
    });
}
