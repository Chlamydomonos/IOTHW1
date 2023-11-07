<template>
    <el-form class="outer-frame">
        <div class="title">通用参数</div>
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
        <el-form-item label="初始相位" size="small">
            <el-row>
                <el-input-number v-model="store.initialPhaseDegree" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">°</span>
            </el-row>
        </el-form-item>
        <div class="title">脉冲间隔调制/解调参数</div>
        <el-form-item label="脉冲长度" size="small">
            <el-row>
                <el-input-number v-model="store.pulseLength" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">ms</span>
            </el-row>
        </el-form-item>
        <el-form-item label="间隔0长度" size="small">
            <el-row>
                <el-input-number v-model="store.interval0Length" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">ms</span>
            </el-row>
        </el-form-item>
        <el-form-item label="间隔1长度" size="small">
            <el-row>
                <el-input-number v-model="store.interval1Length" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">ms</span>
            </el-row>
        </el-form-item>
        <div class="title">相位调制/解调参数</div>
        <el-form-item label="调制符号长度" size="small">
            <el-row>
                <el-input-number v-model="store.symbolLength" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">ms</span>
            </el-row>
        </el-form-item>
        <div class="title">调制参数</div>
        <el-form-item label="响度" size="small">
            <el-row>
                <el-input-number v-model="store.amplitudePercent" :controls="false" />
                <span :style="{ marginLeft: '0.25rem' }">%</span>
            </el-row>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { usePulsePhaseStore } from '@/stores/pulse-phase';

const store = usePulsePhaseStore();
</script>
