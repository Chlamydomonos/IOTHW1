<template>
    <div class="outer-frame">
        <el-row>
            <div :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }">
                <div class="button-container">
                    <el-button :icon="playing ? VideoPause : VideoPlay" circle @click="togglePlay" />
                </div>
                <div class="button-container">
                    <el-button :icon="Download" circle @click="download" />
                </div>
            </div>
            <div ref="playerContainer" :style="{ flexGrow: 1 }" />
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import { VideoPlay, VideoPause, Download } from '@element-plus/icons-vue';
import { usePlayerStore } from '@/stores/player';

const store = usePlayerStore();

const playerContainer = ref<HTMLElement>();

const player = shallowRef<WaveSurfer>();

const playing = ref(false);

function togglePlay() {
    playing.value = !playing.value;
    if (playing.value) {
        player.value?.play();
    } else {
        player.value?.pause();
    }
}

function download() {
    const link = document.createElement('a');
    link.href = store.currentWAV;
    link.download = store.currentWAV.split('/').pop()!;
    link.click();
}

onMounted(() => {
    if (!playerContainer.value) {
        alert('Something went wrong');
        return;
    }

    player.value = WaveSurfer.create({
        container: playerContainer.value,
        waveColor: '#aaa',
        progressColor: '#444',
        url: store.currentWAV,
    });

    player.value.on('finish', () => {
        playing.value = false;
    });
});

store.$subscribe(() => {
    player.value?.load(store.currentWAV);
});
</script>

<style scoped>
.button-container {
    padding: 0.25rem;
}
</style>
