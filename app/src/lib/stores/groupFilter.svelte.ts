// src/lib/stores/selectedGroupStore.svelte.ts
import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getInitialValue(key: string): string {
	if (!browser) return '';
	return getCookie(key) || '';
}

function saveToCookie(key: string, value: string) {
	if (!browser) return;
	setCookie(key, value, { maxAge: COOKIE_MAX_AGE });
}

export const selectedGroupStore = $state({
	selectedGroup: getInitialValue('selectedGroup'),
	selectedAgent: getInitialValue('selectedAgent'),

	setGroup(group: string) {
		this.selectedGroup = group;
	},

	setAgent(agentId: string) {
		this.selectedAgent = agentId;
	},

	clearGroup() {
		this.selectedGroup = '';
	},
    
	clearAll() {
		this.selectedGroup = '';
		this.selectedAgent = '';
	}
});

// Persistencia reactiva
$effect.root(() => {
	$effect(() => {
		saveToCookie('selectedGroup', selectedGroupStore.selectedGroup);
	});
	$effect(() => {
		saveToCookie('selectedAgent', selectedGroupStore.selectedAgent);
	});
});
