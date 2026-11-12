// The cookie is scoped to /admin, so the browser never sends it to the public pages.
export const ADMIN_COOKIE = "lwn_admin";
export const ADMIN_COOKIE_PATH = "/admin";

// A real bcrypt hash (cost 12) of a throwaway string. Unknown usernames are compared against it so
// they take as long to reject as real ones, which stops the response time revealing who exists.
export const DECOY_HASH = "$2b$12$uLqd3XulLoQZKE62EyJgOeo2uPYjGNypgqrbB9.Wn0bPG2uGBSkLO";
