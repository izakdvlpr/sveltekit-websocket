<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Actions, PageData } from './$types';
  
  import { LogoutButton } from '$lib/components';
  
  export let data: PageData
  export let form: Actions
</script>

<form method="POST" action="?/createRoom" use:enhance>
  {#if form?.error}
    <p style="color: red">{form.error}</p>
  {/if}
  
  <input name="name" type="text" placeholder="Room name" required>
  
  <button type="submit">Create room</button>
</form>

{#if data.rooms.length > 0}
  <ul>
    {#each data.rooms as room (room.id)}
      <li>
        <a href="/rooms/{room.id}">{room.name}</a>
      </li>
    {/each}
  </ul>
{/if}

<LogoutButton />