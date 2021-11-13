export enum ContactTypeNames {
  CONTRACTOR = "Contractor",
  EMPLOYEE = "Employee",
  VENDOR = "Vendor"
}

export const ContactTypeModels: { [key: string]: Model.ContactType } = {
  CONTRACTOR: { id: 0, name: ContactTypeNames.CONTRACTOR },
  EMPLOYEE: { id: 1, name: ContactTypeNames.EMPLOYEE },
  VENDOR: { id: 2, name: ContactTypeNames.VENDOR }
};

export const ContactTypes = Object.values(ContactTypeModels);

export const contactName = (contact: Model.Contact): string | null =>
  contact.contact_type?.id === ContactTypeModels.VENDOR.id ? contact.company : contact.full_name;
