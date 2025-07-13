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
			appStore.updateStatus(`Added ${uniqueNewFiles.length} new file(s) to selection.`);
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
		appStore.updateStatus(`Selected file for visualization: ${file.name}`);
		appStore.setError(null); // ล้างข้อผิดพลาดก่อนหน้าเมื่อเลือกไฟล์ใหม่
	}

	async function handleVisualizeSelectedFile() {
		if (!fileToVisualize) {
			appStore.setError('Please select a file from the list to visualize.');
			return;
		}

		appStore.setLoading(true);
		appStore.updateStatus(`Visualizing file: ${fileToVisualize.name}...`);
		appStore.setError(null); // ล้างข้อผิดพลาดก่อนหน้า

		const data = await apiService.uploadExcelFile(fileToVisualize);

		if (data) {
			appStore.setVisualizationData(data, fileToVisualize.name);
			appStore.updateStatus(`Successfully visualized: ${fileToVisualize.name}`);
		} else {
			appStore.updateStatus(`Failed to visualize ${fileToVisualize.name}. Please check errors.`);
		}
		appStore.setLoading(false);
	}

	function clearAllFiles() {
		selectedFiles = [];
		fileToVisualize = null; // ล้างไฟล์ที่เลือกเพื่อแสดงผลด้วย
		if (fileInputRef) fileInputRef.value = ''; // รีเซ็ต input ไฟล์ที่ซ่อนอยู่
		appStore.setVisualizationData(null, null); // ล้างข้อมูลการแสดงผลใน store ด้วย
		appStore.updateStatus('All file selections cleared.');
	}

	function triggerFileInput() {
		fileInputRef?.click();
	}
</script>

<div class="panel">
	<h2 class="mb-2 text-lg font-semibold text-[var(--color-primary-green)]">Excel File Selection</h2>

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
			Open Folder & Select Excel Files
		</Button>

		<h3 class="text-md mt-2 font-medium text-[var(--color-text-dark)]">
			Selected Files ({selectedFiles.length}):
		</h3>
		{#if selectedFiles.length > 0}
			<ul>
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
			<p class="text-sm text-gray-500 italic">No files selected yet.</p>
		{/if}

		<div class="mt-2">
			<p class="text-sm text-[var(--color-text-dark)]">
				File to Visualize:
				<span class="font-semibold">
					{#if fileToVisualize}
						{fileToVisualize.name}
					{:else}
						No file selected for visualization.
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
				Visualizing...
			{:else}
				Visualize Selected File
			{/if}
		</Button>
		<Button
			onclick={clearAllFiles}
			disabled={selectedFiles.length === 0}
			color="light"
			class="w-full border border-gray-300 text-[var(--color-text-dark)] hover:bg-gray-100"
			>Clear All Files</Button
		>

		{#if $appStore.error}
			<p class="mt-2 text-sm text-red-600">Error: {$appStore.error}</p>
		{/if}
	</div>
</div>
