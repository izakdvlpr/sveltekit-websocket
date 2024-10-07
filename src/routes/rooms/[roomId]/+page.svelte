<script lang="ts">
  import axios, { isAxiosError } from 'axios'
  import { onDestroy, onMount, tick } from 'svelte';
  import io, { type Socket } from 'socket.io-client';
  import { page } from '$app/stores'
  import { goto } from '$app/navigation';
  import { PUBLIC_SOCKET_PORT } from '$env/static/public'
  import type { PageData } from './$types';
  
  import type { Room, Message, User } from '$lib/database';
  import { UserCard } from '$lib/components';
  
  type MessageWithUser = Message & { user: User }
  
  type UserWithStatus = User & { status: 'online' | 'offline' } 
  
  export let data: PageData
  
  let socket: Socket | null = null;
  let messageList: HTMLUListElement | null = null;
  
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
    const response = await axios.get<{ messages: MessageWithUser[] }>(`/api/rooms/${roomId}/messages`);
    
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
      if (isAxiosError(err)) {
        return alert(err.response?.data.error);
      }
      
      alert('An error occurred');
    }
  }
  
  async function handleConnectToWebSocket(userId: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const domain = window.location.hostname;
    const port = PUBLIC_SOCKET_PORT;
    
    socket = io(`${protocol}//${domain}:${port}`, {
      path: '/',
      query: {
        roomId,
        userId
      }
    });
    
    socket.on('connect', async () => {
      await handleGetAllMessagesFromRoom();
      await handleGetAllUsersFromRoom();
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
  })

  onDestroy(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });
</script>

{#if room}
  <button on:click={() => goto('/rooms')}>Back to rooms</button>

  <h1>{room.name}</h1>
  
  <div style="max-width: 800px; display: flex;">
    {#if messages.length > 0}
      <ul bind:this={messageList} style="max-height: 200px; width: 100%; overflow-y: scroll">
        {#each messages as message (message.id)}
          <li>
            <strong>[{message.user ? message.user.name : 'System'}]</strong> {message.content}
          </li>
        {/each}
      </ul>
    {/if}
    
    {#if users.length > 0}
      <ul style="max-height: 200px; width: 100%; overflow-y: scroll">
        {#each users as user (user.id)}
          <UserCard {user} />
        {/each}
      </ul>
    {/if}
  </div>
  
  <form on:submit|preventDefault={handleSendMessageToRoom}>
    <input
      name="messageContent"
      type="text"
      placeholder="Message"
      bind:value={messageContent}
      required
    >
    
    <button type="submit">Send</button>
  </form>
{/if}