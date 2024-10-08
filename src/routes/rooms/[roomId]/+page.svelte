<script lang="ts">
	import axios, { isAxiosError } from 'axios';
	import { onDestroy, onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import io, { type Socket } from 'socket.io-client';
	import { page } from '$app/stores';
	import { PUBLIC_SOCKET_PORT } from '$env/static/public';
	import type { PageData } from './$types';
	import { ChevronLeft } from 'lucide-svelte';

	import type { Room, Message, User } from '$lib/database';
	import {
		Card,
		Input,
		Button,
		ScrollArea,
		Separator,
		LogoutButton,
		RoomMessageRow,
		RoomUserRow
	} from '$lib/components';
	import { goto } from '$app/navigation';

	type MessageWithUser = Message & { user: User };

	type UserWithStatus = User & { status: 'online' | 'offline' };

	export let data: PageData;

	let socket: Socket | null = null;
	let messageList: any = null;

	let room: Room | null = null;
	let messages: MessageWithUser[] = [];
	let users: UserWithStatus[] = [];
	let messageContent = '';

	$: roomId = $page.params.roomId;
	$: userId = data?.userId;

	async function handleScrollToBottom() {
		await tick();

		if (messageList) {
			messageList.scrollTop = messageList.scrollHeight;
		}
	}

	async function handleGetRoom() {
		const response = await axios.get<{ room: Room }>(`/api/rooms/${roomId}`);

		room = response.data.room;
	}

	async function handleGetAllMessagesFromRoom() {
		const response = await axios.get<{ messages: MessageWithUser[] }>(
			`/api/rooms/${roomId}/messages`
		);

		messages = response.data.messages;

		handleScrollToBottom();
	}

	async function handleGetAllUsersFromRoom() {
		const response = await axios.get<{ users: UserWithStatus[] }>(`/api/rooms/${roomId}/users`);

		users = response.data.users;
	}

	async function handleSendMessageToRoom() {
		try {
			await axios.post(`/api/rooms/${roomId}/messages`, {
				content: messageContent,
				roomId,
				userId
			});

			messageContent = '';
		} catch (err) {
			toast.error(isAxiosError(err) ? err.response?.data.error : 'Houve um erro');
		}
	}

	async function handleConnectToWebSocket(userId: string) {
		const isSecureProtocol = location.protocol === 'https:';

		const websocketUrl = isSecureProtocol
			? 'https://ws.izak.tech'
			: `http://${window.location.hostname}:${PUBLIC_SOCKET_PORT}`;

		socket = io(websocketUrl, {
			path: '/',
			query: {
				roomId,
				userId
			}
		});

		socket.on('connect', async () => {
			await handleGetAllUsersFromRoom();
			await handleGetAllMessagesFromRoom();
		});

		socket.on('message', async (message: MessageWithUser) => {
			messages = [...messages, message];

			if (!message.user) {
				await handleGetAllUsersFromRoom();
			}

			handleScrollToBottom();
		});
	}

	onMount(async () => {
		if (roomId) {
			await handleGetRoom();

			if (userId) {
				handleConnectToWebSocket(userId);
			}
		}
	});

	onDestroy(() => {
		if (socket && socket.connected) {
			socket.disconnect();
		}
	});
</script>

{#if room}
	<main class="relative flex h-screen w-full items-center justify-center">
		<Button class="absolute left-5 top-5" on:click={() => goto('/')}>
			<ChevronLeft />
		</Button>

		<LogoutButton />

		<div class="flex space-x-6">
			<Card.Root class="w-[700px]">
				<Card.Header>
					<Card.Title>{room.name}</Card.Title>
					<Card.Description>Respeite as regras da sala!</Card.Description>
				</Card.Header>

				<Card.Content class="space-y-6">
					<div bind:this={messageList} class="flex h-[400px] flex-col gap-2 overflow-y-scroll">
						{#each messages as message (message.id)}
							<RoomMessageRow {message} isYourself={message.user?.id === userId} />
						{/each}
					</div>
				</Card.Content>

				<Card.Footer>
					<form
						class="flex w-full items-center gap-4"
						autocomplete="off"
						on:submit|preventDefault={handleSendMessageToRoom}
					>
						<Input
							name="messageContent"
							type="text"
							placeholder="Mensagem"
							bind:value={messageContent}
							required
						/>

						<Button type="submit">Enviar</Button>
					</form>
				</Card.Footer>
			</Card.Root>

			<Card.Root class="w-[250px]">
				<Card.Content class="space-y-2">
					<h1 class="text-md font-semibold text-gray-300">Usuários</h1>

					<Separator />

					<ScrollArea class="h-[400px]">
						<div class="flex flex-col gap-2">
							{#each users as user (user.id)}
								<RoomUserRow {user} />
							{/each}
						</div>
					</ScrollArea>
				</Card.Content>
			</Card.Root>
		</div>
	</main>
{/if}
