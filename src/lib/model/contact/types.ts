import * as fs from "../../fs";
import * as attachment from "../attachment";
import * as choice from "../choice";
import * as types from "../types";
import * as user from "../user";

export type ContactType =
  | choice.IChoice<0, "Contractor", "contractor">
  | choice.IChoice<1, "Employee", "employee">
  | choice.IChoice<2, "Vendor", "vendor">;

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
