import { typeguards } from "lib";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isSubAccountRow = (r: Table.DataRow<any>): r is Table.DataRow<Tables.SubAccountRowData> =>
  (r.data as Tables.SubAccountRowData).fringe_contribution !== undefined;

export const isMarkup = (m: Model.GenericHttpModel): m is Model.Markup =>
  typeguards.isModelType<Model.Markup>(m, "markup");

export const isFlatMarkup = (
  m: Omit<Partial<Model.Markup>, "unit"> & Pick<Model.Markup, "unit">
): m is Model.FlatMarkup => (m as Model.FlatMarkup).unit.id === 1;

export const isPercentMarkup = (
  m: Omit<Partial<Model.Markup>, "unit"> & Pick<Model.Markup, "unit">
): m is Model.PercentMarkup => (m as Model.PercentMarkup).unit.id === 0;

export const isFringe = (m: Model.GenericHttpModel): m is Model.Fringe =>
  typeguards.isModelType<Model.Fringe>(m, "fringe");

export const isGroup = (m: Model.GenericHttpModel): m is Model.Group => typeguards.isModelType<Model.Group>(m, "group");

export const isAccount = <M extends Model.Account | Model.SimpleAccount = Model.Account | Model.SimpleAccount>(
  m: Model.GenericHttpModel
): m is M => typeguards.isModelType<M>(m, "account");

export const isSubAccount = <
  M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount | Model.SimpleSubAccount
>(
  m: Model.GenericHttpModel
): m is M => typeguards.isModelType<M>(m, "subaccount");

export const isPdfAccount = (m: Model.GenericHttpModel): m is Model.PdfAccount =>
  typeguards.isModelType<Model.PdfAccount>(m, "pdf-account");

export const isPdfSubAccount = (m: Model.GenericHttpModel): m is Model.PdfSubAccount =>
  typeguards.isModelType<Model.PdfSubAccount>(m, "pdf-subaccount");

export const isPdfBudget = (m: Model.GenericHttpModel): m is Model.PdfBudget =>
  typeguards.isModelType<Model.PdfBudget>(m, "pdf-budget");

export const isBudget = <
  M extends Pick<Model.Budget, "id" | "type" | "domain"> = Pick<Model.Budget, "id" | "type" | "domain">
>(
  m: Model.GenericHttpModel
): m is M => typeguards.isModelType<M>(m, "budget") && m.domain === "budget";

export const isTemplate = <
  M extends Pick<Model.Template, "id" | "type" | "domain"> = Pick<Model.Template, "id" | "type" | "domain">
>(
  m: Model.GenericHttpModel
): m is Model.Template => typeguards.isModelType<M>(m, "budget") && m.domain === "template";

export const isModelWithChildren = <M extends Model.Model>(model: M): model is M & { children: M[] } =>
  (model as M & { children: M[] }).children !== undefined && Array.isArray((model as M & { children: M[] }).children);

export const isModelWithGroup = <M extends Model.Model>(
  m: M | (M & { readonly group: Model.Group | null })
): m is M & { readonly group: Model.Group | null } =>
  (m as M & { readonly group: Model.Group | null }).group !== undefined;
