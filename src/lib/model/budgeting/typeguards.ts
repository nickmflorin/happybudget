import { modelIsTypedApiModel } from "../typeguards";
import { TypedApiModel, Model } from "../types";

import * as types from "./types";

/* export const isSubAccountRow = (
     r: Table.DataRow<any>,
   ): r is Table.DataRow<Tables.SubAccountRowData> =>
     (r.data as Tables.SubAccountRowData).fringe_contribution !== undefined; */

export const isMarkup = (m: TypedApiModel): m is types.Markup =>
  modelIsTypedApiModel<types.Markup>(m, "markup");

export const isFlatMarkup = (
  m: Omit<Partial<types.Markup>, "unit"> & Pick<types.Markup, "unit">,
): m is types.FlatMarkup => (m as types.FlatMarkup).unit.id === 1;

export const isPercentMarkup = (
  m: Omit<Partial<types.Markup>, "unit"> & Pick<types.Markup, "unit">,
): m is types.PercentMarkup => (m as types.PercentMarkup).unit.id === 0;

export const isFringe = (m: TypedApiModel): m is types.Fringe =>
  modelIsTypedApiModel<types.Fringe>(m, "fringe");

export const isGroup = (m: TypedApiModel): m is types.Group =>
  modelIsTypedApiModel<types.Group>(m, "group");

export const isAccount = <
  M extends types.Account | types.SimpleAccount = types.Account | types.SimpleAccount,
>(
  m: TypedApiModel,
): m is M => modelIsTypedApiModel<M>(m, "account");

export const isSubAccount = <
  M extends types.SubAccount | types.SimpleSubAccount = types.SubAccount | types.SimpleSubAccount,
>(
  m: TypedApiModel,
): m is M => modelIsTypedApiModel<M>(m, "subaccount");

export const isPdfAccount = (m: TypedApiModel): m is types.PdfAccount =>
  modelIsTypedApiModel<types.PdfAccount>(m, "pdf-account");

export const isPdfSubAccount = (m: TypedApiModel): m is types.PdfSubAccount =>
  modelIsTypedApiModel<types.PdfSubAccount>(m, "pdf-subaccount");

export const isPdfBudget = (m: TypedApiModel): m is types.PdfBudget =>
  modelIsTypedApiModel<types.PdfBudget>(m, "pdf-budget");

export const isBudget = <
  M extends Pick<types.Budget, "id" | "type" | "domain"> = Pick<
    types.Budget,
    "id" | "type" | "domain"
  >,
>(
  m: TypedApiModel,
): m is M => modelIsTypedApiModel<M>(m, "budget") && m.domain === "budget";

export const isTemplate = <
  M extends Pick<types.Template, "id" | "type" | "domain"> = Pick<
    types.Template,
    "id" | "type" | "domain"
  >,
>(
  m: TypedApiModel,
): m is types.Template => modelIsTypedApiModel<M>(m, "budget") && m.domain === "template";

export const isModelWithChildren = <M extends Model>(m: M): m is M & { children: M[] } =>
  (m as M & { children: M[] }).children !== undefined &&
  Array.isArray((m as M & { children: M[] }).children);

export const isModelWithGroup = <M extends Model>(
  m: M | (M & { readonly group: types.Group | null }),
): m is M & { readonly group: types.Group | null } =>
  (m as M & { readonly group: types.Group | null }).group !== undefined;
