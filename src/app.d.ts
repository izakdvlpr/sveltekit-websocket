// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Server } from 'socket.io';

declare global {
	var io: Server;
	var clients: Map<string, string>;

	namespace App {
		// interface Error {}

		interface Locals {
			io: Server;
			clients: Map<string, string>;
			userId: string | null;
		}

		// interface PageData {}

		// interface PageState {}

		// interface Platform {}
	}
}

export {};
