<script lang="ts">
	import { appStore } from '../stores/app-store';
	import type { IHypertacSlot } from '../model/Hypertac';
	import { config as backendConfig } from '../../backend_config';

	export let isMainView: boolean; // Prop to differentiate main view from modal view

	const HYPERTAC_ROWS = backendConfig.hypertacConfig.rows;
	const HYPERTAC_COLS = backendConfig.hypertacConfig.cols;
	const TOTAL_CONCEPTUAL_SLOTS = HYPERTAC_ROWS * HYPERTAC_COLS;

	// Derived state for the slots to display
	$: displaySlots = (() => {
		if ($appStore.visualizationData?.hypertacSlots.length) {
			// If data is loaded, use the actual slots and sort them
			return [...$appStore.visualizationData.hypertacSlots].sort((a, b) => {
				if (a.row === b.row) {
					return a.col - b.col;
				}
				return a.row - b.row;
			});
		} else {
			// If no data, generate empty conceptual slots
			const emptySlots: IHypertacSlot[] = [];
			for (let i = 0; i < TOTAL_CONCEPTUAL_SLOTS; i++) {
				const row = Math.floor(i / HYPERTAC_COLS) + 1;
				const col = (i % HYPERTAC_COLS) + 1;
				emptySlots.push({
					id: `R${row}C${col}`,
					row: row,
					col: col,
					isUsed: false,
					signalName: null,
					ecuName: null,
					ecuPin: null,
					physicalHypertacId: null,
					isReused: false
				});
			}
			return emptySlots;
		}
	})();
</script>

<div class="panel flex flex-col {isMainView ? '' : 'h-full'}">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-[var(--color-primary-green)]">HIL Hypertac</h2>
		<!-- The "Open Full-Screen View" button is now in +page.svelte -->
	</div>

	{#if $appStore.isLoading}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-gray-500">Loading Hypertac data...</p>
		</div>
	{:else if $appStore.error && isMainView}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-red-600">Error loading data: {$appStore.error}</p>
		</div>
	{:else}
		<div class="flex-grow overflow-auto p-2">
			<div
				class="hypertac-grid h-full w-full {isMainView ? '' : 'modal-view'}"
				style="--hypertac-rows: {HYPERTAC_ROWS}; --hypertac-cols: {HYPERTAC_COLS};"
			>
				{#each displaySlots as slot (slot.id)}
					<div
						class="hypertac-slot {slot.isUsed ? 'used' : 'empty'} {slot.isReused
							? 'reused'
							: ''} {isMainView ? '' : 'modal-view'}"
						title={slot.signalName
							? `Signal: ${slot.signalName}\nECU: ${slot.ecuName}${slot.ecuPin ? ` (Pin: ${slot.ecuPin})` : ''}\nHypertac Slot: ${slot.id}${slot.physicalHypertacId ? ` (Physical: ${slot.physicalHypertacId})` : ''}\n${slot.isReused ? ' (REUSED)' : ''}`
							: `Empty Slot: ${slot.id}`}
					>
						{#if slot.isUsed}
							<span class="truncate">{slot.signalName}</span>
							{#if slot.isReused}
								<span class="ml-1 text-[var(--color-slot-reused-text)]"> (R)</span>
							{/if}
						{/if}
						<!-- Empty slots will just be circles without text -->
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Styles are mostly handled by app.css */
	.panel {
		display: flex;
		flex-direction: column;
		height: 100%; /* Important for proper flex-grow behavior */
	}
</style>
