import base64
from typing import List


def seq_to_base64(seq: List[bool]):
    '''
    把bool序列转化为base64编码
    '''
    data = []
    for i in range(len(seq) // 8):
        data.append(0)
        for j in range(8):
            data[-1] <<= 1
            data[-1] += seq[i * 8 + j]

    byte_data = bytes(data)
    return base64.b64encode(byte_data).decode()


def seq_to_str(seq: List[bool]):
    '''
    把bool序列转化为字符串
    '''
    data = ''
    for i in seq:
        data += '1' if i else '0'
    return data


def output_seq(seq: List[bool]):
    '''
    输出bool序列
    '''
    if len(seq) % 8 == 0:
        return { 'data': seq_to_base64(seq), 'isBinary': False }
    else:
        return { 'data': seq_to_str(seq), 'isBinary': True }