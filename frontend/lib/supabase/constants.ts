/**
 * Plain constants — NO "use client" or "use server" directive here.
 * Both browser and server code can import these safely.
 *
 * The auth cookie name is pinned to a stable value (instead of the default
 * URL-hostname-derived name) so the browser and the server agree on it even
 * when they reach Supabase via different hostnames (e.g. localhost vs
 * host.docker.internal inside a container).
 */
export const AUTH_COOKIE_NAME = "sb-garima-auth-token";
