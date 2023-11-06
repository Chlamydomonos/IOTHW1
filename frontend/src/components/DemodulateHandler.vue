<template>
    <el-form class="outer-frame">
        <el-form-item label="阈值" size="small">
            <el-row>
                <el-input-number v-model="thresholdPercent" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">%</span>
            </el-row>
        </el-form-item>
        <el-button :style="{ width: '100%' }" @click="demodulate">解调</el-button>
        <div>结果：</div>
        <div class="text-display" v-if="forceBinary">{{ base64 }}</div>
        <div class="text-display" v-else-if="showBinary">{{ binaryText }}</div>
        <div class="text-display" v-else>{{ text }}</div>
        <el-form-item label="显示二进制" size="small" :style="{ marginBottom: 0 }">
            <el-switch v-model="showBinary" :disabled="forceBinary" />
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { useModemStore } from '@/stores/modem';
import { usePlayerStore } from '@/stores/player';
import axios from 'axios';
import { computed, ref } from 'vue';

const store = useModemStore();
const playerStore = usePlayerStore();

const thresholdPercent = ref(50);
const threshold = computed(() => thresholdPercent.value / 100);
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
    const res = await axios.post<{ data: string; isBinary: boolean }>('/demodulate', {
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        interval: store.realInterval,
        threshold: threshold.value,
        path: playerStore.currentWAV,
    });

    base64.value = res.data.data;
    forceBinary.value = res.data.isBinary;
    if (res.data.isBinary) {
        showBinary.value = true;
    }
}
</script>

<style scoped>
.text-display {
    height: 5em;
    border: 1px solid #ccc;
    padding: 0.25em;
    border-radius: 0.25em;
    overflow-y: scroll;
    word-wrap: break-word;
    word-break: break-all;
}
</style>
