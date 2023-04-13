import * as fs from "../../fs";
import { isObjectOfType } from "../../schemas";
import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";
import * as attachment from "../attachment";
import * as choice from "../choice";
import * as types from "../types";

import * as schemas from "./schemas";

export const ContactTypeNames = enumeratedLiterals(["Contractor", "Employee", "Vendor"] as const);
export type ContactTypeName = EnumeratedLiteralType<typeof ContactTypeNames>;

export const ContactTypeSlugs = enumeratedLiterals(["contractor", "employee", "vendor"] as const);
export type ContactTypeSlug = EnumeratedLiteralType<typeof ContactTypeSlugs>;

export type ContractorContactType = choice.Choice<0, "Contractor", "contractor">;
export type EmployeeContactType = choice.Choice<1, "Employee", "employee">;
export type VendorContactType = choice.Choice<2, "Vendor", "vendor">;

export type ContactType = ContractorContactType | EmployeeContactType | VendorContactType;

export const ContactTypes = choice.choices([
  choice.choice(0, ContactTypeNames.CONTRACTOR, ContactTypeSlugs.CONTRACTOR),
  choice.choice(1, ContactTypeNames.EMPLOYEE, ContactTypeSlugs.EMPLOYEE),
  choice.choice(2, ContactTypeNames.VENDOR, ContactTypeSlugs.VENDOR),
] as const);

export type ContactNamesAndImage = {
  readonly image: fs.SavedImage | null;
  readonly first_name: string | null;
  readonly last_name: string | null;
};

export type Contact = types.TypedApiModel<"contact"> &
  ContactNamesAndImage & {
    readonly contact_type: ContactType | null;
    readonly full_name: string;
    readonly company: string | null;
    readonly position: string | null;
    readonly rate: number | null;
    readonly city: string | null;
    readonly notes: string | null;
    readonly email: string | null;
    readonly phone_number: string | null;
    readonly attachments: attachment.SimpleAttachment[];
  };

export const isContact = (user: unknown): user is Contact =>
  isObjectOfType(user, schemas.ContactSchema);

export const contactName = (contact: Contact): string | null =>
  contact.contact_type?.id === ContactTypes.VENDOR.id &&
  contact.company !== null &&
  contact.company.trim() !== ""
    ? contact.company
    : contact.full_name;
