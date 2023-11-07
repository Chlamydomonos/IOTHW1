'''
噪声生成
'''

import sys
import json
import time
import numpy as np
from utils.input_handler import handle_input
from utils.file_handler import save_wave, load_wave

def get_noise(signal: np.ndarray, snr: float):
    '''
    生成高斯噪声
    '''
    signal_power = np.mean(np.abs(signal) ** 2)
    noise_power = signal_power / (10 ** (snr / 10))
    noise = np.random.normal(0, np.sqrt(noise_power), len(signal))
    noisy_signal = signal + noise

    return noisy_signal.clip(-1, 1)


if __name__ == '__main__':
    input_data = handle_input(json.load(sys.stdin))
    input_wave = load_wave(input_data['path'])
    output_data = get_noise(input_wave, input_data['snr'])

    file_name = f"{int(time.time())}_{hash(input_data['path'])}.wav"
    save_wave(output_data, input_data['sample_rate'], file_name)
    print(json.dumps({'path': f'/files/generated/{file_name}'}))
