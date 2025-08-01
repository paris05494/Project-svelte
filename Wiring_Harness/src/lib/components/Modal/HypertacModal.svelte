<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { appStore } from '$lib/stores/app-store';

	export let showModal: boolean;
	export let onClose: () => void;

	function handleClickOutside(event: MouseEvent) {
		const modalContent = document.querySelector('.modal-content');
		if (modalContent && !modalContent.contains(event.target as Node)) {
			onClose();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			handleClickOutside(event as unknown as MouseEvent);
		}
	}
</script>

{#if showModal}
	<div
		class="modal-overlay"
		role="button"
		tabindex="0"
		on:click={handleClickOutside}
		on:keydown={handleKeyDown}
	>
		<div class="modal-content flex h-[45vw] w-[70vw] flex-col">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="background-topic text-2xl font-bold">HIL Hypertac</h3>
				<button
					on:click={onClose}
					class="text-gray-500 hover:text-gray-700"
					aria-label="Close modal"
				>
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

			<div class="scrollable-content flex-grow overflow-y-auto">
				{#if $appStore.isLoading}
					<div class="flex h-full items-center justify-center">
						<p class="text-lg text-gray-500">Loading Hypertac data...</p>
					</div>
				{:else if $appStore.error}
					<div class="flex h-full items-center justify-center">
						<p class="text-lg text-red-600">Error: {$appStore.error}</p>
					</div>
				{:else}
					<slot />
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background-color: var(--color-neutral-white);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}
</style>
