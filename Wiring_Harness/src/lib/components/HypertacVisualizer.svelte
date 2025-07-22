<script lang="ts">
	import { appStore } from '../stores/app-store';
	import type { IHypertacSlot } from '../model/Hypertac';
	import { config as backendConfig } from '../../backend_config'; // Ensure this path is correct
	export let isMainView: boolean; // Prop to differentiate main view from modal view
	$: isModalView = !isMainView;

	const MAIN_VIEW_COLS = backendConfig.hypertacConfig.cols;
	const MODAL_VIEW_COLS = 10;
	$: HYPERTAC_COLS = isModalView ? MODAL_VIEW_COLS : MAIN_VIEW_COLS;

	$: displaySlots = (() => {
		const allSlots: IHypertacSlot[] = [];
		const dataSlots = $appStore.visualizationData?.hypertacSlots || [];
		const existingSlotMap = new Map<string, IHypertacSlot>();

		for (const slot of dataSlots) {
			existingSlotMap.set(`R${slot.row}C${slot.col}`, slot);
		}

		let currentMaxRow = 0;
		if (dataSlots.length > 0) {
			currentMaxRow = dataSlots.reduce((max, s) => Math.max(max, s.row), 0);
		}

		let effectiveRows = 0;
		if (isModalView) {

			effectiveRows = 18;
		} else {

			effectiveRows = Math.max(backendConfig.hypertacConfig.rows, currentMaxRow);

			if (dataSlots.length === 0) {
				effectiveRows = backendConfig.hypertacConfig.rows;
			}
		}

		effectiveRows = Math.max(effectiveRows, 5);
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
</script>

<div class="flex h-full flex-col">
	{#if $appStore.isLoading}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-gray-500">Loading Hypertac data...</p>
		</div>
	{:else if $appStore.error && isMainView}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-red-600">Error: {$appStore.error}</p>
		</div>
	{:else}
		<div
			class="flex-grow p-2 {isMainView || isModalView
				? 'custom-scrollbar overflow-y-auto'
				: 'overflow-hidden'}"
		>
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
		height: 100%; /* Ensures the grid tries to fill its container */
		grid-template-columns: repeat(var(--hypertac-cols), minmax(0, 1fr));
		grid-template-rows: repeat(var(--hypertac-rows), minmax(0, 1fr)); /* Use explicit rows */
		gap: 0.2rem; /* Default small gap */
	}
	/* Base styles for individual slots */
	.hypertac-slot {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-slot-empty);
		border-radius: 9999px; /* Makes it a perfect circle */
		aspect-ratio: 1 / 1; /* Ensures it's a perfect circle */
		font-weight: 500;
		text-align: center;
		cursor: default;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
		box-sizing: border-box;
		overflow: hidden; /* Hide overflowing text */
		text-overflow: ellipsis; /* Add ellipsis for hidden text */
		white-space: nowrap; /* Prevent text from wrapping */
		margin: auto; /* Center within grid cell */
	}
	/* Specific styles for Main View grid */
	.hypertac-grid.main-grid-view {
		gap: 0.5rem;
	}
	/* Specific styles for Main View slots (make them look like modal view slots) */
	.hypertac-slot.main-slot-view {
		font-size: 0.35rem; /* Make font small like modal view */
		padding: 0;
		min-width: 18px; /* Small size like modal view */
		min-height: 18px;
		max-width: 28px; /* Max size to keep them consistent */
		max-height: 28px;
	}
	/* Specific styles for Modal View grid */
	.hypertac-grid.modal-grid-view {
		gap: 0.2rem; /* Very small gap for modal view (dense) */
		/* No fixed height here, let flex-grow and overflow handle it */
	}
	/* Specific styles for Modal View slots */
	.hypertac-slot.modal-slot-view {
		font-size: 0.35rem; /* Small font for modal view */
		padding: 0;
		min-width: 18px; /* Small size for modal view */
		min-height: 18px;
		max-width: 28px;
		max-height: 28px;
	}
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
