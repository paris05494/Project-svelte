<script lang="ts">
	import StatusPanel from '$lib/components/StatusPanel.svelte';
	import ExcelFileSelector from '$lib/components/ExcelFileSelector.svelte';
	import HypertacVisualizer from '$lib/components/HypertacVisualizer.svelte';
	import SignalInfoPanel from '$lib/components/SignalInfoPanel.svelte';
	import HypertacModal from '$lib/components/Modal/HypertacModal.svelte'; // Import the new custom modal component
	import { appStore } from '$lib/stores/app-store';
	import { Button } from 'flowbite-svelte';

	let statusPanelCollapsed: boolean = true;
	let showHypertacFullScreen: boolean = false;

	// Control body overflow when modal is open
	$: {
		if (typeof document !== 'undefined') {
			// Ensure running in browser environment
			if (showHypertacFullScreen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = ''; // Reset to default
			}
		}
	}

	function openFullScreenHypertacView() {
		if ($appStore.visualizationData?.hypertacSlots.length) {
			showHypertacFullScreen = true;
			appStore.setError(null);
			console.log(
				'Attempting to open full screen modal. showHypertacFullScreen:',
				showHypertacFullScreen
			);
		} else {
			appStore.setError(
				'Upload an Excel file and visualize the Hypertac data before opening the full-screen display mode.'
			);
			console.log('Cannot open full screen modal: No data to visualize.');
		}
	}

	function closeFullScreenHypertacView() {
		showHypertacFullScreen = false;
		console.log('Closing full screen modal. showHypertacFullScreen:', showHypertacFullScreen);
	}
</script>

<div class="flex min-h-[calc(100vh-120px)] flex-col p-2 md:grid md:grid-cols-12 md:gap-2">
	<!-- Left Column: Status Panel & Excel File Selector -->
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

	<!-- Middle Column: Hypertac Visualizer (main view) and its button -->
	<div class="mb-4 flex flex-col md:col-span-6 md:mb-0">
		<div class="panel flex h-full flex-col">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-[var(--color-primary-green)]">HIL Hypertac</h2>
				<Button
					onclick={openFullScreenHypertacView}
					disabled={!$appStore.visualizationData?.hypertacSlots.length || $appStore.isLoading}
					class="bg-[var(--color-primary-green)] text-[var(--color-text-light)] hover:bg-emerald-700"
					size="sm"
				>
					Open Full-Screen View
				</Button>
			</div>
			<!-- Main Hypertac Visualizer instance -->
			<div class="flex-grow">
				<HypertacVisualizer isMainView={true} />
			</div>
		</div>
		{#if $appStore.error && !showHypertacFullScreen}
			<p class="mt-4 text-center text-sm text-red-600">Error: {$appStore.error}</p>
		{/if}
	</div>

	<!-- Right Column: Signal Info Panel -->
	<div class="md:col-span-3">
		<SignalInfoPanel />
	</div>
</div>

<!-- Use the new custom HypertacModal component -->
<!-- This component is positioned at the root of the page, ensuring it can overlay everything -->
<HypertacModal showModal={showHypertacFullScreen} onClose={closeFullScreenHypertacView} />
