<script lang="ts">
  import type { User } from '$lib/database';
	import { cn } from '$lib/utils';
  
  type UserWithStatus = User & { status: 'online' | 'offline' } 
  
  export let user: UserWithStatus;
  
  $: isOnline = user.status === 'online';
</script>

<p class={cn("text-sm", !isOnline && "text-gray-400")}>
  {user.name}
  
  <span class={cn(isOnline ? "text-green-400" : "text-gray-400")}>({user.status})</span>
</p>