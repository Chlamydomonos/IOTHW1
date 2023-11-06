import path from 'path';

export const SRC_DIR = path.resolve(__dirname, '..');
export const SCRIPT_DIR = path.resolve(SRC_DIR, 'api');
export const BACKEND_ROOT_DIR = path.resolve(SRC_DIR, '..');
export const FILES_DIR = path.resolve(BACKEND_ROOT_DIR, 'files');
export const GENERATED_DIR = path.resolve(FILES_DIR, 'generated');
export const UPLOADED_DIR = path.resolve(FILES_DIR, 'uploaded');
export const PROJECT_ROOT_DIR = path.resolve(BACKEND_ROOT_DIR, '..');
export const STATIC_DIR = path.resolve(PROJECT_ROOT_DIR, 'frontend', 'dist');
