'''
BPSK调制
'''

import sys
import json
import time
import numpy as np
from utils.input_handler import handle_input
from utils.file_handler import save_wave


def phase_modulate(
    data: bytes,
    data_length: int,
    sample_rate: int,
    frequency: int,
    initial_phase: float,
    amplitude: float,
    interval_length: int,
    **_
):
    '''
    BPSK调制，输出为numpy数组
    '''
    output = np.empty(shape = (1, 0))

    interval_samples = interval_length * sample_rate // 1000
    output_length = interval_samples * data_length

    for i in range(data_length):
        index = i // 8
        offset = 7 - (i % 8)
        bit = (data[index] >> offset) & 1
        interval = np.linspace(0, 0, interval_samples)

        if bit:
            interval = np.ones(interval.shape)
        else:
            interval = -np.ones(interval.shape)

        output = np.append(output, interval)

    sin_wave = np.linspace(0, output_length / sample_rate, output_length)
    sin_wave = np.sin(2 * np.pi * frequency * sin_wave + initial_phase) * amplitude
    output = output * sin_wave
    return output


if __name__ == '__main__':
    input_data = handle_input(json.load(sys.stdin))
    output_data = phase_modulate(**input_data)

    file_name = f"{int(time.time())}_{hash(input_data['data'])}.wav"
    save_wave(output_data, input_data['sample_rate'], file_name)
    print(json.dumps({'path': f'/files/generated/{file_name}'}))
