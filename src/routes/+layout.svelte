<script>
	import '@fontsource/poppins/100.css';
	import '@fontsource/poppins/300.css';
	import '@fontsource/poppins/400.css';
	import '@fontsource/poppins/500.css';
	import '@fontsource/poppins/600.css';
	import '@fontsource/poppins/700.css';

	import '../app.css';

	import { Toaster } from '$lib/components';
</script>

<Toaster position="top-center" closeButton />

<slot />
