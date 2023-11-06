<template>
    <el-form class="outer-frame">
        <el-form-item label="采样率" size="small">
            <el-row>
                <el-input-number v-model="store.sampleRate" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">Hz</span>
            </el-row>
        </el-form-item>
        <el-form-item label="频率" size="small">
            <el-row>
                <el-input-number v-model="store.frequency" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">Hz</span>
            </el-row>
        </el-form-item>
        <el-form-item label="调制长度" size="small">
            <el-row>
                <el-input-number v-model="store.interval" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">ms</span>
            </el-row>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { useModemStore } from '@/stores/modem';

const store = useModemStore();
</script>
