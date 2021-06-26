import Model from "./Model";

export class SimpleAccount extends Model implements Model.SimpleAccount {
  public readonly identifier: string | null = null;
  public readonly type: "account" = "account";
  public readonly description: string | null = null;

  constructor(data: Model.SimpleAccount) {
    super(data);
    this.update(data);
  }
}

export class Account extends SimpleAccount implements Model.Account {
  public readonly access: number[] = [];
  public readonly ancestors: Model.Entity[] = [];
  public readonly estimated: number = 0.0;
  public readonly subaccounts: number[] = [];
  public readonly group: number | null = null;
  public readonly siblings: Model.SimpleAccount[] = [];
  public readonly budget: number;
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly created_by: number | null = null;
  public readonly updated_by: number | null = null;

  constructor(data: Model.Account) {
    super(data);
    this.budget = data.budget;
    this.update(data);
  }
}

export class TemplateAccount extends Account implements Model.TemplateAccount {
  constructor(data: Model.TemplateAccount) {
    super(data);
    this.update(data);
  }
}

export default class BudgetAccount extends Account implements Model.BudgetAccount {
  public readonly variance: number = 0.0;
  public readonly actual: number = 0.0;

  constructor(data: Model.BudgetAccount) {
    super(data);
    this.update(data);
  }
}
