import * as models from "../models";

export enum ContactTypeNames {
  CONTRACTOR = "Contractor",
  EMPLOYEE = "Employee",
  VENDOR = "Vendor"
}

export const ContactTypes = models.Choices([
  new models.Choice(0, ContactTypeNames.CONTRACTOR),
  new models.Choice(1, ContactTypeNames.EMPLOYEE),
  new models.Choice(2, ContactTypeNames.VENDOR)
]);

export const contactName = (contact: Model.Contact): string | null =>
  contact.contact_type?.id === ContactTypes.Vendor.id ? contact.company : contact.full_name;
