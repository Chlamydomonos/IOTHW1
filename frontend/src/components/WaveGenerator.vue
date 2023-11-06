<template>
    <el-form class="outer-frame">
        <el-form-item label="采样率" size="small">
            <el-row>
                <el-input-number v-model="sampleRate" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">Hz</span>
            </el-row>
        </el-form-item>
        <el-form-item label="频率" size="small">
            <el-row>
                <el-input-number v-model="frequency" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">Hz</span>
            </el-row>
        </el-form-item>
        <el-form-item label="响度" size="small">
            <el-row>
                <el-input-number v-model="amplitudePercent" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">%</span>
            </el-row>
        </el-form-item>
        <el-form-item label="持续时间" size="small">
            <el-row>
                <el-input-number v-model="duration" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">秒</span>
            </el-row>
        </el-form-item>
        <el-form-item label="初始相位" size="small">
            <el-row>
                <el-input-number v-model="initialPhaseDeg" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">°</span>
            </el-row>
        </el-form-item>
        <el-button :style="{ width: '100%' }" @click="generate">生成</el-button>
    </el-form>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/player';
import axios from 'axios';
import { computed, ref } from 'vue';

const frequency = ref(1000);
const sampleRate = ref(44100);
const duration = ref(1);
const amplitudePercent = ref(100);
const initialPhaseDeg = ref(0);

const amplitude = computed(() => amplitudePercent.value / 100);
const initialPhase = computed(() => (initialPhaseDeg.value / 180) * Math.PI);

const store = usePlayerStore();

async function generate() {
    const res = await axios.post<{ path: string }>('/generate-wave', {
        frequency: frequency.value,
        sampleRate: sampleRate.value,
        duration: duration.value,
        amplitude: amplitude.value,
        initialPhase: initialPhase.value,
    });

    store.currentWAV = res.data.path;
}
</script>
