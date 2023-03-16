import * as contact from "../contact";

export const isUserWithImage = (
  user: Model.User | Model.SimpleUser | Model.Contact,
): user is Model.UserWithImage =>
  contact.isContact(user) ? user.image !== null : user.profile_image !== null;
