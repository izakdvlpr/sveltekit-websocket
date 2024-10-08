<script lang="ts">
	import axios, { isAxiosError } from 'axios';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	import { Button, Card, Input, Label } from '$lib/components';

	let formData = { name: '', email: '', password: '' };

	async function handleRegister() {
		try {
			const { name, email, password } = formData;

			await axios.post('/api/users', {
				name,
				email,
				password
			});

			await axios.post('/api/sessions/login', {
				email,
				password
			});

			goto('/');

			toast.success('Conta criada com sucesso');
		} catch (err) {
			toast.error(isAxiosError(err) ? err.response?.data.error : 'Houve um erro');
		}
	}
</script>

<main class="flex h-screen w-full items-center justify-center">
	<div class="flex flex-col items-center gap-4">
		<div class="space-y-1">
			<h1 class="text-center text-2xl font-semibold">Registrar</h1>
			<p class="text-sm text-gray-400">Cadastre-se para acessar as salas.</p>
		</div>

		<Card.Root class="w-[350px]">
			<Card.Content>
				<form class="space-y-4" autocomplete="off" on:submit|preventDefault={handleRegister}>
					<div class="flex flex-col space-y-2">
						<Label for="name">Nome</Label>

						<Input
							name="name"
							type="name"
							placeholder="Nome"
							autocomplete="off"
							bind:value={formData.name}
							required
						/>
					</div>

					<div class="flex flex-col space-y-2">
						<Label for="email">Email</Label>

						<Input
							name="email"
							type="email"
							placeholder="Email"
							autocomplete="off"
							bind:value={formData.email}
							required
						/>
					</div>

					<div class="flex flex-col space-y-2">
						<Label for="password">Password</Label>

						<Input
							name="password"
							type="password"
							placeholder="Senha"
							autocomplete="off"
							bind:value={formData.password}
							required
						/>
					</div>

					<Button type="submit" class="w-full">Registrar-se</Button>
				</form>
			</Card.Content>
		</Card.Root>

		<p class="text-center text-sm text-gray-500">
			Já tem uma conta? <a href="/login" class="text-blue-500">Entrar</a>
		</p>
	</div>
</main>
