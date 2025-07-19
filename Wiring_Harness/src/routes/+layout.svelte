<script>
	import '../app.css';
	import { Button, Navbar, NavLi, NavUl, NavBrand } from 'flowbite-svelte';
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex-grow">
		<slot />
	</main>
</div>
