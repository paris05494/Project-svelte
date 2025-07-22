<script lang="ts">
	import { appStore } from '../stores/app-store';

	import { Button } from 'flowbite-svelte';

	export let isCollapsed: boolean = true; // Initial state: collapsed

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<div class="panel flex flex-col">
	<div class="mb-2 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-[var(--color-primary-green)]">Status</h2>

		<Button
			onclick={toggleCollapse}
			color="light"
			size="sm"
			class="border border-gray-300 p-1.5 hover:bg-gray-100"
		>
			{#if isCollapsed}
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
	<div
		class="scrollable-content overflow-hidden transition-[max-height] duration-500 ease-in-out"
		style="max-height: {isCollapsed ? '0' : '9999px'};"
	>
		<div
			class="flex-grow rounded-md border border-gray-200 bg-[var(--color-neutral-light-gray)] p-3"
		>
			{#each $appStore.statusMessages as message, i (i)}
				<p class="mb-1 text-xs leading-tight text-[var(--color-text-dark)]">{message}</p>
				<hr class="h-px my-3 bg-gray-300 border-0"/>
			{/each}
		</div>
	</div>
</div>
