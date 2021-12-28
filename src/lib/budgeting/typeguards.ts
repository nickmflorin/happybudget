/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isSubAccountRow = (r: Table.DataRow<any>): r is Table.DataRow<Tables.SubAccountRowData> =>
  (r.data as Tables.SubAccountRowData).fringe_contribution !== undefined;

export const isMarkup = (m: Model.HttpModel): m is Model.Markup => (m as Model.Markup).type === "markup";

export const isFlatMarkup = (
  m: Omit<Partial<Model.Markup>, "unit"> & Pick<Model.Markup, "unit">
): m is Model.FlatMarkup => (m as Model.FlatMarkup).unit.id === 1;

export const isPercentMarkup = (
  m: Omit<Partial<Model.Markup>, "unit"> & Pick<Model.Markup, "unit">
): m is Model.PercentMarkup => (m as Model.PercentMarkup).unit.id === 0;

export const isFringe = (m: Model.HttpModel): m is Model.Fringe => (m as Model.Fringe).type === "fringe";

export const isGroup = (m: Model.HttpModel): m is Model.Group => (m as Model.Group).type === "group";

export const isAccount = <M extends Model.Account | Model.SimpleAccount = Model.Account | Model.SimpleAccount>(
  m: Model.HttpModel
): m is M => (m as M).type === "account";

export const isSubAccount = <
  M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount | Model.SimpleSubAccount
>(
  m: Model.HttpModel
): m is M => (m as M).type === "subaccount";

export const isPdfAccount = (m: Model.HttpModel): m is Model.PdfAccount =>
  (m as Model.PdfAccount).type === "pdf-account";

export const isPdfSubAccount = (m: Model.HttpModel): m is Model.PdfSubAccount =>
  (m as Model.PdfSubAccount).type === "pdf-subaccount";

export const isPdfBudget = (m: Model.HttpModel): m is Model.PdfBudget => (m as Model.PdfBudget).type === "pdf-budget";

export const isBudget = <
  M extends Pick<Model.Budget, "id" | "type" | "domain"> = Pick<Model.Budget, "id" | "type" | "domain">
>(
  m: Model.HttpModel
): m is M => (m as M).type === "budget" && (m as M).domain === "budget";

export const isTemplate = <
  M extends Pick<Model.Template, "id" | "type" | "domain"> = Pick<Model.Template, "id" | "type" | "domain">
>(
  m: Model.HttpModel
): m is M => (m as M).type === "budget" && (m as M).domain === "template";

export const isModelWithChildren = <M extends Model.Model>(model: M): model is M & { children: M[] } =>
  (model as M & { children: M[] }).children !== undefined && Array.isArray((model as M & { children: M[] }).children);

export const isModelWithGroup = <M extends Model.Model>(
  m: M | (M & { readonly group: Model.Group | null })
): m is M & { readonly group: Model.Group | null } =>
  (m as M & { readonly group: Model.Group | null }).group !== undefined;
