import { contacts } from "lib";

export const isUserWithImage = (user: Model.User | Model.SimpleUser | Model.Contact): user is Model.UserWithImage =>
  contacts.typeguards.isContact(user)
    ? (user as Model.Contact).image !== null
    : (user as Model.User | Model.SimpleUser).profile_image !== null;
