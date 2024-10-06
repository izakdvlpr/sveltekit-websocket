<script lang="ts">
  import axios, { isAxiosError } from 'axios'
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  import type { Room } from '$lib/database'
  
  let rooms: Room[] = []
  let roomName = ''
  
  async function handleGetAllRooms() {
    const response = await axios.get<{ rooms: Room[] }>('/api/rooms')
    
    rooms = response.data.rooms
  }
  
  async function handleCreateRoom() {
    try {
      await axios.post('/api/rooms', { name: roomName })
      
      roomName = ''
      
      await handleGetAllRooms()
    } catch (err) {
      if (isAxiosError(err)) {
        return alert(err.response?.data.error)
      }
      
      alert('An error occurred')
    }
  }
  
  onMount(() => {
    handleGetAllRooms()
  })
</script>

<button on:click={() => goto('/')}>Back to home</button>

<form autocomplete="off" on:submit|preventDefault={handleCreateRoom}>
  <input
    type="text"
    name="roomName"
    bind:value={roomName}
    required
  />
  
  <button type="submit">Create room</button>
</form>

{#if rooms.length > 0}
  <ul>
    {#each rooms as room (room.id)}
      <li>
        <a href="/rooms/{room.id}">{room.name}</a>
      </li>
    {/each}
  </ul>
{/if}