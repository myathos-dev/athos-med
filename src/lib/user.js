// Stand-in for the Softr "@/lib/user" module the blocks were written against.
// The user comes from the server's /api/me (set from .env for local development).

let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user
    ? {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName ?? (user.fullName || "").split(" ")[0],
        email: user.email,
      }
    : null;
}

export function useCurrentUser() {
  return currentUser;
}
