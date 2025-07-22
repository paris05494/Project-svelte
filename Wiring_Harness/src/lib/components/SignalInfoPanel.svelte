<script lang="ts">
	import { appStore } from '../stores/app-store';
	import { getUniqueSignalEcuConnections } from '../utils/signal-helpers';
	$: uniqueConnections = $appStore.visualizationData
		? getUniqueSignalEcuConnections($appStore.visualizationData.hypertacSlots)
		: [];
</script>

<div class="panel">
	<h2 class="mb-2 text-2xl font-bold text-[var(--color-primary-green)]">Signal Information</h2>
	<div class="mb-4">
		<p class="text-sm">
			Signals Used: <span class="font-bold text-[var(--color-primary-green)]"
				>{$appStore.visualizationData?.signalsUsedCount || 0}</span
			>
			<span
				class="ml-2 inline-block h-3 w-3 rounded-full border border-[var(--color-primary-green)] bg-[var(--color-slot-used)]"
			></span> (Status)
		</p>
		<p class="text-sm">
			Signals Not Used: <span class="font-bold text-[var(--color-text-dark)]"
				>{$appStore.visualizationData?.signalsNotUsedCount || 0}</span
			>
			<span
				class="ml-2 inline-block h-3 w-3 rounded-full border border-gray-400 bg-[var(--color-slot-empty)]"
			></span> (Status)
		</p>
		<p class="text-sm">
			Empty Hypertac Slots: <span class="font-bold text-gray-500"
				>{$appStore.visualizationData?.hypertacEmptySlotsCount || 0}</span
			>
		</p>
	</div>
	<hr class="my-2 border-gray-200" />
	<h3 class="text-md mb-2 font-semibold text-[var(--color-secondary-purple)]">Reuse Status:</h3>
	<div class="flex items-center text-sm">
		<div
			class="animate-pulse-red mr-2 h-4 w-4 rounded-full border border-[var(--color-slot-reused-text)] bg-[var(--color-slot-reused)]"
		></div>
		<span>Highlighted for signals used in multiple Hypertac slots.</span>
	</div>
	<h3 class="text-md mb-2 mt-4 font-semibold text-[var(--color-secondary-purple)]">
		Signal to ECU Connections:
	</h3>
	<div class="scrollable-content flex-grow">
		{#if $appStore.visualizationData && $appStore.visualizationData.hypertacSlots.length > 0}
			{#each uniqueConnections as connectionString (connectionString)}
				<p class="mb-1 text-xs leading-tight text-[var(--color-text-dark)]">
					{connectionString}
				</p>
			{/each}
			{#if uniqueConnections.length === 0}
				<p class="text-sm text-gray-500">No signals connected to ECUs.</p>
			{/if}
		{:else}
			<p class="text-sm text-gray-500">Upload Excel to see Signal-ECU connections.</p>
		{/if}
	</div>
</div>
