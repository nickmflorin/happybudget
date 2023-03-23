import * as fs from "../../fs";
import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";
import * as attachment from "../attachment";
import * as choice from "../choice";
import * as types from "../types";
import * as user from "../user";

export const ContactTypeNames = enumeratedLiterals(["Contractor", "Employee", "Vendor"] as const);
export type ContactTypeName = EnumeratedLiteralType<typeof ContactTypeNames>;

export const ContactTypeSlugs = enumeratedLiterals(["contractor", "employee", "vendor"] as const);
export type ContactTypeSlug = EnumeratedLiteralType<typeof ContactTypeSlugs>;

export type ContactType =
  | choice.IChoice<0, "Contractor", "contractor">
  | choice.IChoice<1, "Employee", "employee">
  | choice.IChoice<2, "Vendor", "vendor">;

export const ContactTypes = choice.Choices([
  choice.Choice(0, ContactTypeNames.CONTRACTOR, ContactTypeSlugs.CONTRACTOR),
  choice.Choice(1, ContactTypeNames.EMPLOYEE, ContactTypeSlugs.EMPLOYEE),
  choice.Choice(2, ContactTypeNames.VENDOR, ContactTypeSlugs.VENDOR),
]);

export type ContactNamesAndImage = {
  readonly image: fs.SavedImage | null;
  readonly first_name: string | null;
  readonly last_name: string | null;
};

export type Contact = types.TypedApiModel<
  "contact",
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
  }
>;

export const isContact = (user: user.User | user.SimpleUser | Contact): user is Contact =>
  (user as Contact).image !== undefined;

export const contactName = (contact: Contact): string | null =>
  contact.contact_type?.id === ContactTypes.vendor.id &&
  contact.company !== null &&
  contact.company.trim() !== ""
    ? contact.company
    : contact.full_name;
