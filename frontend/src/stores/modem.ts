import { defineStore } from 'pinia';

export const useModemStore = defineStore('modem', {
    state() {
        return {
            sampleRate: 44100,
            frequency: 440,
            interval: 200,
        };
    },
    getters: {
        realInterval(): number {
            const { sampleRate, frequency, interval } = this;
            const samplePerInterval = (sampleRate * interval) / 1000;
            const realSamplePerInterval = Math.round(samplePerInterval);
            const realInterval = (realSamplePerInterval * 1000) / sampleRate;
            return realInterval;
        },
    },
});
