/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum ContactRoleNames {
  PRODUCER = "Producer",
  EXECUTIVE_PRODUCER = "Executive Producer",
  PRODUCTION_MANAGER = "Production Manager",
  PRODUCTION_DESIGNER = "Production Designer",
  ACTOR = "Actor",
  DIRECTOR = "Director",
  MEDIC = "Medic",
  WARDROBE = "Wardrobe",
  WRITER = "Writer",
  CLIENT = "Client",
  OTHER = "Other"
}

export const ContactRoleModels: { [key: string]: Model.ContactRole } = {
  PRODUCER: { id: 0, name: ContactRoleNames.PRODUCER },
  EXECUTIVE_PRODUCER: { id: 1, name: ContactRoleNames.EXECUTIVE_PRODUCER },
  PRODUCTION_MANAGER: { id: 2, name: ContactRoleNames.PRODUCTION_MANAGER },
  PRODUCTION_DESIGNER: { id: 3, name: ContactRoleNames.PRODUCTION_DESIGNER },
  ACTOR: { id: 4, name: ContactRoleNames.ACTOR },
  DIRECTOR: { id: 5, name: ContactRoleNames.DIRECTOR },
  MEDIC: { id: 6, name: ContactRoleNames.MEDIC },
  WARDROBE: { id: 7, name: ContactRoleNames.WARDROBE },
  WRITER: { id: 8, name: ContactRoleNames.WRITER },
  CLIENT: { id: 9, name: ContactRoleNames.CLIENT },
  OTHER: { id: 10, name: ContactRoleNames.OTHER }
};

export const ContactRoles = Object.values(ContactRoleModels);

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum SubAccountUnitNames {
  MINUTES = "Minutes",
  HOURS = "Hours",
  WEEKS = "Weeks",
  MONTHS = "Months",
  DAYS = "Days",
  NIGHTS = "Nights",
  ALLOW = "Allow",
  FLAT = "Flat",
  FEET = "Feet",
  FARE = "Fare",
  UNITS = "Units"
}

export const SubAccountUnitModels: { [key: string]: Model.SubAccountUnit } = {
  MINUTES: { id: 0, name: SubAccountUnitNames.MINUTES },
  HOURS: { id: 1, name: SubAccountUnitNames.HOURS },
  DAYS: { id: 2, name: SubAccountUnitNames.DAYS },
  NIGHTS: { id: 3, name: SubAccountUnitNames.NIGHTS },
  WEEKS: { id: 4, name: SubAccountUnitNames.WEEKS },
  MONTHS: { id: 5, name: SubAccountUnitNames.MONTHS },
  ALLOW: { id: 6, name: SubAccountUnitNames.ALLOW },
  FLAT: { id: 7, name: SubAccountUnitNames.FLAT },
  FEET: { id: 8, name: SubAccountUnitNames.FEET },
  FARE: { id: 9, name: SubAccountUnitNames.FARE },
  UNITS: { id: 10, name: SubAccountUnitNames.UNITS }
};

export const SubAccountUnits = Object.values(SubAccountUnitModels);

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum FringeUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export const FringeUnitModels: { [key: string]: Model.FringeUnit } = {
  PERCENT: { id: 0, name: FringeUnitNames.PERCENT },
  FLAT: { id: 1, name: FringeUnitNames.FLAT }
};

export const FringeUnits = Object.values(FringeUnitModels);

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum PaymentMethodNames {
  CHECK = "Check",
  CARD = "Card",
  WIRE = "Wire"
}

export const PaymentMethodModels: { [key: string]: Model.PaymentMethod } = {
  MINUTES: { id: 0, name: PaymentMethodNames.CHECK },
  HOURS: { id: 1, name: PaymentMethodNames.CARD },
  WEEKS: { id: 2, name: PaymentMethodNames.WIRE }
};

export const PaymentMethods = Object.values(PaymentMethodModels);
