<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { appStore } from '$lib/stores/app-store';
	export let showModal: boolean;
	export let onClose: () => void;
	const dispatch = createEventDispatcher();
	function handleClickOutside(event: MouseEvent) {
		const modalContent = document.querySelector('.modal-content');
		if (modalContent && !modalContent.contains(event.target as Node)) {
			onClose();
		}
	}
	// Control body overflow when modal is open
	$: {
		if (typeof document !== 'undefined') {
			if (showModal) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	}
</script>

{#if showModal}
	<div class="modal-overlay" on:click={handleClickOutside}>
		<div class="modal-content panel flex flex-col">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-2xl font-bold text-[var(--color-primary-green)]">
					Full-Screen Hypertac View
				</h3>
				<button on:click={onClose} class="text-gray-500 hover:text-gray-700" aria-label="Close modal">
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
			<div class="custom-scrollbar flex-grow overflow-y-auto">
				<slot />
			</div>
			{#if $appStore.isLoading}
				<p class="mt-2 text-center text-sm text-gray-500">Loading...</p>
			{/if}
			{#if $appStore.error}
				<p class="mt-2 text-sm text-red-600">Error: {$appStore.error}</p>
			{/if}
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
		max-width: 90%;
		max-height: 90%;
		width: auto;
		height: auto;
	}
</style>
