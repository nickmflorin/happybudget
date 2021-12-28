import { isNil } from "lodash";
import Cookies from "universal-cookie";
import { budgeting } from "lib";

type Designation = "budgets" | "templates";

type BaseUrl<D extends Designation = Designation> = `/${D}/${number}`;
type AccountsUrl<D extends Designation = Designation> = `/${D}/${number}/accounts`;
type AccountUrl<D extends Designation = Designation> = `/${D}/${number}/accounts/${number}`;
type SubAccountUrl<D extends Designation = Designation> = `/${D}/${number}/subaccounts/${number}`;

type BudgetingUrl<D extends Designation = Designation> = AccountsUrl<D> | AccountUrl<D> | SubAccountUrl<D>;

type BudgetBaseUrl = BaseUrl<"budgets">;
type BudgetUrl = BudgetingUrl<"budgets">;
type TemplateBaseUrl = BaseUrl<"templates">;
type TemplateUrl = BudgetingUrl<"templates">;

type ModelIdAndType<T extends Model.GenericHttpModel<"budget" | "account" | "subaccount">> = Pick<T, "type" | "id">;

export const getBudgetUrl = (
  budget: Pick<Model.Budget, "type" | "domain" | "id">,
  entity?:
    | ModelIdAndType<Model.Account>
    | ModelIdAndType<Model.SimpleAccount>
    | ModelIdAndType<Model.SubAccount>
    | ModelIdAndType<Model.SimpleSubAccount>
    | "base"
): BudgetUrl | BudgetBaseUrl => {
  if (entity === "base") {
    return `/budgets/${budget.id}`;
  } else if (isNil(entity)) {
    return `/budgets/${budget.id}/accounts`;
  } else if (budgeting.typeguards.isAccount(entity)) {
    return `/budgets/${budget.id}/accounts/${entity.id}`;
  } else {
    return `/budgets/${budget.id}/subaccounts/${entity.id}`;
  }
};

export const getTemplateUrl = (
  budget: Pick<Model.Template, "type" | "domain" | "id">,
  entity?:
    | ModelIdAndType<Model.Account>
    | ModelIdAndType<Model.SimpleAccount>
    | ModelIdAndType<Model.SubAccount>
    | ModelIdAndType<Model.SimpleSubAccount>
    | "base"
): TemplateUrl | TemplateBaseUrl => {
  if (entity === "base") {
    return `/templates/${budget.id}`;
  } else if (isNil(entity)) {
    return `/templates/${budget.id}/accounts`;
  } else if (budgeting.typeguards.isAccount(entity)) {
    return `/templates/${budget.id}/accounts/${entity.id}`;
  } else {
    return `/templates/${budget.id}/subaccounts/${entity.id}`;
  }
};

export const getUrl = (
  budget: Pick<Model.Template, "type" | "domain" | "id"> | Pick<Model.Budget, "type" | "domain" | "id">,
  entity?:
    | ModelIdAndType<Model.Account>
    | ModelIdAndType<Model.SimpleAccount>
    | ModelIdAndType<Model.SubAccount>
    | ModelIdAndType<Model.SimpleSubAccount>
    | "base"
): BudgetUrl | BudgetBaseUrl | TemplateUrl | TemplateBaseUrl =>
  budgeting.typeguards.isBudget(budget) ? getBudgetUrl(budget, entity) : getTemplateUrl(budget, entity);

type PluggableID = ID | "([0-9]+)";

export const isAccountsUrl = <D extends Designation = Designation>(
  url: string,
  designation: D | "templates|budgets" = "templates|budgets",
  id: PluggableID = "([0-9]+)"
): url is AccountsUrl<D> => {
  const regex = new RegExp(`^/${designation}/${id}/accounts/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isAccountUrl = <D extends Designation = Designation>(
  url: string,
  designation: D | "templates|budgets" = "templates|budgets",
  id: PluggableID = "([0-9]+)"
): url is AccountUrl<D> => {
  const regex = new RegExp(`^/${designation}/${id}/accounts/([0-9]+)/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isSubAccountUrl = <D extends Designation = Designation>(
  url: string,
  designation: D | "templates|budgets" = "templates|budgets",
  id: PluggableID = "([0-9]+)"
): url is SubAccountUrl<D> => {
  const regex = new RegExp(`^/${designation}/${id}/subaccounts/([0-9]+)/?$`);
  return url.match(regex) !== null ? true : false;
};

export const isBudgetRelatedUrl = (url: string, id: PluggableID = "([0-9]+)"): url is BudgetUrl =>
  isSubAccountUrl(url, "budgets", id) || isAccountUrl(url, "budgets", id) || isAccountsUrl(url, "budgets", id);

export const isTemplateRelatedUrl = (url: string, id: PluggableID = "([0-9]+)"): boolean =>
  isSubAccountUrl(url, "templates", id) || isAccountUrl(url, "templates", id) || isAccountsUrl(url, "templates", id);

const getLastVisitedCookies = (designation: Designation): Record<string, unknown> => {
  const cookies = new Cookies();
  const lastVisited = cookies.get(`${designation}-last-visited`);
  if (typeof lastVisited !== "object") {
    cookies.remove(`${designation}-last-visited`);
    return {};
  }
  return lastVisited;
};

export const getLastVisited = (designation: Designation, id: ID): string | null => {
  const cookies = getLastVisitedCookies(designation);
  if (!isNil(cookies[`${id}`])) {
    if (
      (typeof cookies[`${id}`] === "string" &&
        designation === "budgets" &&
        isBudgetRelatedUrl(cookies[`${id}`] as string, id)) ||
      (designation === "templates" && isTemplateRelatedUrl(cookies[`${id}`] as string, id))
    ) {
      return cookies[`${id}`] as string;
    }
  }
  return null;
};

export const setLastVisited = (
  budget: Model.Budget | Model.Template,
  entity?: Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
): void => {
  const designation: Designation = budgeting.typeguards.isBudget(budget) ? "budgets" : "templates";
  const urlCookies = getLastVisitedCookies(designation);
  const url = getUrl(budget, entity);
  urlCookies[budget.id] = url;
  const cookies = new Cookies();
  cookies.set(`${designation}-last-visited`, urlCookies);
};
