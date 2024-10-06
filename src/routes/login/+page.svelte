<script lang="ts">
  import axios, { isAxiosError } from 'axios';
  import { goto } from '$app/navigation';
	
	let formData = { email: '', password: '' };
  
  async function handleLogin() {
    try {
      const { email, password } = formData;
      
      await axios.post('/api/sessions/login', {
        email,
        password
      });
      
      goto('/');
    } catch (err) {
      if (isAxiosError(err)) {
        return alert(err.response?.data.error);
      }
      
      alert('An error occurred');
    }
  }
</script>

<form autocomplete="off" on:submit|preventDefault={handleLogin}>  
	<label for="email">Email</label>
  <input 
    name="email"
    type="email"
    autocomplete="off"
    bind:value={formData.email}
    required
  />
  
	<label for="password">Password</label>
  <input
    name="password"
    type="password"
    autocomplete="off"
    bind:value={formData.password}
    required
  />
  
	<button type="submit">Sign in</button>
</form>

<hr>

<a href="/register">Register</a>