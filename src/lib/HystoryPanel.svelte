<script lang="ts">
	import { history, chess } from '$lib/chess/chessStore';
	import { onMount } from 'svelte';

	let list: HTMLOListElement = $state(null!);

	function groupedMoves(moves: string[]) {
		const pairs: { num: number; white: string; black: string | null }[] = [];
		for (let i = 0; i < moves.length; i += 2) {
			pairs.push({
				num: Math.floor(i / 2) + 1,
				white: moves[i],
				black: moves[i + 1] ?? null
			});
		}
		return pairs;
	}

	$effect(() => {
		const moves = $history;
		if (moves && list) {
			requestAnimationFrame(() => {
				list.scrollTop = list.scrollHeight;
			});
		}
	});
</script>

<div class="flex w-full flex-col gap-2 rounded-md bg-[#ffffff17] p-3 text-sm sm:max-w-md lg:h-[calc(min(100vh-4rem,630px))] lg:w-64">
	<div class="flex items-center justify-between">
		<h2 class="text-xs font-semibold text-white/60 uppercase tracking-wider">Moves</h2>
		<span class="rounded-full px-2 py-0.5 text-xs {chess.turn() === 'w' ? 'bg-white/20 text-white' : 'bg-black/30 text-white/80'}">
			{chess.turn() === 'w' ? 'White' : 'Black'} to move
		</span>
	</div>
	{#if $history.length === 0}
		<div class="flex flex-1 items-center justify-center text-xs text-white/30">No moves yet</div>
	{:else}
		<ol bind:this={list} class="flex-1 space-y-0.5 overflow-y-auto pr-1">
			{#each groupedMoves($history) as pair}
				<li class="flex items-center gap-1 rounded px-1.5 py-0.5">
					<span class="w-5 text-white/40 tabular-nums">{pair.num}.</span>
					<span class="flex-1 text-white/90">{pair.white}</span>
					{#if pair.black}
						<span class="flex-1 text-white/70">{pair.black}</span>
					{:else}
						<span class="flex-1"></span>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</div>
