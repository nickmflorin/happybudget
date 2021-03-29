export const userToSimpleUser = (user: IUser): ISimpleUser => {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: user.full_name,
    email: user.email,
    profile_image: user.profile_image
  };
};
