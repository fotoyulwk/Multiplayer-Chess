<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Api } from 'chessground/api';
	import { onMount } from 'svelte';

	let container: HTMLDivElement;
	let chessground: Api;

	onMount(() => {
		chessground = Chessground(container);
	});
</script>

<div class="relative block" bind:this={container}></div>
