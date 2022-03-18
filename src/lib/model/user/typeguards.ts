import * as contact from "../contact";

export const isUserWithImage = (user: Model.User | Model.SimpleUser | Model.Contact): user is Model.UserWithImage =>
  contact.isContact(user)
    ? (user as Model.Contact).image !== null
    : (user as Model.User | Model.SimpleUser).profile_image !== null;
