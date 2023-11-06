<template>
    <MusicPlayer music-url="/files/music.wav" />
    <el-row :style="{ flexGrow: 1 }">
        <el-col :span="6" :style="{ paddingRight: '0.5rem', paddingTop: '1rem' }">
            <UploadHandler />
            <div :style="{ marginTop: '1rem' }"><WaveGenerator /></div>
        </el-col>
        <el-col :span="6" :style="{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '1rem' }">
            <MusicRecorder />
        </el-col>
        <el-col :span="12" :style="{ paddingLeft: '0.5rem', paddingTop: '1rem' }">
            <ModemConfig />
            <el-row :style="{ paddingTop: '1rem' }">
                <el-col :span="12" :style="{ paddingRight: '0.5rem' }">
                    <ModulateHandler />
                </el-col>
                <el-col :span="12" :style="{ paddingLeft: '0.5rem' }">
                    <DemodulateHandler />
                </el-col>
            </el-row>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import MusicPlayer from './components/MusicPlayer.vue';
import MusicRecorder from './components/MusicRecorder.vue';
import UploadHandler from './components/UploadHandler.vue';
import ModemConfig from './components/ModemConfig.vue';
import WaveGenerator from './components/WaveGenerator.vue';
import ModulateHandler from './components/ModulateHandler.vue';
import DemodulateHandler from './components/DemodulateHandler.vue';
</script>
