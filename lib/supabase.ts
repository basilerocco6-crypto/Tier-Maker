import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client (uses anon key)
// During build, env vars may be undefined - provide fallbacks
export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
);

// Server-side admin client (uses service role key - keep secret!)
// During build, env vars may be undefined - provide fallbacks
export const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
	process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key",
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	},
);

