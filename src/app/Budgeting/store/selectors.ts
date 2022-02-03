import { createSelector } from "reselect";
import { filter } from "lodash";

import { tabling } from "lib";

type DomainAndAuth = {
  readonly domain: Model.BudgetDomain;
  readonly public?: boolean;
};

type ParentDomainAndAuth = DomainAndAuth & {
  readonly parentType: "account" | "subaccount";
};

const getState = (s: Application.Store) => s;
const getDomainAndAuth = (_: unknown, d: DomainAndAuth) => d;
const getParentDomainAndAuth = (_: unknown, d: ParentDomainAndAuth) => d;

export const selectBudgetDetail = createSelector(
  getState,
  getDomainAndAuth,
  (s: Application.Store, da: DomainAndAuth) =>
    da.public === true ? s.public.budget.detail.data : s[da.domain].detail.data
);

export const selectAccountDetail = createSelector(
  getState,
  getDomainAndAuth,
  (s: Application.Store, da: DomainAndAuth) =>
    da.public === true ? s.public.budget.account.detail.data : s[da.domain].account.detail.data
);

export const selectSubAccountDetail = createSelector(
  getState,
  getDomainAndAuth,
  (s: Application.Store, da: DomainAndAuth) =>
    da.public === true ? s.public.budget.subaccount.detail.data : s[da.domain].subaccount.detail.data
);

export const selectAccountsTableStore = createSelector(
  getState,
  getDomainAndAuth,
  (s: Application.Store, da: DomainAndAuth) => (da.public === true ? s.public.budget.accounts : s[da.domain].accounts)
);

export const selectSubAccountsTableStore = createSelector(
  getState,
  getParentDomainAndAuth,
  (s: Application.Store, pd: ParentDomainAndAuth) =>
    pd.public === true ? s.public.budget[pd.parentType].table : s[pd.domain][pd.parentType].table
);

export const selectFringesStore = createSelector(
  getState,
  getParentDomainAndAuth,
  (s: Application.Store, pd: ParentDomainAndAuth) =>
    pd.public === true ? s.public.budget[pd.parentType].table.fringes : s[pd.domain][pd.parentType].table.fringes
);

export const selectFringes = createSelector(
  selectFringesStore,
  (s: Tables.FringeTableStore) =>
    filter(s.data, (f: Table.BodyRow<Tables.FringeRowData>) => tabling.typeguards.isModelRow(f)) as Tables.FringeRow[]
);

export const selectSubAccountUnits = createSelector(
  selectSubAccountsTableStore,
  (s: Tables.SubAccountTableStore) => s.subaccountUnits
);
