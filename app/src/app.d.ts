import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			profile: Profile | null;
		}

		interface PageData {
			session?: Session | null;
		}

	}
}
declare module 'svelte/elements' {
	export interface SvelteWindowAttributes {
		onmodalOpSuccess?: (e: CustomEvent<{ id_op: string }>) => void;
	}
}
export {};
