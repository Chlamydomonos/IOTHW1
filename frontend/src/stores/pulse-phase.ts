import { defineStore } from 'pinia';

export const usePulsePhaseStore = defineStore('pulsePhase', {
    state() {
        return {
            sampleRate: 44100,
            frequency: 10000,
            initialPhaseDegree: 0,
            pulseLength: 10,
            interval0Length: 10,
            interval1Length: 20,
            symbolLength: 10,
            amplitudePercent: 100,
            thresholdPercent: 100,
        };
    },
    getters: {
        initialPhase(): number {
            return (this.initialPhaseDegree * Math.PI) / 180;
        },
        amplitude(): number {
            return this.amplitudePercent / 100;
        },
        threshold(): number {
            return this.thresholdPercent / 100;
        },
    },
});
