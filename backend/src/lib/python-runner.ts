import { spawn } from 'child_process';
import { PYTHON } from './config';
import path from 'path';
import { PYTHON_DIR } from './paths';

type Dict = Record<string, any>;

export function runPython<T extends Dict>(pyFile: string, data: Dict) {
    if (!pyFile.endsWith('.py')) {
        pyFile += '.py';
    }

    const python = spawn(PYTHON, [path.resolve(PYTHON_DIR, pyFile)], { cwd: PYTHON_DIR });

    return new Promise<T>((resolve, reject) => {
        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data;
        });

        python.stderr.on('data', (data) => {
            stderr += data;
        });

        python.on('close', (code) => {
            if (code !== 0) {
                reject(`Python exited with code ${code}`);
            }
            if (stderr !== '') {
                reject(stderr);
            }

            resolve(JSON.parse(stdout));
        });

        python.stdin.write(JSON.stringify(data));
        python.stdin.end();
    });
}
