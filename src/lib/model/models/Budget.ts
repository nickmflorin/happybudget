import { map } from "lodash";

import * as services from "api/services";

import BudgetAccount, { TemplateAccount } from "./Account";
import Fringe from "./Fringe";
import BudgetGroup, { TemplateGroup } from "./Group";
import BaseModel from "./Model";
import Model from "./Model";

abstract class BaseBudget extends BaseModel {
  public readonly name: string = "";
  public readonly type: Model.BudgetType = "budget";
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly created_by: number;
  public readonly updated_by: number | null = null;
  public readonly image: string | null = null;

  constructor(data: Model.BaseBudget) {
    super(data);
    this.created_by = data.created_by;
  }
}

export class SimpleBudget extends BaseBudget implements Model.ISimpleBudget {
  public readonly type: "budget" = "budget";
}

export class SimpleTemplate extends BaseBudget implements Model.ISimpleTemplate {
  public readonly type: "template" = "template";
}

export default class Budget extends SimpleBudget implements Model.IBudget {
  public readonly name: string = "";
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly created_by: number;
  public readonly updated_by: number | null = null;
  public readonly image: string | null = null;
  public readonly project_number: number = 0;
  public readonly production_type: Model.ProductionType = {
    id: 0,
    name: "Film"
  };
  public readonly shoot_date: string = "";
  public readonly delivery_date: string = "";
  public readonly build_days: number = 0;
  public readonly prelight_days: number = 0;
  public readonly studio_shoot_days: number = 0;
  public readonly location_days: number = 0;
  public readonly actual: number | null = null;
  public readonly variance: number | null = null;
  public readonly estimated: number | null = null;

  constructor(data: Model.Budget) {
    super(data);
    this.created_by = data.created_by;
    this.update(data);
  }

  public static instantiateEmpty() {
    throw new Error("Not implemented.");
  }

  public static create = async (
    payload: Http.BudgetPayload | FormData,
    options: Http.RequestOptions = {}
  ): Promise<Budget> => {
    return services.createBudget(payload, options).then((response: Model.Budget) => new Budget(response));
  };

  public static retrieve = async (id: number, options: Http.RequestOptions = {}): Promise<Budget> => {
    return services.getBudget(id, options).then((m: Model.Budget) => new Budget(m));
  };

  public refresh = async (options: Http.RequestOptions = {}): Promise<void> => {
    const m: Budget = await Budget.retrieve(this.id, options);
    this.update(m);
  };

  public patch = async (
    payload: Partial<Http.BudgetPayload> | FormData,
    options: Http.RequestOptions = {}
  ): Promise<Model.Budget> => {
    return services.updateBudget(this.id, payload, options).then((m: Model.Budget) => {
      this.update(m);
      return m;
    });
  };

  public static list = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<SimpleBudget>> => {
    return services.getBudgets(query, options).then((response: Http.ListResponse<Model.SimpleBudget>) => ({
      ...response,
      data: map(response.data, (m: Model.SimpleBudget) => new SimpleBudget(m))
    }));
  };

  public getPdf = async (options: Http.RequestOptions = {}): Promise<any> => {
    return services.getBudgetPdf(this.id, options);
  };

  public getAccounts = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<BudgetAccount>> => {
    return services
      .getBudgetAccounts(this.id, query, options)
      .then((response: Http.ListResponse<Model.BudgetAccount>) => ({
        ...response,
        data: map(response.data, (m: Model.BudgetAccount) => new BudgetAccount(m))
      }));
  };

  public createAccount = async (
    payload: Http.BudgetAccountPayload,
    options: Http.RequestOptions = {}
  ): Promise<BudgetAccount> => {
    return services
      .createBudgetAccount(this.id, payload, options)
      .then((response: Model.BudgetAccount) => new BudgetAccount(response));
  };

  public getFringes = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<Fringe>> => {
    return services.getBudgetFringes(this.id, query, options).then((response: Http.ListResponse<Model.Fringe>) => ({
      ...response,
      data: map(response.data, (m: Model.Fringe) => new Fringe(m))
    }));
  };

  public createFringe = async (payload: Http.FringePayload, options: Http.RequestOptions = {}) => {
    return services
      .createBudgetFringe(this.id, payload, options)
      .then((response: Model.Fringe) => new Fringe(response));
  };

  public getAccountGroups = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<BudgetGroup>> => {
    return services
      .getBudgetAccountGroups(this.id, query, options)
      .then((response: Http.ListResponse<Model.BudgetGroup>) => ({
        ...response,
        data: map(response.data, (m: Model.BudgetGroup) => new BudgetGroup(m))
      }));
  };

  public createAccountGroup = async (
    payload: Http.GroupPayload,
    options: Http.RequestOptions = {}
  ): Promise<BudgetGroup> => {
    return services
      .createBudgetAccountGroup(this.id, payload, options)
      .then((response: Model.BudgetGroup) => new BudgetGroup(response));
  };
}

export class Template extends SimpleTemplate implements Model.ITemplate {
  public readonly name: string = "";
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly created_by: number;
  public readonly image: string | null = null;
  public readonly estimated: number | null = null;

  constructor(data: Model.Template) {
    super(data);
    this.created_by = data.created_by;
    this.update(data);
  }

  public static create = async (
    payload: Http.TemplatePayload | FormData,
    options: Http.RequestOptions = {}
  ): Promise<Template> => {
    return services.createTemplate(payload, options).then((response: Model.Template) => new Template(response));
  };

  public static retrieve = async (id: number, options: Http.RequestOptions = {}): Promise<Template> => {
    return services.getTemplate(id, options).then((m: Model.Template) => new Template(m));
  };

  public refresh = async (options: Http.RequestOptions = {}): Promise<void> => {
    const m: Template = await Template.retrieve(this.id, options);
    this.update(m);
  };

  public patch = async (
    payload: Partial<Http.TemplatePayload> | FormData,
    options: Http.RequestOptions = {}
  ): Promise<Model.Template> => {
    return services.updateTemplate(this.id, payload, options).then((m: Model.Template) => {
      this.update(m);
      return m;
    });
  };

  public static list = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<SimpleTemplate>> => {
    return services.getTemplates(query, options).then((response: Http.ListResponse<Model.SimpleTemplate>) => ({
      ...response,
      data: map(response.data, (m: Model.SimpleTemplate) => new SimpleTemplate(m))
    }));
  };

  public getAccounts = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<TemplateAccount>> => {
    return services
      .getTemplateAccounts(this.id, query, options)
      .then((response: Http.ListResponse<Model.TemplateAccount>) => ({
        ...response,
        data: map(response.data, (m: Model.TemplateAccount) => new TemplateAccount(m))
      }));
  };

  public createAccount = async (
    payload: Http.TemplateAccountPayload,
    options: Http.RequestOptions = {}
  ): Promise<TemplateAccount> => {
    return services
      .createTemplateAccount(this.id, payload, options)
      .then((response: Model.TemplateAccount) => new TemplateAccount(response));
  };

  public getFringes = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<Fringe>> => {
    return services.getTemplateFringes(this.id, query, options).then((response: Http.ListResponse<Model.Fringe>) => ({
      ...response,
      data: map(response.data, (m: Model.Fringe) => new Fringe(m))
    }));
  };

  public createFringe = async (payload: Http.FringePayload, options: Http.RequestOptions = {}) => {
    return services
      .createTemplateFringe(this.id, payload, options)
      .then((response: Model.Fringe) => new Fringe(response));
  };

  public getAccountGroups = async (
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<TemplateGroup>> => {
    return services
      .getBudgetAccountGroups(this.id, query, options)
      .then((response: Http.ListResponse<Model.TemplateGroup>) => ({
        ...response,
        data: map(response.data, (m: Model.TemplateGroup) => new TemplateGroup(m))
      }));
  };

  public createAccountGroup = async (
    payload: Http.GroupPayload,
    options: Http.RequestOptions = {}
  ): Promise<TemplateGroup> => {
    return services
      .createBudgetAccountGroup(this.id, payload, options)
      .then((response: Model.TemplateGroup) => new TemplateGroup(response));
  };
}
