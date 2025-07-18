<script lang="ts">
	import { appStore } from '../store/app-store';
	import type { IHypertacSlot } from '../model/Hypertac';
	import { config as backendConfig } from '../../backend_config'; // Mock config from backend
	import { Button } from 'flowbite-svelte';

	const HYPERTAC_ROWS = backendConfig.hypertacConfig.rows;
	const HYPERTAC_COLS = backendConfig.hypertacConfig.cols;

	let isCollapsed: boolean = false;

	$: hypertacSlots = $appStore.visualizationData?.hypertacSlots || [];
	$: sortedSlots = [...hypertacSlots].sort((a, b) => {
		if (a.row === b.row) {
			return a.col - b.col;
		}
		return a.row - b.row;
	});
	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<div class="panel">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-[var(--color-primary-green)]">HIL Hypertac</h2>
		<Button
			onclick={toggleCollapse}
			color="light"
			size="sm"
			class="border border-gray-300 p-1.5 hover:bg-gray-100"
		>
			{#if isCollapsed}
				<!-- Inline SVG สำหรับ Chevron Down -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			{:else}
				<!-- Inline SVG สำหรับ Chevron Up -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 15l-6-6-6 6" />
				</svg>
			{/if}
		</Button>
	</div>
	{#if $appStore.isLoading}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-gray-500">Loading Hypertac data...</p>
		</div>
	{:else if $appStore.error}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-red-600">Error loading data: {$appStore.error}</p>
		</div>
	{:else if isCollapsed}
		<div class="flex flex-grow items-center justify-center italic text-gray-500">
			<p>Hypertac visualization is collapsed. Click 'Expand' to view.</p>
		</div>
	{:else if hypertacSlots.length > 0}
		<div class="flex-grow overflow-auto p-2">
			<div
				class="hypertac-grid h-full w-full"
				style="--hypertac-rows: {HYPERTAC_ROWS}; --hypertac-cols: {HYPERTAC_COLS};"
			>
				{#each sortedSlots as slot (slot.id)}
					<div
						class="hypertac-slot {slot.isUsed ? 'used' : 'empty'} {slot.isReused ? 'reused' : ''}"
						title={slot.signalName
							? `Signal: ${slot.signalName}\nECU: ${slot.ecuName}${slot.ecuPin ? ` (Pin: ${slot.ecuPin})` : ''}\nHypertac Slot: ${slot.id}${slot.physicalHypertacId ? ` (Physical: ${slot.physicalHypertacId})` : ''}\n${slot.isReused ? ' (REUSED)' : ''}`
							: `Empty Slot: ${slot.id}`}
					>
						{#if slot.isUsed}
							<span class="truncate">{slot.signalName}</span>
							{#if slot.isReused}
								<span class="ml-1 text-[var(--color-slot-reused-text)]"> (R)</span>
							{/if}
						{:else}
							<span class="text-[var(--color-slot-empty-text)] opacity-75">{slot.id}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex flex-grow items-center justify-center">
			<p class="text-lg text-gray-500">Upload an Excel file to visualize Hypertac data.</p>
		</div>
	{/if}
</div>

<style>
	/* Moved grid-template-columns and grid-template-rows to app.css for consistency */
</style>
