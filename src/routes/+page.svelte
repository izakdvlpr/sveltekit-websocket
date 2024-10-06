<script lang="ts">
  import axios, { isAxiosError } from 'axios'
  import { goto } from '$app/navigation';
  
  async function handleLogout() {
    try {
      await axios.post('/api/sessions/logout')
      
      goto('/login')
    } catch (error) {
      if (isAxiosError(error)) {
        return alert(error.response?.data.error)
      }
      
      alert('An error occurred')
    }
  }
</script>

<button on:click={() => goto('/rooms')}>Go to rooms</button>
<button on:click={handleLogout}>Logout</button>