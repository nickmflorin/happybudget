import { generateRandomNumericId } from "../util";

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
