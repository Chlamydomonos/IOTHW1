<template>
    <el-form class="outer-frame">
        <div class="title">脉冲间隔调制/解调</div>
        <el-form-item label="数据" size="small">
            <el-input type="textarea" v-model="data" />
        </el-form-item>
        <el-checkbox size="small" v-model="isBinary">是否为二进制</el-checkbox>
        <el-button :style="{ width: '100%', marginBottom: '1rem' }" @click="modulate" v-loading="modulating">
            调制
        </el-button>
        <el-form-item label="阈值" size="small">
            <el-row>
                <el-input-number v-model="store.thresholdPercent" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">%</span>
            </el-row>
        </el-form-item>
        <el-button :style="{ width: '100%' }" @click="demodulate" v-loading="demodulating">解调</el-button>
        <div>结果：</div>
        <div class="text-display" v-if="forceBinary">{{ base64 }}</div>
        <div class="text-display" v-else-if="showBinary">{{ binaryText }}</div>
        <div class="text-display" v-else>{{ text }}</div>
        <el-form-item label="显示二进制" size="small" :style="{ marginBottom: 0 }">
            <el-switch v-model="showBinary" :disabled="forceBinary" />
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { usePlayerStore } from '@/stores/player';
import { usePulsePhaseStore } from '@/stores/pulse-phase';
import axios from 'axios';
import { computed, ref } from 'vue';

const store = usePulsePhaseStore();
const playerStore = usePlayerStore();

const data = ref('');
const isBinary = ref(false);

const modulating = ref(false);
const demodulating = ref(false);

async function modulate() {
    modulating.value = true;

    if (isBinary.value) {
        const isCorrectData = /^\s*[01]+\s*$/.test(data.value);
        if (!isCorrectData) {
            alert('不是正确的二进制数据');
            return;
        }
        data.value = data.value.trim();
    }

    if (store.interval0Length >= store.interval1Length) {
        alert('间隔0长度必须小于间隔1长度');
        return;
    }

    const res = await axios.post<{ path: string }>('/pulse-modulate', {
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        initialPhase: store.initialPhase,
        amplitude: store.amplitude,
        data: data.value,
        isBinary: isBinary.value,
        pulseLength: store.pulseLength,
        interval0Length: store.interval0Length,
        interval1Length: store.interval1Length,
    });

    playerStore.currentWAV = res.data.path;
    modulating.value = false;
}

const base64 = ref('');
const showBinary = ref(false);
const forceBinary = ref(false);

const binaryText = computed(() => {
    const buffer = Uint8Array.from(atob(base64.value), (c) => c.charCodeAt(0));
    let out = '';
    for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < 8; j++) {
            out += (buffer[i] >> (7 - j)) & 1;
        }
    }
    return out;
});

const text = computed(() => {
    const buffer = Uint8Array.from(atob(base64.value), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(buffer);
});

async function demodulate() {
    demodulating.value = true;

    const res = await axios.post<{ data: string; isBinary: boolean }>('/pulse-demodulate', {
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        threshold: store.threshold,
        path: playerStore.currentWAV,
        pulseLength: store.pulseLength,
        interval0Length: store.interval0Length,
        interval1Length: store.interval1Length,
        initialPhase: store.initialPhase,
    });

    base64.value = res.data.data;
    forceBinary.value = res.data.isBinary;
    if (res.data.isBinary) {
        showBinary.value = true;
    }

    demodulating.value = false;
}
</script>
