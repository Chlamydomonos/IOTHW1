<template>
    <div class="outer-frame">
        <el-form>
            <el-form-item label="响度" size="small">
                <el-row>
                    <el-input-number v-model="amplitudePercent" :controls="false" />
                    <span :style="{ marginLeft: '0.25rem' }">%</span>
                </el-row>
            </el-form-item>
            <el-form-item label="初始相位" size="small">
                <el-row>
                    <el-input-number v-model="initialPhaseDeg" :controls="false" />
                    <span :style="{ marginLeft: '0.25rem' }">°</span>
                </el-row>
            </el-form-item>
            <el-form-item label="数据" size="small">
                <el-input type="textarea" v-model="data" />
            </el-form-item>
            <el-checkbox size="small" v-model="isBinary">是否为二进制</el-checkbox>
            <el-button :style="{ width: '100%' }" @click="modulate">调制</el-button>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { useModemStore } from '@/stores/modem';
import { usePlayerStore } from '@/stores/player';
import axios from 'axios';
import { computed, ref } from 'vue';

const store = useModemStore();
const playerStore = usePlayerStore();

const amplitudePercent = ref(100);
const initialPhaseDeg = ref(0);
const data = ref('');
const isBinary = ref(false);

const amplitude = computed(() => amplitudePercent.value / 100);
const initialPhase = computed(() => (initialPhaseDeg.value / 180) * Math.PI);

async function modulate() {
    if (isBinary.value) {
        const isCorrectData = /^\s*[01]+\s*$/.test(data.value);
        if (!isCorrectData) {
            alert('不是正确的二进制数据');
            return;
        }
        data.value = data.value.trim();
    }

    const res = await axios.post<{ path: string }>('/modulate', {
        frequency: store.frequency,
        sampleRate: store.sampleRate,
        initialPhase: initialPhase.value,
        amplitude: amplitude.value,
        data: data.value,
        isBinary: isBinary.value,
        interval: store.realInterval,
    });

    playerStore.currentWAV = res.data.path;
}
</script>
