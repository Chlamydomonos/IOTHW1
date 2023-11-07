'''
处理输入数据
'''

import base64

def handle_input(data: dict):
    '''
    处理输入数据，把base64编码的数据解码，并把一切驼峰式命名转化为下划线命名
    '''

    if 'data' in data:
        data['data'] = base64.b64decode(data['data'])

    out_data = {}
    for key in data:
        if '_' in key:
            continue
        new_key = ''
        for char in key:
            if char.isupper():
                new_key += '_' + char.lower()
            else:
                new_key += char
        out_data[new_key] = data[key]

    return out_data
