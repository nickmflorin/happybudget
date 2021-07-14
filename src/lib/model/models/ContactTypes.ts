/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
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

const ContactTypes = Object.values(ContactTypeModels);
export default ContactTypes;
