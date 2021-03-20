import { generateRandomNumericId } from "util/math";

export const userToSimpleUser = (user: IUser): ISimpleUser => {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: user.full_name,
    email: user.email,
    profile_image: user.profile_image
  };
};

export const initializeRowFromActual = (actual: IActual): Table.IActualRow => {
  return {
    id: actual.id,
    meta: {
      isPlaceholder: false,
      selected: false,
      errors: []
    },
    description: actual.description,
    vendor: actual.vendor,
    purchase_order: actual.purchase_order,
    date: actual.date,
    payment_id: actual.payment_id,
    value: actual.value,
    payment_method: actual.payment_method,
    object_id: actual.object_id,
    parent_type: actual.parent_type
  };
};

export const createActualRowPlaceholder = (): Table.IActualRow => ({
  id: generateRandomNumericId(),
  meta: {
    isPlaceholder: true,
    selected: false,
    errors: []
  },
  description: null,
  vendor: null,
  purchase_order: null,
  date: null,
  payment_id: null,
  value: null,
  payment_method: null,
  object_id: null,
  parent_type: null
});

export const initializeRowFromAccount = (account: IAccount): Table.IAccountRow => ({
  id: account.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    subaccounts: account.subaccounts,
    errors: []
  },
  identifier: account.identifier,
  description: account.description,
  estimated: account.estimated,
  variance: account.variance,
  actual: account.actual
});

export const initializeRowFromSubAccount = (subaccount: ISubAccount): Table.ISubAccountRow => ({
  id: subaccount.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    subaccounts: subaccount.subaccounts,
    errors: []
  },
  name: subaccount.name,
  identifier: subaccount.identifier,
  unit: subaccount.unit,
  multiplier: subaccount.multiplier,
  rate: subaccount.rate,
  quantity: subaccount.quantity,
  description: subaccount.description,
  estimated: subaccount.estimated,
  variance: subaccount.variance,
  actual: subaccount.actual
});

export const createSubAccountRowPlaceholder = (): Table.ISubAccountRow => ({
  id: generateRandomNumericId(),
  name: null,
  identifier: null,
  unit: null,
  multiplier: null,
  rate: null,
  quantity: null,
  description: null,
  estimated: null,
  variance: null,
  actual: null,
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: [],
    errors: []
  }
});

export const createAccountRowPlaceholder = (): Table.IAccountRow => ({
  id: generateRandomNumericId(),
  identifier: null,
  description: null,
  estimated: null,
  variance: null,
  actual: null,
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: [],
    errors: []
  }
});
