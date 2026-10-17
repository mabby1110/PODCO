// $lib/stores/StoreHotkeys.svelte.ts

export interface HotkeyCommand {
	id: string;
	key: string;
	label: string;
	action: () => void;
}

export class HotkeysStore {
	#commands = $state<HotkeyCommand[]>([]);
	#active = $state(false);
	#escapeHandlers = new Map<string, () => void>();

	registerEscape(id: string, action: () => void): () => void {
		this.#escapeHandlers.set(id, action);

		return () => {
			this.#escapeHandlers.delete(id);
		};
	}

	escape() {
		const handlers = [...this.#escapeHandlers.values()];
		handlers.at(-1)?.();
	}
	
	get commands(): HotkeyCommand[] {
		return this.#commands;
	}

	register(command: HotkeyCommand): () => void {
		this.unregister(command.id);
		this.#commands.push({
			...command,
			key: command.key.toLowerCase()
		});

		return () => this.unregister(command.id);
	}

	unregister(id: string) {
		this.#commands = this.#commands.filter((command) => command.id !== id);
	}

	get(key: string): HotkeyCommand | undefined {
		return this.#commands.find((command) => command.key === key.toLowerCase());
	}

	execute(key: string): boolean {
		const command = this.get(key);
		if (!command) return false;

		command.action();
		return true;
	}

	get active() {
		return this.#active;
	}

	setActive(value: boolean) {
		this.#active = value;
	}
}

export const StoreHotkeys = new HotkeysStore();
