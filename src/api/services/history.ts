import * as services from "./services";

export const getAccountsHistory = services.detailListService<Model.HistoryEvent>((id: number) => [
  "budgets",
  id,
  "accounts",
  "history"
]);
export const getAccountHistory = services.detailListService<Model.HistoryEvent>((id: number) => [
  "accounts",
  id,
  "history"
]);
export const getAccountSubAccountsHistory = services.detailListService<Model.HistoryEvent>((id: number) => [
  "accounts",
  id,
  "subaccounts",
  "history"
]);
export const getSubAccountSubAccountsHistory = services.detailListService<Model.HistoryEvent>((id: number) => [
  "subaccounts",
  id,
  "subaccounts",
  "history"
]);
export const getSubAccountHistory = services.detailListService<Model.HistoryEvent>((id: number) => [
  "subaccounts",
  id,
  "history"
]);
export const getActualsHistory = services.detailListService<Model.HistoryEvent>((id: number) => [
  "budgets",
  id,
  "actuals",
  "history"
]);
export const getActualHistory = services.detailListService<Model.HistoryEvent>((id: number) => [
  "actuals",
  id,
  "history"
]);
