<script lang="ts">
	import type { Message, User } from '$lib/database';
	import { cn } from '$lib/utils';

	type MessageWithUser = Message & { user: User };

	export let message: MessageWithUser;
	export let isYourself: boolean;

	$: isSystem = !message.user;
</script>

<p class={cn('text-gray-400', isSystem && 'text-blue-500', isYourself && 'text-white')}>
	<span>[{new Date(message.createdAt).toLocaleString()}]</span>

	<span class="font-medium">[{isSystem ? 'System' : message.user.name}]</span>

	{message.content}
</p>
