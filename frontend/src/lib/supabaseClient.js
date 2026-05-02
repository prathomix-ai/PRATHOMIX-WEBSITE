import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function createStubSupabaseClient() {
	const noop = async () => ({ data: null, error: null })
	const query = () => ({ insert: noop, select: noop, update: noop, delete: noop })

	return {
		auth: {
			getSession: async () => ({ data: { session: null } }),
			onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
			signOut: async () => ({ error: null }),
			signInWithPassword: async () => ({ data: null, error: null }),
			signUp: async () => ({ data: null, error: null }),
			resetPasswordForEmail: async () => ({ data: null, error: null }),
			updateUser: async () => ({ data: null, error: null }),
		},
		from: () => query(),
		rpc: async () => ({ data: null, error: null }),
		storage: { from: () => ({}) },
	}
}

export const supabase = supabaseUrl
	? createClient(supabaseUrl, supabaseKey)
	: createStubSupabaseClient()
