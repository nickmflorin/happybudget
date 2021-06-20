import { isNil } from "lodash";
import Cookies from "universal-cookie";

export const getUrl = (budget: Model.Budget | Model.Template, entity?: Model.Entity | Model.SimpleEntity): string => {
  const designation = budget.type;
  if (isNil(entity)) {
    return `/${designation}s/${budget.id}/accounts`;
  }
  /* eslint-disable indent */
  return entity.type === "subaccount"
    ? `/${designation}s/${budget.id}/subaccounts/${entity.id}`
    : entity.type === "account"
    ? `/${designation}s/${budget.id}/accounts/${entity.id}`
    : `/${designation}s/${budget.id}/accounts`;
};

type PluggableID = number | "([0-9]+)";

export const isAccountsUrl = (
  url: string,
  id: PluggableID = "([0-9]+)",
  domain: "budgets" | "templates" = "budgets"
): boolean => {
  const regex = new RegExp(`^/${domain}/${id}/accounts/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isAccountUrl = (
  url: string,
  id: PluggableID = "([0-9]+)",
  domain: "budgets" | "templates" = "budgets"
): boolean => {
  const regex = new RegExp(`^/${domain}/${id}/accounts/([0-9]+)/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isSubAccountUrl = (
  url: string,
  id: PluggableID = "([0-9]+)",
  domain: "budgets" | "templates" = "budgets"
): boolean => {
  const regex = new RegExp(`^/${domain}/${id}/subaccounts/([0-9]+)/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isBudgetRelatedUrl = (url: string, id: PluggableID = "([0-9]+)"): boolean =>
  isAccountUrl(url, id, "budgets") || isAccountsUrl(url, id, "budgets") || isSubAccountUrl(url, id, "budgets");

export const isTemplateRelatedUrl = (url: string, id: PluggableID = "([0-9]+)"): boolean =>
  isAccountUrl(url, id, "templates") || isAccountsUrl(url, id, "templates") || isSubAccountUrl(url, id, "templates");

const getBudgetLastVisitedCookies = (): { [key: string]: any } => {
  const cookies = new Cookies();
  const lastVisited = cookies.get("budget-last-visited");
  if (typeof lastVisited !== "object") {
    cookies.set("budget-last-visited", {}, { path: "/" });
    return {};
  }
  return lastVisited;
};

export const getBudgetLastVisited = (id: number): string | null => {
  const cookies = getBudgetLastVisitedCookies();
  if (!isNil(cookies[`${id}`])) {
    if (typeof cookies[`${id}`] === "string" && isBudgetRelatedUrl(cookies[`${id}`], id)) {
      return cookies[`${id}`];
    }
  }
  return null;
};

export const setBudgetLastVisited = (id: number, url: string): void => {
  const budgetCookies = getBudgetLastVisitedCookies();
  if (isBudgetRelatedUrl(url, id)) {
    budgetCookies[id] = url;
    const cookies = new Cookies();
    cookies.set("budget-last-visited", budgetCookies, { path: "/" });
  }
};

const getTemplateLastVisitedCookies = (): { [key: string]: any } => {
  const cookies = new Cookies();
  const lastVisited = cookies.get("template-last-visited");
  if (typeof lastVisited !== "object") {
    cookies.set("template-last-visited", {}, { path: "/" });
    return {};
  }
  return lastVisited;
};

export const setTemplateLastVisited = (id: number, url: string): void => {
  const templatesCookies = getTemplateLastVisitedCookies();
  if (isTemplateRelatedUrl(url, id)) {
    templatesCookies[id] = url;
    const cookies = new Cookies();
    cookies.set("template-last-visited", templatesCookies, { path: "/" });
  }
};

export const getTemplateLastVisited = (id: number): string | null => {
  const cookies = getTemplateLastVisitedCookies();
  if (!isNil(cookies[`${id}`])) {
    if (typeof cookies[`${id}`] === "string" && isTemplateRelatedUrl(cookies[`${id}`], id)) {
      return cookies[`${id}`];
    }
  }
  return null;
};
