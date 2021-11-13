export const isContact = (user: Model.User | Model.SimpleUser | Model.Contact): user is Model.Contact =>
  (user as Model.Contact).image !== undefined;
