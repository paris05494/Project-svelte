<script lang="ts">
	import HypertacVisualizer from '../HypertacVisualizer.svelte';
	import { Button } from 'flowbite-svelte'; // Keep Button for the close button

	export let showModal: boolean; // Prop to control modal visibility
	export let onClose: () => void; // Callback function to close the modal

	// Function to handle clicks outside the modal content
	function handleClickOutside(event: MouseEvent) {
		// Only close if the click is on the overlay itself, not on the modal content
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	// Log for debugging
	$: if (showModal) {
		console.log('HypertacModal is rendered and showModal is true.');
	}
</script>

{#if showModal}
	<!-- Modal Overlay -->
	<!-- z-[100] ensures it's on top of almost everything -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4"
		on:click={handleClickOutside}
		on:keydown={(e) => {
			if (e.key === 'Escape') onClose();
		}}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Modal Content -->
		<div
			class="modal-content relative flex h-full max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
		>
			<!-- Modal Header -->
			<div class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4">
				<h2 class="text-2xl font-bold text-[var(--color-primary-green)]">
					Full-Screen HIL Hypertac View
				</h2>
				<Button color="light" size="sm" onclick={onClose} class="p-1.5 hover:bg-gray-100">
					<!-- Close icon SVG -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</Button>
			</div>
			<!-- Modal Body (Hypertac Visualizer) -->
			<div class="flex-grow overflow-auto p-4">
				<HypertacVisualizer isMainView={false} />
			</div>
		</div>
	</div>
{/if}

<style>
	/* No component-specific styles needed here, Tailwind handles most */
</style>
