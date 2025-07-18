<script lang="ts">
	import StatusPanel from '$lib/hypertac/StatusPanel.svelte';
	import ExcelFileSelector from '$lib/hypertac/ExcelFileSelector.svelte';
	import HypertacVisualizer from '$lib/hypertac/HypertacVisualizer.svelte';
	import SignalInfoPanel from '$lib/hypertac/SignalInfoPanel.svelte';
	import { appStore } from '$lib/store/app-store';
	import { Button } from 'flowbite-svelte';

	let statusPanelCollapsed: boolean = true; // State for Status Panel collapse
	let showHypertacModal: boolean = false; // State for Hypertac Modal visibility
	function openHypertacModal() {
		if ($appStore.visualizationData?.hypertacSlots.length) {
			showHypertacModal = true;
		} else {
			appStore.setError(
				'Upload the Excel file and display the Hypertac data before opening the full-screen display mode.'
			);
		}
	}
</script>

<div class="flex min-h-[calc(100vh-120px)] flex-col p-2 md:grid md:grid-cols-12 md:gap-2">
	<div class="mb-4 flex h-full flex-col gap-2 md:col-span-3 md:mb-0">
		<div
			class="flex flex-col transition-all duration-700 ease-in-out
			   {statusPanelCollapsed ? 'h-auto min-h-[5rem]' : 'h-1/3 min-h-[150px]'}"
		>
			<StatusPanel bind:isCollapsed={statusPanelCollapsed} />
		</div>
		<div class="flex flex-grow flex-col">
			<ExcelFileSelector />
		</div>
	</div>
	<div class="mb-4 flex flex-col items-center justify-center md:col-span-9 md:mb-0">
		<div class="panel flex h-full w-full flex-col items-center justify-center p-4">
			<h2 class="mb-4 text-xl font-semibold text-[var(--color-primary-green)]">
				Hypertac Visualization
			</h2>
			<Button
				onclick={openHypertacModal}
				disabled={!$appStore.visualizationData?.hypertacSlots.length || $appStore.isLoading}
				class="bg-[var(--color-primary-green)] text-[var(--color-text-light)] hover:bg-emerald-700"
			>
				Open Full-Screen Hypertac View
				{#if $appStore.visualizationData?.hypertacSlots.length}
					<span class="ml-2 text-sm">({$appStore.currentFileName})</span>
				{/if}
			</Button>
			{#if $appStore.error}
				<p class="mt-4 text-sm text-red-600">Error: {$appStore.error}</p>
			{/if}
		</div>
	</div>
	<div class="md:col-span-3">
		<SignalInfoPanel />
	</div>
</div>
<HypertacVisualizer bind:showModal={showHypertacModal} />
