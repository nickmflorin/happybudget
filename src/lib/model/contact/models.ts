import { isNil } from "lodash";

import * as choice from "../choice";

export enum ContactTypeNames {
  CONTRACTOR = "Contractor",
  EMPLOYEE = "Employee",
  VENDOR = "Vendor"
}

export enum ContactTypeSlugs {
  CONTRACTOR = "contractor",
  EMPLOYEE = "employee",
  VENDOR = "vendor"
}

export const ContactTypes = choice.Choices([
  choice.Choice(0, ContactTypeNames.CONTRACTOR, ContactTypeSlugs.CONTRACTOR),
  choice.Choice(1, ContactTypeNames.EMPLOYEE, ContactTypeSlugs.EMPLOYEE),
  choice.Choice(2, ContactTypeNames.VENDOR, ContactTypeSlugs.VENDOR)
]);

export const contactName = (contact: Model.Contact): string | null =>
  contact.contact_type?.id === ContactTypes.vendor.id && !isNil(contact.company) && contact.company.trim() !== ""
    ? contact.company
    : contact.full_name;
