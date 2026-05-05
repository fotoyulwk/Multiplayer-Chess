<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import ChessBoard from '$lib/ChessBoard.svelte';
	import HystoryPanel from '$lib/HystoryPanel.svelte';

	const chat = new Chat({
		onError: () => {
			chat.clearError();
		}
	});
</script>

<main
	class="flex h-screen w-screen items-center justify-center gap-4 bg-radial-[at_15%_15%] from-[#0b3636] via-[#082727] to-[#072323] to-90% p-32"
>
	<div class="inline-block rounded-md bg-[#ffffff17] p-3 pb-8">
		<ChessBoard {chat} />
	</div>
	<HystoryPanel {chat} />
</main>
