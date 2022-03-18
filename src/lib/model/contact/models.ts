import { isNil } from "lodash";

import * as choice from "../choice";

export enum ContactTypeNames {
  CONTRACTOR = "Contractor",
  EMPLOYEE = "Employee",
  VENDOR = "Vendor"
}

export const ContactTypes = choice.Choices([
  choice.Choice(0, ContactTypeNames.CONTRACTOR),
  choice.Choice(1, ContactTypeNames.EMPLOYEE),
  choice.Choice(2, ContactTypeNames.VENDOR)
]);

export const contactName = (contact: Model.Contact): string | null =>
  contact.contact_type?.id === ContactTypes.Vendor.id && !isNil(contact.company) && contact.company.trim() !== ""
    ? contact.company
    : contact.full_name;
