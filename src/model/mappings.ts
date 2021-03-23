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

export const initializeRowFromActual = (actual: IActual): Table.ActualRow => {
  return {
    id: actual.id,
    meta: {
      isPlaceholder: false,
      isGroupFooter: false,
      selected: false,
      errors: [],
      children: []
    },
    description: actual.description,
    vendor: actual.vendor,
    purchase_order: actual.purchase_order,
    date: actual.date,
    payment_id: actual.payment_id,
    value: actual.value,
    payment_method: actual.payment_method,
    object_id: actual.object_id,
    parent_type: actual.parent_type,
    group: null
  };
};

export const createActualRowPlaceholder = (): Table.ActualRow => ({
  id: generateRandomNumericId(),
  meta: {
    isPlaceholder: true,
    isGroupFooter: false,
    selected: false,
    errors: [],
    children: []
  },
  description: null,
  vendor: null,
  purchase_order: null,
  date: null,
  payment_id: null,
  value: null,
  payment_method: null,
  object_id: null,
  parent_type: null,
  group: null
});

export const initializeRowFromAccount = (account: IAccount): Table.AccountRow => ({
  id: account.id,
  meta: {
    isPlaceholder: false,
    isGroupFooter: false,
    selected: false,
    children: account.subaccounts,
    errors: []
  },
  identifier: account.identifier,
  description: account.description,
  estimated: account.estimated,
  variance: account.variance,
  actual: account.actual,
  group: null
});

export const initializeRowFromSubAccount = (subaccount: ISubAccount): Table.SubAccountRow => ({
  id: subaccount.id,
  meta: {
    isPlaceholder: false,
    isGroupFooter: false,
    selected: false,
    children: subaccount.subaccounts,
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
  actual: subaccount.actual,
  group: subaccount.group
});

export const createSubAccountRowPlaceholder = (): Table.SubAccountRow => ({
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
  group: null,
  meta: {
    isPlaceholder: true,
    isGroupFooter: false,
    selected: false,
    children: [],
    errors: []
  }
});

export const createAccountRowPlaceholder = (): Table.AccountRow => ({
  id: generateRandomNumericId(),
  identifier: null,
  description: null,
  estimated: null,
  variance: null,
  actual: null,
  group: null,
  meta: {
    isPlaceholder: true,
    isGroupFooter: false,
    selected: false,
    children: [],
    errors: []
  }
});
