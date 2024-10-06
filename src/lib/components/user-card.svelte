<script lang="ts">
  import type { User } from '$lib/database';
  
  type UserWithStatus = User & { status: 'online' | 'offline' } 
  
  export let user: UserWithStatus;
  
  $: isOnline = user.status === 'online';
</script>

<li style="color: {isOnline ? 'green' : 'red'}">
  <strong>{user.name}</strong> ({user.status})
</li>