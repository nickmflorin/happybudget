import {
  isObjectOfType,
  parseObjectOfType,
  ParseObjectResponse,
  ObjectParserOptions,
} from "../../schemas";
import { modelIsTypedApiModel } from "../typeguards";
import { TypedApiModel, Model } from "../types";

import * as schemas from "./schemas";
import * as types from "./types";

export const isMarkup = (m: unknown): m is types.Markup => isObjectOfType(m, schemas.MarkupSchema);

export const isFlatMarkup = (m: unknown): m is types.FlatMarkup =>
  isObjectOfType(m, schemas.FlatMarkupSchema);

export const isPercentMarkup = (m: unknown): m is types.PercentMarkup =>
  isObjectOfType(m, schemas.PercentMarkupSchema);

export const isFringe = (m: TypedApiModel): m is types.Fringe =>
  modelIsTypedApiModel<types.Fringe>(m, "fringe");

export const isGroup = (m: unknown): m is types.Group => isObjectOfType(m, schemas.GroupSchema);

export const parseUserBudget = (
  m: unknown,
  options?: ObjectParserOptions,
): ParseObjectResponse<types.UserBudget> =>
  parseObjectOfType<types.UserBudget>(m, schemas.UserBudgetSchema, options);

export const isUserBudget = (m: unknown): m is types.UserBudget =>
  isObjectOfType(m, schemas.UserBudgetSchema);

export const isAnotherUserBudget = (m: unknown): m is types.UserBudget =>
  isObjectOfType(m, schemas.AnotherUserBudgetSchema);

export const isBudget = (m: unknown): m is types.UserBudget =>
  isObjectOfType(m, schemas.BudgetSchema);

export const parseBudget = (
  m: unknown,
  options?: ObjectParserOptions,
): ParseObjectResponse<types.Budget> =>
  parseObjectOfType<types.Budget>(m, schemas.BudgetSchema, options);

export const isTemplate = (m: unknown): m is types.Template =>
  isObjectOfType(m, schemas.TemplateSchema);

export const parseTemplate = (
  m: unknown,
  options?: ObjectParserOptions,
): ParseObjectResponse<types.Template> =>
  parseObjectOfType<types.Template>(m, schemas.TemplateSchema, options);

export const parseBudgetOfDomain = <B extends types.Budget | types.Template>(
  m: types.Template | types.Budget,
  parentDomain: B["domain"],
): B => {
  switch (parentDomain) {
    case types.BudgetDomains.BUDGET:
      const { data: budgetData, error: budgetError } = parseBudget(m, {
        prefix: `Unexpectedly encountered an invalid budget with ID ${m.id}.`,
      });
      if (budgetError) {
        if (isTemplate(m)) {
          budgetError.prefix = `Unexpectedly encountered a template with ID ${m.id} when a budget was expected.`;
        }
        throw budgetError;
      }
      return budgetData as B;
    case types.BudgetDomains.TEMPLATE:
      const { data: templateData, error: templateError } = parseTemplate(m, {
        prefix: `Unexpectedly encountered an invalid template with ID ${m.id}.`,
      });
      if (templateError) {
        if (isBudget(m)) {
          templateError.prefix = `Unexpectedly encountered a budget with ID ${m.id} when a template was expected.`;
        }
        throw templateError;
      }
      return templateData as B;
    default:
      throw new TypeError(`Invalid domain ${parentDomain} detected!`);
  }
};

export const isSimpleTemplate = (m: unknown): m is types.Template =>
  isObjectOfType(m, schemas.SimpleTemplateSchema);

export const isSimpleBudget = (m: unknown): m is types.Template =>
  isObjectOfType(m, schemas.SimpleBudgetSchema);

export const isSimpleAccount = (m: unknown): m is types.SimpleAccount =>
  isObjectOfType(m, schemas.SimpleAccountSchema);

export const isSimpleSubAccount = (m: unknown): m is types.SimpleSubAccount =>
  isObjectOfType(m, schemas.SimpleSubAccountSchema);

export const isAccount = (m: unknown): m is types.Account =>
  isObjectOfType(m, schemas.AccountSchema);

export const parseAccount = (
  m: unknown,
  options?: ObjectParserOptions,
): ParseObjectResponse<types.Account> =>
  parseObjectOfType<types.Account>(m, schemas.AccountSchema, options);

export const isSubAccount = (m: unknown): m is types.SubAccount =>
  isObjectOfType(m, schemas.SubAccountSchema);

export const parseSubAccount = (
  m: unknown,
  options?: ObjectParserOptions,
): ParseObjectResponse<types.SubAccount> =>
  parseObjectOfType<types.SubAccount>(m, schemas.SubAccountSchema, options);

export const parseParentOfType = <P extends types.Account | types.SubAccount>(
  m: types.Account | types.SubAccount,
  parentType: P["type"],
): P => {
  switch (parentType) {
    case types.ParentTypes.ACCOUNT:
      const { data: accountData, error: accountError } = parseAccount(m, {
        prefix: `Unexpectedly encountered an invalid account with ID ${m.id}.`,
      });
      if (accountError) {
        if (isSubAccount(m)) {
          accountError.prefix = `Unexpectedly encountered a subaccount with ID ${m.id} when an account was expected.`;
        }
        throw accountError;
      }
      return accountData as P;
    case types.ParentTypes.SUBACCOUNT:
      const { data: subaccountData, error: subaccountError } = parseSubAccount(m, {
        prefix: `Unexpectedly encountered an invalid subaccount with ID ${m.id}.`,
      });
      if (subaccountError) {
        if (isAccount(m)) {
          subaccountError.prefix = `Unexpectedly encountered an account with ID ${m.id} when a subaccount was expected.`;
        }
        throw subaccountError;
      }
      return subaccountData as P;
    default:
      throw new TypeError(`Invalid parent type ${parentType} detected!`);
  }
};

/**
 * @deprecated
 */
export const isPdfAccount = (m: TypedApiModel): m is types.PdfAccount =>
  modelIsTypedApiModel<types.PdfAccount>(m, "pdf-account");

/**
 * @deprecated
 */
export const isPdfSubAccount = (m: TypedApiModel): m is types.PdfSubAccount =>
  modelIsTypedApiModel<types.PdfSubAccount>(m, "pdf-subaccount");

/**
 * @deprecated
 */
export const isPdfBudget = (m: TypedApiModel): m is types.PdfBudget =>
  modelIsTypedApiModel<types.PdfBudget>(m, "pdf-budget");

/**
 * @deprecated
 */
export const isModelWithChildren = <M extends Model>(m: M): m is M & { children: M[] } =>
  (m as M & { children: M[] }).children !== undefined &&
  Array.isArray((m as M & { children: M[] }).children);

/**
 * @deprecated
 */
export const isModelWithGroup = <M extends Model>(
  m: M | (M & { readonly group: types.Group | null }),
): m is M & { readonly group: types.Group | null } =>
  (m as M & { readonly group: types.Group | null }).group !== undefined;
