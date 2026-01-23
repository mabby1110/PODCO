import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
let profileState = $state<Profile | null>(null);

export const profile = {
	get value() {
		return profileState;
	},
	set(newProfile: Profile | null) {
		profileState = newProfile;
	}
};
