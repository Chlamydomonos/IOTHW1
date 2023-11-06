<template>
    <el-upload
        drag
        action="/api/upload"
        :limit="1"
        :on-exceed="handleExceed"
        :on-success="handleSuccess"
        ref="upload"
        accept="audio/wav"
    >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽或<em>点击上传</em></div>
    </el-upload>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { genFileId } from 'element-plus';
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { usePlayerStore } from '@/stores/player';

const upload = ref<UploadInstance>();

const store = usePlayerStore();

const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    upload.value!.handleStart(file);
    upload.value!.submit();
};

const handleSuccess = (res: { path: string }) => {
    console.log(res);
    store.currentWAV = res.path;
};
</script>
