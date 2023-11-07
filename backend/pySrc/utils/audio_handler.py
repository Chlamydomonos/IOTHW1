'''
处理音频数据
'''

import numpy as np
from scipy import signal


def bandpass(data: np.ndarray, sample_rate: int, low: int, high: int):
    '''
    带通滤波
    '''
    low = 2 * low / sample_rate
    high = 2 * high / sample_rate
    b, a = signal.butter(6, [low, high], 'bandpass')
    result = signal.filtfilt(b, a, data)
    return result


def fft(data: np.ndarray, window: int, sample_rate: int, frequency: int):
    '''
    FFT
    '''
    n_frames = data.shape[0]
    result = np.zeros(n_frames)
    for i in range(n_frames - window + 1):
        nova = abs(np.fft.fft(data[i: i + window]))
        index_impulse = round(frequency / sample_rate * window)
        result[i] = max(nova[index_impulse - 2: index_impulse + 2])
    return result


def moving_average(data: np.ndarray, window: int = 11):
    '''
    滑动平均
    '''
    n = data.shape[0]
    m = n - window + 1
    result = np.zeros(m)
    for i in range(m):
        sum_value = 0
        for j in range(window):
            sum_value += data[i + j]
        average = sum_value / window
        result[i] = average
    return result
