'''
BPSK解调
'''


import sys
import json
from typing import List
import numpy as np
from utils.input_handler import handle_input
from utils.file_handler import load_wave
from utils.output_handler import output_seq


def get_integral(
    sub_seq: np.ndarray,
    frequency: int,
    sample_rate: int,
    interval_length: int,
    amplitude: float,
    initial_phase: float
):
    '''
    计算一个间隔中的积分
    '''
    the_sum = 0
    total_num = len(sub_seq)
    x = np.linspace(0, total_num / sample_rate, num = total_num)

    y = np.sin(2 * np.pi * x * frequency + initial_phase) * amplitude
    for i in range(total_num):
        the_sum += sub_seq[i] * y[i] / sample_rate * 2 / interval_length / frequency
    return the_sum


def get_original_seq(seq_i: List[float]):
    '''
    根据i序列还原原先的0-1序列
    '''
    seq = []
    for i in seq_i:
        seq.append(i > 0)
    return seq


def phase_demodulate(
    wave_data: np.ndarray,
    sample_rate: int,
    frequency: int,
    interval_length: int,
    amplitude: float,
    initial_phase: float,
    **_
):
    '''
    BPSK解调
    '''
    seq_i = []
    interval_samples = round(sample_rate * interval_length // 1000)
    i = 0
    while i < len(wave_data):
        if i + interval_samples > len(wave_data):
            sub_seq = wave_data[i: ]
        else:
            sub_seq = wave_data[i: i + interval_samples]
        sub_seq_initial_phase = initial_phase + 2 * np.pi * frequency * i / sample_rate
        integral_i = get_integral(sub_seq, frequency, sample_rate, interval_length, amplitude, sub_seq_initial_phase)
        seq_i.append(integral_i)
        i += interval_samples
    seq = get_original_seq(seq_i)
    return seq


if __name__ == '__main__':
    input_data = handle_input(json.load(sys.stdin))
    input_wave = load_wave(input_data['path'])
    output_data = phase_demodulate(input_wave, **input_data)
    print(json.dumps(output_seq(output_data)))
