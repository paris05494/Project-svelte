<script lang="ts">
	import type { IHypertacSlot } from '../../model/Hypertac';
	import { createEventDispatcher } from 'svelte';
	export let slotData: IHypertacSlot;
	export let onClose: () => void;
	function handleClickOutside(event: MouseEvent) {
		const popupContent = document.querySelector('.popup-content');
		if (popupContent && !popupContent.contains(event.target as Node)) {
			onClose();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			handleClickOutside(event as unknown as MouseEvent);
		}
	}
</script>

<div
	class="popup-overlay"
	on:click={handleClickOutside}
	role="button"
	tabindex="0"
	on:click={handleClickOutside}
	on:keydown={handleKeyDown}
>
	<div class="popup-content panel flex flex-col">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-xl font-bold text-[var(--color-primary-green)]">
				Slot Details: {slotData.id}
			</h3>
			<button on:click={onClose} class="text-gray-500 hover:text-gray-700" aria-label="Close popup">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
		<div class="custom-scrollbar flex-grow overflow-y-auto text-sm">
			{#if slotData.isUsed}
				<p><strong>Status:</strong> Used</p>
				<p><strong>Signal Name:</strong> {slotData.signalName || 'N/A'}</p>
				<p><strong>ECU Name:</strong> {slotData.ecuName || 'N/A'}</p>
				<p><strong>ECU Pin:</strong> {slotData.ecuPin || 'N/A'}</p>
				<p><strong>Physical Hypertac ID:</strong> {slotData.physicalHypertacId || 'N/A'}</p>
				{#if slotData.isReused}
					<p class="text-red-600"><strong>Note:</strong> This slot is reused.</p>
				{/if}
			{:else}
				<p><strong>Status:</strong> Empty Slot</p>
				<p>This slot is not currently used by any signal.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5); /* Slightly lighter overlay */
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1001; /* Higher z-index than modal overlay */
	}
	.popup-content {
		background-color: var(--color-neutral-white);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
		max-width: 400px; /* Adjust size as needed */
		max-height: 80%;
		width: auto;
		height: auto;
	}
</style>

