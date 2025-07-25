<script lang="ts">
	import { appStore } from '../stores/app-store';
	import type { IHypertacSlot, IHypertacVisualizationData } from '../model/Hypertac';
	import { config as backendConfig } from '../../backend_config';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let isMainView: boolean;
	$: isModalView = !isMainView;
	const MAIN_VIEW_COLS = backendConfig.hypertacConfig.cols;
	const MODAL_VIEW_COLS = 5;
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
			effectiveRows = 18;
		} else {
			effectiveRows = Math.max(backendConfig.hypertacConfig.rows, neededRowsForData, 5);
		}
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
	$: HYPERTAC_ROWS = Math.ceil(displaySlots.length / HYPERTAC_COLS);
	function onSlotClick(slot: IHypertacSlot) {
		dispatch('slotClick', slot);
	}
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
		<div class="h-full w-full p-2 ">
			<div
				class="hypertac-grid w-full {isModalView ? 'modal-view' : ''}"
				style="--hypertac-rows: {HYPERTAC_ROWS}; --hypertac-cols: {HYPERTAC_COLS};"
			>
				{#each displaySlots as slot (slot.id)}
					<div
						class="hypertac-slot {slot.isUsed ? 'used' : 'empty'} {slot.isReused
							? 'reused'
							: ''} {isModalView ? 'modal-view' : ''}"
						title={slot.isUsed
							? `Signal: ${slot.signalName || 'N/A'}\nECU: ${slot.ecuName || 'N/A'}${slot.ecuPin ? ` (Pin: ${slot.ecuPin})` : ''}\nHypertac Slot: ${slot.id}${slot.physicalHypertacId ? ` (Physical: ${slot.physicalHypertacId})` : ''}\n${slot.isReused ? ' (REUSED)' : ''}`
							: `Empty Slot: ${slot.id}`}
						role="button"
						tabindex="0"
						on:click={() => onSlotClick(slot)}
						on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onSlotClick(slot)}
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
