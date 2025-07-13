<script lang="ts">
  import { appStore } from '../stores/app-store';
</script>

<div class="panel">
  <h2 class="text-lg font-semibold mb-2 text-[var(--color-primary-green)]">Status</h2>
  <div class="scrollable-content flex-grow bg-[var(--color-neutral-light-gray)] p-2 rounded-md border border-gray-200">
    {#each $appStore.statusMessages as message, i (i)}
      <p class="text-xs text-[var(--color-text-dark)] leading-tight mb-1">{message}</p>
    {/each}
  </div>
</div>
