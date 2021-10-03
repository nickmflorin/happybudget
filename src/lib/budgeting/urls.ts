import { isNil } from "lodash";
import Cookies from "universal-cookie";
import { model } from "lib";

type Designation = "budget" | "template";

type CookieSubset = `${Designation}-last-visited`;

type AccountsUrl<D extends Designation = Designation> = `/${D}s/${number}/accounts`;
type AccountUrl<D extends Designation = Designation> = `/${D}s/${number}/accounts/${number}`;
type SubAccountUrl<D extends Designation = Designation> = `/${D}s/${number}/subaccounts/${number}`;

type BudgetingUrl<D extends Designation = Designation> = AccountsUrl<D> | AccountUrl<D> | SubAccountUrl<D>;

type BudgetUrl = BudgetingUrl<"budget">;
type TemplateUrl = BudgetingUrl<"template">;

export const getBudgetUrl = (
  budget: Model.Budget,
  entity?: Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
): BudgetUrl => {
  if (isNil(entity)) {
    return `/budgets/${budget.id}/accounts`;
  } else if (model.typeguards.isAccount(entity)) {
    return `/budgets/${budget.id}/accounts/${entity.id}`;
  } else {
    return `/budgets/${budget.id}/subaccounts/${entity.id}`;
  }
};

export const getTemplateUrl = (
  budget: Model.Template,
  entity?: Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
): TemplateUrl => {
  if (isNil(entity)) {
    return `/templates/${budget.id}/accounts`;
  } else if (model.typeguards.isAccount(entity)) {
    return `/templates/${budget.id}/accounts/${entity.id}`;
  } else {
    return `/templates/${budget.id}/subaccounts/${entity.id}`;
  }
};

export const getUrl = (
  budget: Model.Budget | Model.Template,
  entity?: Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
): BudgetUrl | TemplateUrl =>
  model.typeguards.isBudget(budget) ? getBudgetUrl(budget, entity) : getTemplateUrl(budget, entity);

type PluggableID = ID | "([0-9]+)";

const regexesMatch = (regexes: RegExp[], test: string) => {
  for (let i = 0; i < regexes.length; i++) {
    if (test.match(regexes[i])) {
      return true;
    }
  }
  return false;
};

export const isAccountsUrl = <D extends Designation = Designation>(
  url: string,
  designation?: D,
  id: PluggableID = "([0-9]+)"
): url is AccountsUrl<D> => {
  if (!isNil(designation)) {
    const regex = new RegExp(`^/${designation}s/${id}/accounts/?$`);
    return url.match(regex) !== null ? true : false;
  } else {
    return regexesMatch([new RegExp(`^/budgets/${id}/accounts/?$`), new RegExp(`^/templates/${id}/accounts/?$`)], url);
  }
};

export const isAccountUrl = <D extends Designation = Designation>(
  url: string,
  designation?: D,
  id: PluggableID = "([0-9]+)"
): url is AccountUrl<D> => {
  if (!isNil(designation)) {
    const regex = new RegExp(`^/${designation}s/${id}/accounts/([0-9]+)/?$`);
    return url.match(regex) !== null ? true : false;
  } else {
    return regexesMatch(
      [new RegExp(`^/templates/${id}/accounts/([0-9]+)/?$`), new RegExp(`^/budgets/${id}/accounts/([0-9]+)/?$`)],
      url
    );
  }
};

export const isSubAccountUrl = <D extends Designation = Designation>(
  url: string,
  designation?: D,
  id: PluggableID = "([0-9]+)"
): url is SubAccountUrl<D> => {
  if (isNil(designation)) {
    const regex = new RegExp(`^/${designation}s/${id}/subaccounts/([0-9]+)/?$`);
    return url.match(regex) !== null ? true : false;
  } else {
    return regexesMatch(
      [new RegExp(`^/templates/${id}/subaccounts/([0-9]+)/?$`), new RegExp(`^/budgets/${id}/subaccounts/([0-9]+)/?$`)],
      url
    );
  }
};

export const isBudgetRelatedUrl = (url: string, id: PluggableID = "([0-9]+)"): url is BudgetUrl =>
  isSubAccountUrl(url, "budget", id) || isAccountUrl(url, "budget", id) || isAccountsUrl(url, "budget", id);

export const isTemplateRelatedUrl = (url: string, id: PluggableID = "([0-9]+)"): boolean =>
  isSubAccountUrl(url, "template", id) || isAccountUrl(url, "template", id) || isAccountsUrl(url, "template", id);

const getLastVisitedCookies = (subset: CookieSubset): { [key: string]: any } => {
  const cookies = new Cookies();
  const lastVisited = cookies.get(subset);
  if (typeof lastVisited !== "object") {
    cookies.set(subset, {}, { path: "/" });
    return {};
  }
  return lastVisited;
};

export const getLastVisited = (subset: CookieSubset, id: ID): string | null => {
  const cookies = getLastVisitedCookies(subset);
  if (!isNil(cookies[`${id}`])) {
    if (
      (typeof cookies[`${id}`] === "string" &&
        subset === "budget-last-visited" &&
        isBudgetRelatedUrl(cookies[`${id}`], id)) ||
      (subset === "template-last-visited" && isTemplateRelatedUrl(cookies[`${id}`], id))
    ) {
      return cookies[`${id}`];
    }
  }
  return null;
};

export const setLastVisited = (
  budget: Model.Budget | Model.Template,
  entity?: Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
): void => {
  const subSet: CookieSubset = model.typeguards.isBudget(budget) ? "budget-last-visited" : "template-last-visited";
  const urlCookies = getLastVisitedCookies(subSet);
  const url = getUrl(budget, entity);
  urlCookies[budget.id] = url;
  const cookies = new Cookies();
  cookies.set(subSet, urlCookies, { path: "/" });
};
