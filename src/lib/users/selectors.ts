export const selectUser = (s: Application.Store) => s.user;

export const selectLoggedInUser = (s: Application.Store) => {
  if (s.user === null) {
    throw new Error("Authenticated user is not present.");
  }
  return s.user;
};
