<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { appStore } from '../stores/app-store';
    import { apiService } from '../services/api.service';
    import { Button } from 'flowbite-svelte';
    import { getUniqueNewFiles } from '../utils/file-helpers'; // Import the helper function

    const dispatch = createEventDispatcher();

    let fileInputRef: HTMLInputElement | null = null; // อ้างอิงถึง input ไฟล์ที่ซ่อนอยู่จริง
    let selectedFiles: File[] = []; // อาร์เรย์สำหรับเก็บไฟล์ที่เลือกทั้งหมด
    let fileToVisualize: File | null = null; // ไฟล์เดียวที่เลือกเพื่อแสดงผล

    /**
     * จัดการเหตุการณ์การเปลี่ยนแปลงจาก input ไฟล์ที่ซ่อนอยู่
     * เพิ่มไฟล์ที่เลือกใหม่ลงในอาร์เรย์ `selectedFiles` โดยหลีกเลี่ยงไฟล์ซ้ำ
     * @param event เหตุการณ์การเปลี่ยนแปลงจาก input ไฟล์
     */
    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const uniqueNewFiles = getUniqueNewFiles(selectedFiles, input.files); // ใช้ฟังก์ชัน helper

        if (uniqueNewFiles.length > 0) {
            selectedFiles = [...selectedFiles, ...uniqueNewFiles];
            appStore.updateStatus(`เพิ่ม ${uniqueNewFiles.length} ไฟล์ใหม่เข้าสู่รายการ.`);
        }
        // รีเซ็ตค่าของ input เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้หากจำเป็น
        input.value = '';
    }

    /**
     * กำหนดไฟล์ที่ระบุให้เป็นไฟล์ที่จะแสดงผล
     * @param file อ็อบเจกต์ File ที่จะกำหนดสำหรับการแสดงผล
     */
    function selectFileForVisualization(file: File) {
        console.log('File selected for visualization:', file.name); // บันทึกการดีบัก
        fileToVisualize = file;
        appStore.updateStatus(`เลือกไฟล์สำหรับแสดงผล: ${file.name}`);
        appStore.setError(null); // ล้างข้อผิดพลาดก่อนหน้าเมื่อเลือกไฟล์ใหม่
    }

    async function handleVisualizeSelectedFile() {
        if (!fileToVisualize) {
            appStore.setError('กรุณาเลือกไฟล์จากรายการเพื่อแสดงผล.');
            return;
        }

        appStore.setLoading(true);
        appStore.updateStatus(`กำลังแสดงผลไฟล์: ${fileToVisualize.name}...`);
        appStore.setError(null); // ล้างข้อผิดพลาดก่อนหน้า

        const data = await apiService.uploadExcelFile(fileToVisualize);

        if (data) {
            appStore.setVisualizationData(data, fileToVisualize.name);
            appStore.updateStatus(`แสดงผลสำเร็จ: ${fileToVisualize.name}`);
        } else {
            appStore.updateStatus(`ไม่สามารถแสดงผล ${fileToVisualize.name} ได้. กรุณาตรวจสอบข้อผิดพลาด.`);
        }
        appStore.setLoading(false);
    }

    function clearAllFiles() {
        selectedFiles = [];
        fileToVisualize = null; // ล้างไฟล์ที่เลือกเพื่อแสดงผลด้วย
        if (fileInputRef) fileInputRef.value = ''; // รีเซ็ต input ไฟล์ที่ซ่อนอยู่
        appStore.setVisualizationData(null, null); // ล้างข้อมูลการแสดงผลใน store ด้วย
        appStore.updateStatus('ล้างการเลือกไฟล์ทั้งหมดแล้ว.');
    }

    function triggerFileInput() {
        fileInputRef?.click();
    }
</script>

<div class="panel">
    <h2 class="mb-2 text-lg font-semibold text-[var(--color-primary-green)]">การเลือกไฟล์ Excel</h2>

    <div class="flex flex-grow flex-col gap-3">
        <input
            type="file"
            accept=".xlsx, .xls"
            multiple
            class="hidden"
            bind:this={fileInputRef}
            onchange={handleFileChange}
        />

        <Button
            onclick={triggerFileInput}
            class="w-full bg-[var(--color-secondary-purple)] text-[var(--color-text-light)] hover:bg-violet-700"
        >
            เปิดโฟลเดอร์ & เลือกไฟล์ Excel
        </Button>

        <h3 class="text-md mt-2 font-medium text-[var(--color-text-dark)]">
            ไฟล์ที่เลือก ({selectedFiles.length}):
        </h3>
        {#if selectedFiles.length > 0}
            <ul class="scrollable-content max-h-48"> <!-- Added max-h-48 and scrollable-content for file list scrolling -->
                {#each selectedFiles as file (file.name + file.size)}
                    <li class="border-b border-gray-100 last:border-b-0">
                        <button
                            type="button"
                            class="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-100
                            {file === fileToVisualize
                                ? 'border-l-4 border-emerald-500 bg-emerald-100 font-semibold'
                                : ''}"
                            onclick={() => selectFileForVisualization(file)}
                        >
                            <span class="truncate pr-2" title={file.name}>{file.name}</span>
                            <span class="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="text-sm text-gray-500 italic">ยังไม่มีไฟล์ที่เลือก.</p>
        {/if}

        <div class="mt-2">
            <p class="text-sm text-[var(--color-text-dark)]">
                ไฟล์ที่จะแสดงผล:
                <span class="font-semibold">
                    {#if fileToVisualize}
                        {fileToVisualize.name}
                    {:else}
                        ยังไม่มีไฟล์ที่เลือกสำหรับแสดงผล.
                    {/if}
                </span>
            </p>
        </div>

        <Button
            onclick={handleVisualizeSelectedFile}
            disabled={!fileToVisualize || $appStore.isLoading}
            class="w-full bg-[var(--color-primary-green)] text-[var(--color-text-light)] hover:bg-emerald-700"
        >
            {#if $appStore.isLoading}
                กำลังแสดงผล...
            {:else}
                แสดงผลไฟล์ที่เลือก
            {/if}
        </Button>
        <Button
            onclick={clearAllFiles}
            disabled={selectedFiles.length === 0}
            color="light"
            class="w-full border border-gray-300 text-[var(--color-text-dark)] hover:bg-gray-100"
            >ล้างไฟล์ทั้งหมด</Button
        >

        {#if $appStore.error}
            <p class="mt-2 text-sm text-red-600">ข้อผิดพลาด: {$appStore.error}</p>
        {/if}
    </div>
</div>
