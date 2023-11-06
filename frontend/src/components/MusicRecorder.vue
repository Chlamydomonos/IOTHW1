<template>
    <div class="outer-frame">
        <div ref="recorderContainer" />
        <el-form :style="{ marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid #ccc' }">
            <el-form-item label="采样率" size="small">
                <el-row>
                    <el-input-number v-model="sampleRate" :controls="false" size="small" />
                    <span :style="{ marginLeft: '0.25rem' }">Hz</span>
                </el-row>
            </el-form-item>
            <el-form-item label="最大时长" size="small">
                <el-row>
                    <el-input-number v-model="maxDuration" :controls="false" size="small" />
                    <span :style="{ marginLeft: '0.25rem' }">秒</span>
                </el-row>
            </el-form-item>
            <el-checkbox v-model="maxDurationEnabled" size="small">启用最大时长</el-checkbox>
        </el-form>
        <div :style="{ display: 'flex', justifyContent: 'center' }">
            <el-button circle size="large" @click="handleRecord">
                <span v-if="recording">■</span>
                <span v-else>●</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import axios from 'axios';
import { usePlayerStore } from '@/stores/player';

const store = usePlayerStore();

const recorder = shallowRef<WaveSurfer>();
const recordPlugin = shallowRef<RecordPlugin>();

const recorderContainer = ref<HTMLElement>();

const sampleRate = ref(44100);
const maxDuration = ref(10);
const maxDurationEnabled = ref(false);
const timeoutId = ref(-1);
const recording = ref(false);

onMounted(async () => {
    if (!recorderContainer.value) {
        alert('Something went wrong');
        return;
    }

    recorder.value = WaveSurfer.create({
        container: recorderContainer.value,
        waveColor: '#eee',
        progressColor: '#ff0000',
    });

    recordPlugin.value = recorder.value!.registerPlugin(RecordPlugin.create());

    recordPlugin.value.on('record-end', handleFile);
});

function startRecord() {
    if (maxDurationEnabled.value) {
        timeoutId.value = setTimeout(() => {
            stopRecord();
        }, maxDuration.value * 1000);
    }

    recordPlugin.value?.startRecording();

    recording.value = true;
}

function stopRecord() {
    if (timeoutId.value > 0) {
        clearTimeout(timeoutId.value);
        timeoutId.value = -1;
    }

    recordPlugin.value?.stopRecording();

    recording.value = false;
}

function handleRecord() {
    if (recording.value) {
        stopRecord();
    } else {
        startRecord();
    }
}

async function handleFile(blob: Blob) {
    const formData = new FormData();
    formData.append('file', blob, 'music.webm');
    const res = await axios.post<{ path: string }>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    const res2 = await axios.post<{ path: string }>('/convert-to-wav', {
        path: res.data.path,
        sampleRate: sampleRate.value,
    });

    store.currentWAV = res2.data.path;
}
</script>
