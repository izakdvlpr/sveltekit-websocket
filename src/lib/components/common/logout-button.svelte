<script lang="ts">
	import axios, { isAxiosError } from 'axios';
	import { LogOut } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	import { Button } from '$lib/components';
	import { toast } from 'svelte-sonner';

	async function handleLogout() {
		try {
			await axios.post('/api/sessions/logout');

			goto('/login');
		} catch (err) {
			toast.error(isAxiosError(err) ? err.response?.data.error : 'Houve um erro');
		}
	}
</script>

<Button class="absolute bottom-5 left-5" on:click={handleLogout}>
	<LogOut />
</Button>
