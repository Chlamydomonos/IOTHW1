<template>
    <MusicPlayer music-url="/files/music.wav" />
    <el-row :style="{ flexGrow: 1 }">
        <el-col :span="6" :style="{ paddingRight: '0.5rem', paddingTop: '1rem' }">
            <PulsePhaseConfig />
        </el-col>
        <el-col :span="6" :style="{ paddingLeft: '0.5rem', paddingTop: '1rem', paddingRight: '0.5rem' }">
            <PulseHandler />
        </el-col>
        <el-col :span="6" :style="{ paddingLeft: '0.5rem', paddingTop: '1rem', paddingRight: '0.5rem' }">
            <PhaseHandler />
        </el-col>
        <el-col :span="6" :style="{ paddingLeft: '0.5rem', paddingTop: '1rem' }">
            <NoiseHandler />
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import MusicPlayer from './components/MusicPlayer.vue';
import PulsePhaseConfig from './components/PulsePhaseConfig.vue';
import PulseHandler from './components/PulseHandler.vue';
import PhaseHandler from './components/PhaseHandler.vue';
import NoiseHandler from './components/NoiseHandler.vue';
</script>
