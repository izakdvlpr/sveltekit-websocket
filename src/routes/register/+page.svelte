<script lang="ts">
  import axios, { isAxiosError } from 'axios';
  import { goto } from '$app/navigation';
	
	let formData = { name: '', email: '', password: '' };
  
  async function handleRegister() {
    try {
      const { name, email, password } = formData
      
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
    } catch (err) {
      if (isAxiosError(err)) {
        return alert(err.response?.data.error);
      }
      
      alert('An error occurred');
    }
  }
</script>

<form autocomplete="off" on:submit|preventDefault={handleRegister}>
  <label for="name">Name</label>
  <input 
    name="name"
    type="name"
    autocomplete="off"
    bind:value={formData.name}
    required
  />
    
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

<a href="/login">Login</a>