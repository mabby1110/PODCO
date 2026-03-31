// src/lib/stores/selectedGroupStore.svelte.ts
import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getInitialGroup(): string {
    if (!browser) return '';
    return getCookie('selectedGroup') || '';
}

function saveGroupToCookie(group: string) {
    if (!browser) return;
    setCookie('selectedGroup', group, { maxAge: COOKIE_MAX_AGE });
}

export const selectedGroupStore = $state({
    selectedGroup: getInitialGroup(),
    
    setGroup(group: string) {
        this.selectedGroup = group;
    },

    clearGroup() {
        this.selectedGroup = '';
    }
});

$effect.root(() => {
    $effect(() => saveGroupToCookie(selectedGroupStore.selectedGroup));
});