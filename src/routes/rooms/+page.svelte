<script lang="ts">
	import axios, { isAxiosError } from 'axios';
	import { onMount } from 'svelte';
	import { Hash } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import type { Room } from '$lib/database';
	import { Card, Input, Button, ScrollArea, LogoutButton } from '$lib/components';

	let rooms: Room[] = [];
	let roomName = '';

	async function handleGetAllRooms() {
		const response = await axios.get<{ rooms: Room[] }>('/api/rooms');

		rooms = response.data.rooms;
	}

	async function handleCreateRoom() {
		try {
			await axios.post('/api/rooms', { name: roomName });

			roomName = '';

			await handleGetAllRooms();

			toast.success('Sala criada com sucesso');
		} catch (err) {
			toast.error(isAxiosError(err) ? err.response?.data.error : 'Houve um erro');
		}
	}

	onMount(() => {
		handleGetAllRooms();
	});
</script>

<main class="relative flex h-screen w-full items-center justify-center">
	<LogoutButton />

	<Card.Root class="w-[450px]">
		<Card.Header>
			<form
				class="flex items-center gap-4"
				autocomplete="off"
				on:submit|preventDefault={handleCreateRoom}
			>
				<Input
					type="text"
					name="roomName"
					placeholder="Nome da sala"
					bind:value={roomName}
					required
				/>

				<Button type="submit">Criar sala</Button>
			</form>
		</Card.Header>

		<Card.Content class="space-y-6">
			{#if rooms.length > 0}
				<ScrollArea class="h-[200px]">
					<div class="flex flex-col gap-2">
						{#each rooms as room (room.id)}
							<a
								href={`/rooms/${room.id}`}
								class="flex items-center gap-2 text-gray-400 transition-all hover:text-blue-500"
							>
								<Hash />
								{room.name}
							</a>
						{/each}
					</div>
				</ScrollArea>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
