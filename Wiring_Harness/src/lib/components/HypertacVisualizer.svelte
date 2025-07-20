<script lang="ts">
	import { appStore } from '../stores/app-store';
	import type { IHypertacSlot } from '../model/Hypertac';
	import { config as backendConfig } from '../../backend_config'; // Ensure this path is correct

	export let isMainView: boolean; // Prop to differentiate main view from modal view

	$: isModalView = !isMainView;

	// ใช้ค่าจาก backend_config สำหรับ Main View และค่าคงที่สำหรับ Modal View
	const MAIN_VIEW_ROWS = backendConfig.hypertacConfig.rows;
	const MAIN_VIEW_COLS = backendConfig.hypertacConfig.cols;

	const MODAL_VIEW_ROWS = 18; // Fixed rows for modal view
	const MODAL_VIEW_COLS = 5; // Fixed cols for modal view

	// กำหนดจำนวนแถวและคอลัมน์ตามมุมมอง (Main หรือ Modal)
	$: HYPERTAC_ROWS = isModalView ? MODAL_VIEW_ROWS : MAIN_VIEW_ROWS;
	$: HYPERTAC_COLS = isModalView ? MODAL_VIEW_COLS : MAIN_VIEW_COLS;
	$: TOTAL_CONCEPTUAL_SLOTS = HYPERTAC_ROWS * HYPERTAC_COLS;

	// Derived state for the slots to display
	$: displaySlots = (() => {
		// หากมีข้อมูล visualizationData และมี hypertacSlots
		if ($appStore.visualizationData?.hypertacSlots.length) {
			const dataSlots = [...$appStore.visualizationData.hypertacSlots];

			// สร้าง Set ของ ID ช่องที่มีข้อมูลอยู่แล้ว เพื่อใช้ตรวจสอบ
			const existingSlotIds = new Set(dataSlots.map((s) => s.id));

			// สร้าง array ใหม่สำหรับเก็บ slots ทั้งหมด รวมถึงช่องว่าง
			const finalSlots: IHypertacSlot[] = [];

			for (let r = 1; r <= HYPERTAC_ROWS; r++) {
				for (let c = 1; c <= HYPERTAC_COLS; c++) {
					const id = `R${r}C${c}`;
					// ค้นหา slot ที่มีอยู่
					const existingSlot = dataSlots.find((s) => s.row === r && s.col === c);

					if (existingSlot) {
						finalSlots.push(existingSlot);
					} else {
						// เพิ่ม slot ว่างเปล่าถ้าไม่มีข้อมูลสำหรับตำแหน่งนี้
						finalSlots.push({
							id: id,
							row: r,
							col: c,
							isUsed: false,
							signalName: null,
							ecuName: null,
							ecuPin: null,
							physicalHypertacId: null,
							isReused: false
						});
					}
				}
			}
			// คืนค่า finalSlots ที่เรียงลำดับแล้ว
			return finalSlots.sort((a, b) => {
				if (a.row === b.row) {
					return a.col - b.col;
				}
				return a.row - b.row;
			});
		} else {
			// หากไม่มีข้อมูล (visualizationData เป็น null หรือว่างเปล่า) ให้แสดงวงกลมว่างเปล่าตามจำนวนช่องที่กำหนด
			const emptySlots: IHypertacSlot[] = [];
			for (let r = 1; r <= HYPERTAC_ROWS; r++) {
				for (let c = 1; c <= HYPERTAC_COLS; c++) {
					emptySlots.push({
						id: `R${r}C${c}`,
						row: r,
						col: c,
						isUsed: false,
						signalName: null,
						ecuName: null,
						ecuPin: null,
						physicalHypertacId: null,
						isReused: false
					});
				}
			}
			return emptySlots;
		}
	})();
</script>

<div class="panel flex h-full flex-col">
	{#if $appStore.isLoading}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-gray-500">Loading Hypertac data...</p>
		</div>
	{:else if $appStore.error && isMainView}
		<div class="flex flex-grow items-center justify-center"></div>
	{:else}
		<div
			class="flex-grow p-2 {isMainView ? 'custom-scrollbar overflow-y-auto' : 'overflow-hidden'}"
		>
			<div
				class="hypertac-grid w-full {isModalView ? 'modal-view' : 'main-view'}"
				style="--hypertac-rows: {HYPERTAC_ROWS}; --hypertac-cols: {HYPERTAC_COLS};"
			>
				{#each displaySlots as slot (slot.id)}
					<div
						class="hypertac-slot {slot.isUsed ? 'used' : 'empty'} {slot.isReused
							? 'reused'
							: ''} {isModalView ? 'modal-view' : 'main-view'}"
						title={slot.isUsed
							? `Signal: ${slot.signalName || 'N/A'}\nECU: ${slot.ecuName || 'N/A'}${slot.ecuPin ? ` (Pin: ${slot.ecuPin})` : ''}\nHypertac Slot: ${slot.id}${slot.physicalHypertacId ? ` (Physical: ${slot.physicalHypertacId})` : ''}\n${slot.isReused ? ' (REUSED)' : ''}`
							: `Empty Slot: ${slot.id}`}
					>
						{#if slot.isUsed}
							<span class="truncate">{slot.signalName}</span>
							{#if slot.isReused}
								<span class="ml-1 text-[var(--color-slot-reused-text)]"> (R)</span>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		height: 100%; /* Important for proper flex-grow behavior */
	}

	/* Custom scrollbar for better visibility */
	.custom-scrollbar::-webkit-scrollbar {
		width: 8px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
