import { isNil } from "lodash";
import Cookies from "universal-cookie";

type DG<T1 extends string, T2 extends string> = `${T1}s` | `${T2}s` | `(${T1}s|${T2}s)` | `(${T2}s|${T1}s)`;

type BudgetDesignation = DG<"budget", "template">;
type ParentDesignation = DG<"account", "subaccount">;

type Budget = {
  readonly domain?: Model.BudgetDomain | null;
  readonly id?: Id | null;
};

type ParentType = Model.Account["type"] | Model.SubAccount["type"];

type Parent = {
  readonly type?: ParentType | null;
  readonly id?: Id | null;
};

type ConcreteId = `${number}` | number;
type Id = ConcreteId | "([0-9]+)";

type BaseBudgetPath<D extends BudgetDesignation = BudgetDesignation> = `/${D}`;

type BudgetDetailPath<
  D extends BudgetDesignation = BudgetDesignation,
  ID extends Id = Id
> = `${BaseBudgetPath<D>}/${ID}`;

// /subaccounts or /accounts
type BaseParentPath<P extends ParentDesignation = ParentDesignation> = `/${P}`;

type ParentPath<
  D extends BudgetDesignation = BudgetDesignation,
  P extends ParentDesignation = ParentDesignation,
  ID extends Id = Id
> = `${BudgetDetailPath<D, ID>}${BaseParentPath<P>}`;

type ParentDetailPath<
  D extends BudgetDesignation = BudgetDesignation,
  P extends ParentDesignation = ParentDesignation,
  BID extends Id = Id,
  PID extends Id = Id
> = `${ParentPath<D, P, BID>}/${PID}`;

type AccountsPath<D extends BudgetDesignation = BudgetDesignation, BID extends Id = Id> = `${BudgetDetailPath<
  D,
  BID
>}${"/accounts"}`;

type AccountPath<
  D extends BudgetDesignation = BudgetDesignation,
  BID extends Id = Id,
  PID extends Id = Id
> = ParentDetailPath<D, "accounts", BID, PID>;

type SubAccountPath<
  D extends BudgetDesignation = BudgetDesignation,
  BID extends Id = Id,
  PID extends Id = Id
> = ParentDetailPath<D, "subaccounts", BID, PID>;

type BudgetPath<
  D extends BudgetDesignation = BudgetDesignation,
  P extends ParentDesignation = ParentDesignation,
  BID extends Id = Id,
  PID extends Id = Id
> = AccountsPath<D, BID> | ParentDetailPath<D, P, BID, PID>;

type PublicTokenId = "(.*)" | string;
type PublicPath<U extends `/${string}`> = `/pub/${PublicTokenId}${U}`;
type PathOrPublic<U extends `/${string}`> = U | PublicPath<U>;

const AnyId = "([0-9]+)";
const AnyBudgetDesignation: BudgetDesignation = "(budgets|templates)";
const AnyParentDesignation: ParentDesignation = "(accounts|subaccounts)";

const withPublicPath = <U extends `/${string}`>(url: U, pub?: boolean | string): PathOrPublic<U> =>
  typeof pub === "string" ? `/pub/${pub}${url}` : pub === true ? (`/pub/(.*)${url}` as PathOrPublic<U>) : url;

const isBudgetDomain = (b?: Budget | Model.BudgetDomain | null): b is Model.BudgetDomain =>
  !isNil(b) && typeof b === "string";
const isBudget = (b?: Budget | Model.BudgetDomain | null): b is Budget => !isNil(b) && typeof b !== "string";

const isParentType = (p?: Parent | ParentType | null): p is ParentType => !isNil(p) && typeof p === "string";
const isParent = (p?: Parent | ParentType | null): p is Parent => !isNil(p) && typeof p !== "string";

const budgetId = (b?: Budget | null): Id => (isNil(b) || isNil(b.id) ? AnyId : b.id);

const budgetDesignation = (b?: Budget | Model.BudgetDomain | null): BudgetDesignation =>
  isBudgetDomain(b) ? `${b}s` : isBudget(b) ? budgetDesignation(b.domain) : AnyBudgetDesignation;

const parentId = (p?: Parent | null): Id => (isNil(p) || isNil(p.id) ? AnyId : p.id);

const parentDesignation = (p?: Parent | ParentType | null): ParentDesignation =>
  isParentType(p) ? `${p}s` : isParent(p) ? parentDesignation(p.type) : AnyParentDesignation;

export const getBaseBudgetPath = (
  b?: Budget | Model.BudgetDomain | null,
  pub?: boolean | string
): PathOrPublic<BaseBudgetPath> => withPublicPath(`/${budgetDesignation(b)}`, pub);

export const getBudgetDetailPath = (b?: Budget | null, pub?: boolean | string): PathOrPublic<BudgetDetailPath> =>
  withPublicPath(`${getBaseBudgetPath(b)}/${budgetId(b)}`, pub);

export const getBaseParentPath = (
  b?: Budget | null,
  p?: Parent | ParentType | null,
  pub?: boolean | string
): PathOrPublic<ParentPath> => withPublicPath(`${getBudgetDetailPath(b)}/${parentDesignation(p)}`, pub);

export const getParentDetailPath = (
  b?: Budget | null,
  p?: Parent | null,
  pub?: boolean | string
): PathOrPublic<ParentDetailPath> => withPublicPath(`${getBaseParentPath(b, p)}/${parentId(p)}`, pub);

export const getAccountsPath = (b?: Budget | null, pub?: boolean | string): PathOrPublic<AccountsPath> =>
  `${getBudgetDetailPath(b, pub)}/accounts`;

export const getAccountPath = (b?: Budget | null, id?: Id | null, pub?: boolean | string): PathOrPublic<AccountPath> =>
  getParentDetailPath(b, { id, type: "account" }, pub) as PathOrPublic<AccountPath>;

export const getSubAccountPath = (
  b?: Budget | null,
  id?: Id | null,
  pub?: boolean | string
): PathOrPublic<SubAccountPath> =>
  getParentDetailPath(b, { id, type: "subaccount" }, pub) as PathOrPublic<SubAccountPath>;

export const getUrl = <B extends "budgets" | "templates" = "budgets" | "templates">(
  budget: Pick<Model.Budget, "id" | "domain"> | Pick<Model.Template, "id" | "domain">,
  parent?: Pick<Model.Account, "id" | "type"> | Pick<Model.SubAccount, "id" | "type">,
  tokenId?: string
):
  | PathOrPublic<AccountsPath<B, number>>
  | PathOrPublic<AccountPath<B, number, number>>
  | PathOrPublic<SubAccountPath<B, number>> => {
  if (isNil(parent)) {
    return getAccountsPath(budget, tokenId) as PathOrPublic<AccountsPath<B, number>>;
  } else if (parent.type === "account") {
    return getAccountPath(budget, parent.id, tokenId) as PathOrPublic<AccountPath<B, number, number>>;
  } else {
    return getSubAccountPath(budget, parent.id, tokenId) as PathOrPublic<SubAccountPath<B, number>>;
  }
};

export const getBudgetUrl = (
  id: number,
  parent?: Pick<Model.Account, "id" | "type"> | Pick<Model.SubAccount, "id" | "type">,
  tokenId?: string
) => getUrl<"budgets">({ id, domain: "budget" }, parent, tokenId);

export const getTemplateUrl = (
  id: number,
  parent?: Pick<Model.Account, "id" | "type"> | Pick<Model.SubAccount, "id" | "type">,
  tokenId?: string
) => getUrl<"templates">({ id, domain: "template" }, parent, tokenId);

export const isAccountsUrl = (url: string, b?: Budget | null, pub?: boolean | string): url is AccountsPath => {
  const regex = new RegExp(`^${getAccountsPath(b, pub)}/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isAccountUrl = (
  url: string,
  b?: Budget | null,
  id?: Id | null,
  pub?: boolean | string
): url is AccountPath => {
  const regex = new RegExp(`^${getAccountPath(b, id, pub)}/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isSubAccountUrl = (
  url: string,
  b?: Budget | null,
  id?: Id | null,
  pub?: boolean | string
): url is AccountPath => {
  const regex = new RegExp(`^${getSubAccountPath(b, id, pub)}/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isBudgetRelatedUrl = (url: string, id?: Id | null, pub?: boolean | string): url is BudgetPath<"budgets"> =>
  isSubAccountUrl(url, { domain: "budget", id }, null, pub) ||
  isAccountUrl(url, { domain: "budget", id }, null, pub) ||
  isAccountsUrl(url, { domain: "budget", id }, pub);

export const isTemplateRelatedUrl = (
  url: string,
  id?: Id | null,
  pub?: boolean | string
): url is BudgetPath<"templates"> =>
  isSubAccountUrl(url, { domain: "template", id }, null, pub) ||
  isAccountUrl(url, { domain: "template", id }, null, pub) ||
  isAccountsUrl(url, { domain: "template", id }, pub);

const cookieParam = (domain: Model.BudgetDomain, tokenId?: string) =>
  isNil(tokenId) ? `${domain}s-last-visited` : `${tokenId}-pub-${domain}s-last-visited`;

const getLastVisitedCookies = (domain: Model.BudgetDomain, tokenId?: string): Record<string, unknown> => {
  const cookies = new Cookies();
  const lastVisited = cookies.get(cookieParam(domain, tokenId));
  if (typeof lastVisited !== "object") {
    cookies.remove(cookieParam(domain, tokenId));
    return {};
  }
  return lastVisited;
};

export const getLastVisited = (domain: Model.BudgetDomain, id: number, tokenId?: string): string | null => {
  const cookies = getLastVisitedCookies(domain, tokenId);
  if (!isNil(cookies[`${id}`])) {
    if (
      (typeof cookies[`${id}`] === "string" &&
        domain === "budget" &&
        isBudgetRelatedUrl(cookies[`${id}`] as string, id, tokenId)) ||
      (domain === "template" && isTemplateRelatedUrl(cookies[`${id}`] as string, id, tokenId))
    ) {
      return cookies[`${id}`] as string;
    }
  }
  return null;
};

export const setLastVisited = (
  budget: Model.Budget | Model.Template,
  parent?: Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount,
  tokenId?: string
): void => {
  const urlCookies = getLastVisitedCookies(budget.domain, tokenId);
  const url = getUrl(budget, parent, tokenId);
  urlCookies[budget.id] = url;
  const cookies = new Cookies();
  cookies.set(cookieParam(budget.domain, tokenId), urlCookies);
};
