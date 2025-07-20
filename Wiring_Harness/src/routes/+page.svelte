<script lang="ts">
	import StatusPanel from '$lib/components/StatusPanel.svelte';
	import ExcelFileSelector from '$lib/components/ExcelFileSelector.svelte';
	import HypertacVisualizer from '$lib/components/HypertacVisualizer.svelte';
	import SignalInfoPanel from '$lib/components/SignalInfoPanel.svelte';
	import HypertacModal from '$lib/components/Modal/HypertacModal.svelte';
	import { appStore } from '$lib/stores/app-store';
	import { Button } from 'flowbite-svelte';

	let statusPanelCollapsed: boolean = true;
	let showHypertacFullScreen: boolean = false;

	// Control body overflow when modal is open
	$: {
		if (typeof document !== 'undefined') {
			if (showHypertacFullScreen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	}

	function openFullScreenHypertacView() {
		if ($appStore.visualizationData?.hypertacSlots.length) {
			showHypertacFullScreen = true;
			appStore.setError(null); // Clear any error on successful action
		} else {
			appStore.setError(
				'Upload an Excel file and visualize the Hypertac data before opening the full-screen display mode.'
			);
		}
	}

	function closeFullScreenHypertacView() {
		showHypertacFullScreen = false;
		console.log('Action: Modal close. showHypertacFullScreen set to FALSE.');
	}
</script>

<div class="flex min-h-[calc(100vh-120px)] flex-col p-2 md:grid md:grid-cols-12 md:gap-2">
	<div class="mb-4 flex h-full flex-col gap-2 md:col-span-3 md:mb-0">
		<div
			class="flex flex-col transition-all duration-700 ease-in-out
                {statusPanelCollapsed ? 'h-auto min-h-[5rem]' : 'min-h-[150px] flex-grow'}"
		>
			<StatusPanel bind:isCollapsed={statusPanelCollapsed} />
		</div>
		<div class="flex flex-grow flex-col">
			<ExcelFileSelector />
		</div>
	</div>

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
			<div class="relative flex-grow" style="min-height: 200px;">
				<HypertacVisualizer isMainView={true} />
			</div>
		</div>
	</div>

	<div class="md:col-span-3">
		<SignalInfoPanel />
	</div>
</div>

<HypertacModal showModal={showHypertacFullScreen} onClose={closeFullScreenHypertacView} />
