<script lang="ts">
  import axios, { isAxiosError } from 'axios';
  import { goto } from '$app/navigation';
  import { toast } from "svelte-sonner";

  import { Button, Card, Input, Label } from "$lib/components";
	
	let formData = { email: '', password: '' };
  
  async function handleLogin() {
    try {
      const { email, password } = formData;
      
      await axios.post('/api/sessions/login', {
        email,
        password
      });
      
      goto('/rooms');
      
      toast.success('Login efetuado com sucesso');
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data.error : 'Houve um erro');
    }
  }
</script>

<main class="w-full h-screen flex items-center justify-center">
  <div class="flex flex-col items-center gap-4">
    <div class="space-y-1">
      <h1 class="text-2xl text-center font-semibold">Entrar</h1>
      <p class="text-sm text-gray-400">Entre para acessar as salas.</p>
    </div>
    
    <Card.Root class="w-[350px]">
      <Card.Content>
        <form 
          class="space-y-4"
          autocomplete="off"
          on:submit|preventDefault={handleLogin}
        > 
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
          
          <Button type="submit" class="w-full">Entrar</Button>
        </form>
      </Card.Content>
    </Card.Root>
    
    <p class="text-sm text-gray-400">
      Não tem uma conta? <a href="/register" class="text-blue-500">Registrar</a>
    </p>
  </div>
</main>