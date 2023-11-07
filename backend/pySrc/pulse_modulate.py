'''
脉冲间隔调制
'''

import sys
import json
import time
import numpy as np
from utils.input_handler import handle_input
from utils.file_handler import save_wave


def pulse_modulate(
    data: bytes,
    data_length: int,
    sample_rate: int,
    frequency: int,
    initial_phase: float,
    amplitude: float,
    pulse_length: int,
    interval0_length: int,
    interval1_length: int,
    **_
):
    '''
    脉冲间隔调制，输出为numpy数组
    data是小端存储，只取转化为大端后的前data_length个bit
    '''
    output = np.empty(shape = (1, 0))

    for i in range(data_length):
        index = i // 8
        offset = 7 - (i % 8)
        bit = (data[index] >> offset) & 1

        pulse = np.linspace(0, pulse_length / 1000, pulse_length * sample_rate // 1000)
        pulse = np.sin(2 * np.pi * frequency * pulse + initial_phase) * amplitude

        if bit == 0:
            interval = np.linspace(0, 0, interval0_length * sample_rate // 1000)
            interval = np.zeros(interval.shape)
        else:
            interval = np.linspace(0, 0, interval1_length * sample_rate // 1000)
            interval = np.zeros(interval.shape)

        output = np.append(output, pulse)
        output = np.append(output, interval)

    pulse = np.linspace(0, pulse_length / 1000, pulse_length * sample_rate // 1000)
    pulse = np.sin(2 * np.pi * frequency * pulse + initial_phase) * amplitude
    output = np.append(output, pulse)

    return output


if __name__ == '__main__':
    input_data = handle_input(json.load(sys.stdin))
    output_data = pulse_modulate(**input_data)

    file_name = f"{int(time.time())}_{hash(input_data['data'])}.wav"
    save_wave(output_data, input_data['sample_rate'], file_name)
    print(json.dumps({'path': f'/files/generated/{file_name}'}))
