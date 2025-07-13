<script>
	import '../app.css';
	import { Button, Navbar, NavLi, NavUl, NavBrand } from 'flowbite-svelte';
</script>

<div class="flex min-h-screen flex-col">
	<Navbar class="w-full border-b border-gray-200 bg-[var(--color-neutral-white)]">
		<NavBrand href="/">
			<img src="/hypertac-logo.svg" class="mr-3 h-6 sm:h-9" alt="Hypertac Logo" />
			<span
				class="self-center text-xl font-semibold whitespace-nowrap text-[var(--color-primary-green)]"
				>Hypertac Visualizer</span
			>
		</NavBrand>
		<NavUl>
			<NavLi href="/" active={true} class="text-[var(--color-primary-green)] hover:text-emerald-700"
				>Home</NavLi
			>
		</NavUl>
	</Navbar>

	<main class="flex-grow">
		<slot />
	</main>

	<footer
		class="border-t border-gray-200 bg-[var(--color-neutral-white)] p-4 text-center text-sm text-gray-600"
	>
		© {new Date().getFullYear()} Hypertac Visualizer. All rights reserved. Developed by Senior Engineer.
	</footer>
</div>
