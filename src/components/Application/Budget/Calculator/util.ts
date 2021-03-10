import { generateRandomNumericId } from "../util";

export const initializeRowFromAccount = (account: IAccount): Table.IAccountRow => ({
  id: account.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    subaccounts: account.subaccounts,
    errors: []
  },
  account_number: account.account_number,
  description: account.description,
  estimated: account.estimated,
  variance: account.variance
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
  line: subaccount.line,
  unit: subaccount.unit,
  multiplier: subaccount.multiplier,
  rate: subaccount.rate,
  quantity: subaccount.quantity,
  description: subaccount.description,
  estimated: subaccount.estimated,
  variance: subaccount.variance
});

export const createSubAccountRowPlaceholder = (): Table.ISubAccountRow => ({
  id: generateRandomNumericId(),
  name: null,
  line: null,
  unit: null,
  multiplier: null,
  rate: null,
  quantity: null,
  description: null,
  estimated: null,
  variance: null,
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: [],
    errors: []
  }
});

export const createAccountRowPlaceholder = (): Table.IAccountRow => ({
  id: generateRandomNumericId(),
  account_number: null,
  description: null,
  estimated: null,
  variance: null,
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: [],
    errors: []
  }
});
