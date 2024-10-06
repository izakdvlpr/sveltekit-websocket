<script lang="ts">
  import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	
	export let form: ActionData;
</script>

<form method="POST" autocomplete="off" use:enhance>
  {#if form?.error}
    <p style="color: red">{form.error}</p>
  {/if}
  
	<label for="email">Email</label>
  <input name="email" type="email" autocomplete="off" required>
  
	<label for="password">Password</label>
  <input name="password" type="password" autocomplete="off" required>
  
	<button type="submit">Sign in</button>
</form>