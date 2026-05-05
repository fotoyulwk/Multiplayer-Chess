<script lang="ts">
	import { chessStore } from '$lib/chess/chessStore.svelte';
	import type { Chat } from '@ai-sdk/svelte';

	let { chat }: { chat: Chat } = $props();

	let input = $state('');

	function handleSend(event: SubmitEvent) {
		event.preventDefault();
		if (!input.trim() || chat.status === 'streaming') return;

		const fen = chessStore.fen;
		const hist = chessStore.history.join(',');
		chat.sendMessage({ text: input }, { body: { fen, history: hist } });
		input = '';
	}
</script>

<div
	class="flex h-full w-2xl flex-col rounded-md bg-[#ffffff17] p-3 pb-3 text-sm"
	style="max-height: 750px;"
>
	<div class="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
		<h1 class="text-sm font-semibold">Chat with AI</h1>
		<span class="text-xs text-gray-400">
			{chessStore.moveCount > 0 ? `Move ${Math.ceil(chessStore.moveCount / 2)}` : 'Game started'}
		</span>
	</div>

	<div class="mb-2 flex-1 space-y-3 overflow-y-auto">
		{#if chat.messages.length === 0}
			<div class="flex h-full items-center justify-center">
				<p class="text-center text-xs text-gray-400">
					Make your first move to start chatting with the AI!
				</p>
			</div>
		{/if}

		{#each chat.messages as message}
			<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
				<div
					class="max-w-[85%] rounded-lg px-3 py-2 {message.role === 'user'
						? 'rounded-br-sm bg-blue-600'
						: 'rounded-bl-sm bg-[#ffffff17]'}"
				>
					{#each message.parts as part}
						{#if part.type === 'text'}
							<p class="text-xs leading-relaxed whitespace-pre-wrap">{part.text}</p>
						{:else if part.type === 'tool-makeChessMove'}
							{#if part.state === 'input-streaming' || part.state === 'input-available'}
								<p class="text-xs text-yellow-400">🤔 Thinking about a move...</p>
							{:else if part.state === 'output-available'}
								{@const output = part.output as { success: boolean; san: string }}
								<p class="text-xs text-green-400">
									{output.success ? `♟ Moved ${output.san}` : '❌ Invalid move'}
								</p>
							{:else if part.state === 'output-error'}
								<p class="text-xs text-red-400">❌ {part.errorText}</p>
							{/if}
						{:else if part.type === 'tool-resign'}
							{#if part.state === 'output-available'}
								{@const output = part.output as { resigned: boolean; message: string }}
								<p class="text-xs text-orange-400">{output.message}</p>
							{/if}
						{:else if part.type === 'tool-resetGame'}
							{#if part.state === 'output-available'}
								<p class="text-xs text-blue-400">🔄 Game reset!</p>
							{/if}
						{/if}
					{/each}
				</div>
			</div>
		{/each}

		{#if chat.status === 'streaming'}
			<div class="flex justify-start">
				<div class="rounded-lg rounded-bl-sm bg-[#ffffff17] px-3 py-2">
					<p class="text-xs text-gray-400">🤖 Typing...</p>
				</div>
			</div>
		{/if}
	</div>

	<details class="border-t border-white/10 pt-2">
		<summary class="cursor-pointer text-xs text-gray-400">
			Move History ({chessStore.history.length})
		</summary>
		<ol class="mt-1 list-decimal pl-4 text-xs text-gray-500">
			{#each chessStore.history as move}
				<li>{move}</li>
			{/each}
		</ol>
	</details>

	<form onsubmit={handleSend} class="mt-2 flex gap-2 border-t border-white/10 pt-2">
		<input
			bind:value={input}
			placeholder="Type a message..."
			disabled={chat.status === 'streaming'}
			class="flex-1 rounded-md bg-white/10 px-3 py-2 text-xs text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
		/>
		<button
			type="submit"
			disabled={!input.trim() || chat.status === 'streaming'}
			class="rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
		>
			Send
		</button>
	</form>
</div>
