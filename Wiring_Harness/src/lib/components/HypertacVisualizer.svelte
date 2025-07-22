<script lang="ts">
	import { appStore } from '../stores/app-store';
	import type { IHypertacSlot, IHypertacVisualizationData } from '../model/Hypertac';
	import { config as backendConfig } from '../../backend_config';
	export let isMainView: boolean;
	$: isModalView = !isMainView;
	const MAIN_VIEW_COLS = backendConfig.hypertacConfig.cols;
	const MODAL_VIEW_COLS = 10;
	$: HYPERTAC_COLS = isModalView ? MODAL_VIEW_COLS : MAIN_VIEW_COLS;
	export let visualizationData: IHypertacVisualizationData | null;
	$: displaySlots = (() => {
		const allSlots: IHypertacSlot[] = [];
		const dataSlots = visualizationData?.hypertacSlots || [];
		const existingSlotMap = new Map<string, IHypertacSlot>();
		for (const slot of dataSlots) {
			existingSlotMap.set(`R${slot.row}C${slot.col}`, slot);
		}
		let currentMaxRow = 0;
		if (dataSlots.length > 0) {
			currentMaxRow = dataSlots.reduce((max, s) => Math.max(max, s.row), 0);
		}
		const neededRowsForData =
			dataSlots.length > 0 ? Math.ceil(dataSlots.length / HYPERTAC_COLS) : 0;
		let effectiveRows = 0;
		if (isModalView) {
			effectiveRows = 18; // Fixed rows for modal to ensure density
		} else {
			// For Main View, use a base from backend config or currentMaxRow, ensuring it allows content to overflow for scroll
			// The height of the Hypertac container in +page.svelte will determine when scroll kicks in.
			// Here, we just ensure enough rows are *generated* to contain all data.
			effectiveRows = Math.max(backendConfig.hypertacConfig.rows, neededRowsForData, 5); // Ensure at least 5 rows for visibility, and enough for data
		}
		// Ensure minimum 5 rows for Main View, and 18 for Modal View, to always have some grid space
		effectiveRows = Math.max(effectiveRows, isModalView ? 18 : 5);
		for (let r = 1; r <= effectiveRows; r++) {
			for (let c = 1; c <= HYPERTAC_COLS; c++) {
				const id = `R${r}C${c}`;
				const existingSlot = existingSlotMap.get(id);
				if (existingSlot) {
					allSlots.push(existingSlot);
				} else {
					allSlots.push({
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
		return allSlots.sort((a, b) => {
			if (a.row === b.row) {
				return a.col - b.col;
			}
			return a.row - b.row;
		});
	})();
	// HYPERTAC_ROWS ต้องถูกคำนวณจากจำนวนช่องทั้งหมดหารด้วยจำนวนคอลัมน์ เพื่อให้ Grid มีแถวพอดี
	$: HYPERTAC_ROWS = Math.ceil(displaySlots.length / HYPERTAC_COLS);
</script>

<div class="h-full w-full">
	{#if $appStore.isLoading}
		<div class="flex h-full w-full items-center justify-center">
			<p class="text-lg text-gray-500">Loading Hypertac data...</p>
		</div>
	{:else if $appStore.error && isMainView}
		<div class="flex h-full w-full items-center justify-center">
			<p class="text-lg text-red-600">Error: {$appStore.error}</p>
		</div>
	{:else}
		<div class="h-full w-full p-2">
			<div
				class="hypertac-grid w-full {isModalView ? 'modal-grid-view' : 'main-grid-view'}"
				style="--hypertac-rows: {HYPERTAC_ROWS}; --hypertac-cols: {HYPERTAC_COLS};"
			>
				{#each displaySlots as slot (slot.id)}
					<div
						class="hypertac-slot {slot.isUsed ? 'used' : 'empty'} {slot.isReused
							? 'reused'
							: ''} {isModalView ? 'modal-slot-view' : 'main-slot-view'}"
						title={slot.isUsed
							? `Signal: ${slot.signalName || 'N/A'}\nECU: ${slot.ecuName || 'N/A'}${slot.ecuPin ? ` (Pin: ${slot.ecuPin})` : ''}\nHypertac Slot: ${slot.id}${slot.physicalHypertacId ? ` (Physical: ${slot.physicalHypertacId})` : ''}\n${slot.isReused ? ' (REUSED)' : ''}`
							: `Empty Slot: ${slot.id}`}
					>
						{#if slot.isUsed}
							<span class="truncate">
								{isModalView ? slot.physicalHypertacId || slot.id : slot.signalName}
							</span>
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
	/* Custom scrollbar styles (ยังคงอยู่ตรงนี้ เพื่อให้ parent สามารถเรียกใช้ class ได้) */
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
	/* Base styles for the grid container */
	.hypertac-grid {
		display: grid;
		width: 100%;
		height: auto; /* Allow grid to determine its own height based on content */
		grid-template-columns: repeat(var(--hypertac-cols), minmax(0, 1fr));
		grid-template-rows: repeat(var(--hypertac-rows), auto); /* Each row takes content height */
		gap: 0.2rem; /* Default small gap */
	}
	/* Base styles for individual slots */
	.hypertac-slot {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-slot-empty);
		border-radius: 9999px;
		aspect-ratio: 1 / 1;
		font-weight: 500;
		text-align: center;
		cursor: default;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
		box-sizing: border-box;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin: auto;
	}
	/* Specific styles for Main View grid */
	.hypertac-grid.main-grid-view {
		gap: 0.8rem; /* เพิ่ม gap ให้มากขึ้นเพื่อไม่ให้ติดกันเกินไป */
	}
	/* Specific styles for Main View slots (ให้มองชัดๆ ไม่ติดกันเกินในแนวตั้ง) */
	.hypertac-slot.main-slot-view {
		font-size: 0.7rem; /* เพิ่มขนาด font */
		padding: 0.3rem; /* เพิ่ม padding เล็กน้อย */
		min-width: 50px; /* เพิ่มขนาดวงกลม */
		min-height: 50px;
		max-width: 70px; /* จำกัดขนาดสูงสุด */
		max-height: 70px;
	}
	/* Specific styles for Modal View grid */
	.hypertac-grid.modal-grid-view {
		gap: 0.2rem;
	}
	/* Specific styles for Modal View slots (คงขนาดเดิม) */
	.hypertac-slot.modal-slot-view {
		font-size: 0.35rem;
		padding: 0;
		min-width: 18px;
		min-height: 18px;
		max-width: 28px;
		max-height: 28px;
	}
	/* Color styles (ไม่มีการเปลี่ยนแปลง) */
	.hypertac-slot.used {
		background-color: var(--color-slot-used);
		border-color: var(--color-primary-green);
		color: var(--color-slot-used-text);
	}
	.hypertac-slot.empty {
		background-color: var(--color-slot-empty);
		border-color: var(--color-slot-empty);
		color: var(--color-slot-empty-text);
	}
	.hypertac-slot.reused {
		background-color: var(--color-slot-reused);
		border-color: var(--color-slot-reused-text);
		color: var(--color-slot-reused-text);
		animation: pulse-red 1.5s infinite;
	}
	@keyframes pulse-red {
		0% {
			box-shadow: 0 0 0 0 rgba(252, 165, 165, 0.7);
		}
		70% {
			box-shadow: 0 0 0 5px rgba(252, 165, 165, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(252, 165, 165, 0);
		}
	}
</style>
