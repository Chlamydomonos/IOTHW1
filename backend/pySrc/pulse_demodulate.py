'''
脉冲间隔解调
'''

import sys
import json
from typing import List
import numpy as np
from utils.audio_handler import bandpass, fft, moving_average
from utils.input_handler import handle_input
from utils.file_handler import load_wave
from utils.output_handler import output_seq


def get_pulse_max(pulse: np.ndarray, window: int, threshold: float):
    '''
    获取脉冲极大值位置
    '''
    threshold *= 30
    max_list = []
    n_frames = pulse.shape[0]
    for i in range(n_frames - window + 1):
        max_num = np.max(pulse[i: i + window])
        middle_num = i + window // 2
        if pulse[middle_num] >= max_num and pulse[middle_num] > threshold:
            max_list.append(middle_num)
    return max_list


def pulse_demodulate(
    wave_data: np.ndarray,
    sample_rate: int,
    frequency: int,
    threshold: float,
    pulse_length: int,
    interval0_length: int,
    interval1_length: int,
    **_
) -> List[bool]:
    '''
    脉冲间隔解调
    '''
    pulse_frames = round(pulse_length * sample_rate / 1000)
    min_frequency = max(frequency - 500, 1)
    max_frequency = frequency + 500
    wave_data = bandpass(wave_data, sample_rate, min_frequency, max_frequency)
    wave_data = fft(wave_data, pulse_frames, sample_rate, frequency)
    wave_data = moving_average(wave_data)
    max_list = get_pulse_max(wave_data, pulse_frames, threshold)


    duration_0 = round((interval0_length + pulse_length) * sample_rate / 1000)
    duration_1 = round((interval1_length + pulse_length) * sample_rate / 1000)
    duration_threshold = (duration_0 + duration_1) // 2

    seq = []
    previous = 0
    for i in max_list:
        if i - previous < duration_threshold:
            seq.append(0)
        else:
            seq.append(1)
        previous = i
    return seq


if __name__ == '__main__':
    input_data = handle_input(json.load(sys.stdin))
    input_wave = load_wave(input_data['path'])
    output_data = pulse_demodulate(input_wave, **input_data)
    print(json.dumps(output_seq(output_data)))