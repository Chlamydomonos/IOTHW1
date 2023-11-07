<template>
    <el-form class="outer-frame">
        <el-form-item label="信噪比" size="small">
            <el-row>
                <el-input-number v-model="snr" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">dB</span>
            </el-row>
        </el-form-item>
        <el-button :style="{ width: '100%', marginBottom: '1rem' }" @click="addNoise" v-loading="addingNoise">
            添加噪声
        </el-button>
        <el-form-item label="随机数据长度" size="small">
            <el-row>
                <el-input-number v-model="dataLength" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">位</span>
            </el-row>
        </el-form-item>
        <el-form-item label="测试次数" size="small">
            <el-row>
                <el-input-number v-model="testTimes" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">次</span>
            </el-row>
        </el-form-item>
        <el-button :style="{ width: '100%' }" @click="test" v-loading="testing">测试</el-button>
        <div>
            <span>脉冲间隔调制准确率：</span>
            <span v-if="pulseAccuracy !== undefined">{{ pulseAccuracy }}%</span>
            <span v-else>-</span>
        </div>
        <div>
            <span>相位调制准确率：</span>
            <span v-if="phaseAccuracy !== undefined">{{ phaseAccuracy }}%</span>
            <span v-else>-</span>
        </div>
    </el-form>
</template>

<script lang="ts" setup>
import { usePulsePhaseStore } from '@/stores/pulse-phase';
import { usePlayerStore } from '@/stores/player';
import { ref } from 'vue';
import axios from 'axios';

const store = usePulsePhaseStore();
const playerStore = usePlayerStore();

const snr = ref(20);
const dataLength = ref(1);
const testTimes = ref(1);

const pulseAccuracy = ref<number>();
const phaseAccuracy = ref<number>();

const addingNoise = ref(false);
const testing = ref(false);

async function addNoise() {
    addingNoise.value = true;

    const res = await axios.post<{ path: string }>('/noise', {
        path: playerStore.currentWAV,
        snr: snr.value,
        sampleRate: store.sampleRate,
    });

    playerStore.currentWAV = res.data.path;

    addingNoise.value = false;
}

function base64ToBinary(base64: string) {
    const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    let out = '';
    for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < 8; j++) {
            out += (buffer[i] >> (7 - j)) & 1;
        }
    }
    return out;
}

function parseDemodulateResult(result: { data: string; isBinary: boolean }) {
    if (result.isBinary) {
        return result.data;
    } else {
        return base64ToBinary(result.data);
    }
}

function compareStrings(a: string, b: string) {
    let same = 0;
    let length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
        if (a[i] === b[i]) {
            same++;
        }
    }
    return same / a.length;
}

async function testPulse(data: string) {
    const pulseRes = await axios.post<{ path: string }>('/pulse-modulate', {
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        initialPhase: store.initialPhase,
        amplitude: store.amplitude,
        data,
        isBinary: true,
        pulseLength: store.pulseLength,
        interval0Length: store.interval0Length,
        interval1Length: store.interval1Length,
    });

    const pulseNoiseRes = await axios.post<{ path: string }>('/noise', {
        path: pulseRes.data.path,
        snr: snr.value,
        sampleRate: store.sampleRate,
    });

    const pulseDemodulateRes = await axios.post<{ data: string; isBinary: boolean }>('/pulse-demodulate', {
        path: pulseNoiseRes.data.path,
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        initialPhase: store.initialPhase,
        amplitude: store.amplitude,
        pulseLength: store.pulseLength,
        interval0Length: store.interval0Length,
        interval1Length: store.interval1Length,
        threshold: store.threshold,
    });

    const pulseResult = parseDemodulateResult(pulseDemodulateRes.data);

    console.log('data:', data, 'pulseResult:', pulseResult);
    return compareStrings(data, pulseResult) * 100;
}

async function testPhase(data: string) {
    const phaseRes = await axios.post<{ path: string }>('/phase-modulate', {
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        initialPhase: store.initialPhase,
        amplitude: store.amplitude,
        data,
        isBinary: true,
        intervalLength: store.symbolLength,
    });

    const phaseNoiseRes = await axios.post<{ path: string }>('/noise', {
        path: phaseRes.data.path,
        snr: snr.value,
        sampleRate: store.sampleRate,
    });

    const phaseDemodulateRes = await axios.post<{ data: string; isBinary: boolean }>('/phase-demodulate', {
        path: phaseNoiseRes.data.path,
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        initialPhase: store.initialPhase,
        amplitude: store.amplitude,
        intervalLength: store.symbolLength,
    });

    const phaseResult = parseDemodulateResult(phaseDemodulateRes.data);

    console.log('data:', data, 'phaseResult:', phaseResult);
    return compareStrings(data, phaseResult) * 100;
}

async function singleTest(data: string) {
    const promises = [testPulse(data), testPhase(data)];
    const [pulseAccuracy, phaseAccuracy] = await Promise.all(promises);
    return { pulseAccuracy, phaseAccuracy };
}

async function test() {
    testing.value = true;

    if (store.interval0Length >= store.interval1Length) {
        alert('间隔0长度必须小于间隔1长度');
        return;
    }

    const testPromises = Array.from({ length: testTimes.value }, () => {
        const data = Array.from({ length: dataLength.value }, () => (Math.random() < 0.5 ? '0' : '1')).join('');
        return singleTest(data);
    });
    const testResults = await Promise.all(testPromises);
    const pulseSum = testResults.reduce((acc, { pulseAccuracy }) => acc + pulseAccuracy, 0);
    const phaseSum = testResults.reduce((acc, { phaseAccuracy }) => acc + phaseAccuracy, 0);
    pulseAccuracy.value = pulseSum / testTimes.value;
    phaseAccuracy.value = phaseSum / testTimes.value;

    testing.value = false;
}
</script>
