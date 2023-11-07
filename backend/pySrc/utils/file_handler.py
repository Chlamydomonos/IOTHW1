'''
Utils
'''

import re
import os
import wave
import struct
import numpy as np
from scipy.io import wavfile


CURRENT_PATH = os.path.dirname(os.path.abspath(__file__))
FILES_PATH = os.path.abspath(os.path.join(CURRENT_PATH, '..', '..', 'files'))

PATH_RE = re.compile(r'^/files/(.+)$')


def save_wave(data: np.ndarray, sample_rate: int, file_name: str):
    '''
    保存波形文件
    '''
    file_full = os.path.join(FILES_PATH, 'generated', file_name)
    file = wave.open(file_full, 'wb')
    file.setnchannels(1)
    file.setframerate(sample_rate)
    file.setsampwidth(2)
    for i in data:
        file.writeframesraw(struct.pack('<h', round(32767 * i)))
    file.close()


def load_wave(path: str):
    '''
    读取波形文件
    '''
    match_result = PATH_RE.match(path)
    if not match_result:
        return None

    file = os.path.join(FILES_PATH, match_result.group(1))

    _, audio_sequence = wavfile.read(file)
    return audio_sequence / 32767
