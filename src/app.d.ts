// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Server } from 'socket.io';

declare global {
	var io: Server
	
	namespace App {
		// interface Error {}
		
		interface Locals {
			io: Server
			userId: string | null
		}
		
		// interface PageData {}
		
		// interface PageState {}
		
		// interface Platform {}
	}
}

export {};
