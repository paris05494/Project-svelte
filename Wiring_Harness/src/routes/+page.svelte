<script lang="ts">
	import StatusPanel from '$lib/hypertac/StatusPanel.svelte';
	import ExcelFileSelector from '$lib/hypertac/ExcelFileSelector.svelte';
	import HypertacVisualizer from '$lib/hypertac/HypertacVisualizer.svelte';
	import SignalInfoPanel from '$lib/hypertac/SignalInfoPanel.svelte';
	import HypertacModal from '$lib/hypertac/Modal/HypertacModal.svelte';
	import HypertacSlotDetailModal from '$lib/hypertac/Modal/HypertacSlotDetailModal.svelte';
	import { appStore } from '$lib/stores/app-store';
	import { Button } from 'flowbite-svelte';
	import type { IHypertacSlot } from '$lib/model/Hypertac';
	import expandLogo from '$lib/assets/expandLogo.png';
	
	let statusPanelCollapsed: boolean = true;
	let showHypertacFullScreen: boolean = false;
	let selectedSlot: IHypertacSlot | null = null;

	// Control body overflow when modal is open
	$: {
		if (typeof document !== 'undefined') {
			if (showHypertacFullScreen || selectedSlot) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	}

	function openFullScreenHypertacView() {
		if ($appStore.visualizationData?.hypertacSlots.length) {
			showHypertacFullScreen = true;
			appStore.setError(null);
			appStore.updateStatus('Opening full-screen Hypertac view.');
		} else {
			appStore.setError(
				'Upload an Excel file and visualize the Hypertac data before opening the full-screen display mode.'
			);
			appStore.updateStatus('Failed to open full-screen view: No data available.');
		}
	}

	function closeFullScreenHypertacView() {
		showHypertacFullScreen = false;
		appStore.updateStatus('Full-screen Hypertac view closed.');
	}

	function handleSlotClick(event: CustomEvent<IHypertacSlot>) {
		selectedSlot = event.detail;
		appStore.updateStatus(`Slot ${selectedSlot.id} clicked.`);
	}

	function closeSlotDetailPopup() {
		selectedSlot = null;
	}
	
</script>

<div class="flex min-h-[calc(100vh-120px)] flex-col p-2 md:grid md:grid-cols-12 md:gap-2">
	<div class="mb-4 flex flex-col gap-2 md:col-span-3 md:mb-0">
		<div
			class="flex flex-col transition-all duration-700 ease-in-out"
			style={statusPanelCollapsed
				? 'height: 5rem; max-height: 5rem; overflow: hidden;'
				: 'flex-grow: 1; min-height: 150px; max-height: 40vh; overflow: hidden;'}
		>
			<StatusPanel bind:isCollapsed={statusPanelCollapsed} />
		</div>
		<div class="flex flex-grow flex-col">
			<ExcelFileSelector />
		</div>
	</div>
	<div class="mb-4 flex flex-col gap-2 md:col-span-9 md:mb-0">
		<div class="panel flex flex-grow-[2] flex-col">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="background-topic text-2xl font-bold">HIL Hypertac</h2>
				<Button
					onclick={openFullScreenHypertacView}
					disabled={false}
					class="border border-gray-300 p-1.5 rounded-2xl hover:bg-gray-100"
					size="sm"
				>
					<img src={expandLogo} alt="Expand Logo" class="h-5 w-5" />
				</Button>
				<Button onclick={() => showHypertacFullScreen = true}
					class="border border-gray-300 p-1.5 rounded-2xl hover:bg-gray-100"
					>
					Test Modal
				</Button>
			</div>
			<div class="scrollable-content max-h-85 relative flex-grow overflow-y-auto">
				<HypertacVisualizer
					visualizationData={$appStore.visualizationData}
					isMainView={true}
					on:slotClick={handleSlotClick}
				/>
			</div>
		</div>
		<div class="flex flex-grow-[1] flex-col"><SignalInfoPanel /></div>
	</div>
</div>
<HypertacModal showModal={showHypertacFullScreen} onClose={closeFullScreenHypertacView}>
	<HypertacVisualizer
		visualizationData={$appStore.visualizationData}
		isMainView={false}
		on:slotClick={handleSlotClick}
	/>
</HypertacModal>
{#if selectedSlot}
	<HypertacSlotDetailModal slotData={selectedSlot} onClose={closeSlotDetailPopup} />
{/if}
