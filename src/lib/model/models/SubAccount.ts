import Model from "./Model";

export class SimpleSubAccount extends Model implements Model.SimpleSubAccount {
  public readonly name: string | null = null;
  public readonly identifier: string | null = null;
  public readonly type: "subaccount" = "subaccount";
  public readonly description: string | null = null;

  constructor(data: Model.SimpleSubAccount) {
    super(data);
    this.update(data);
  }
}

export class SubAccount extends SimpleSubAccount implements Model.SubAccount {
  public readonly quantity: number | null = null;
  public readonly rate: number | null = null;
  public readonly multiplier: number | null = null;
  public readonly unit: Model.Tag | null = null;
  public readonly object_id: number;
  public readonly parent_type: "account" | "subaccount";
  public readonly estimated: number = 0.0;
  public readonly group: number | null = null;
  public readonly fringes: number[] = [];
  public readonly subaccounts: number[] = [];
  public readonly siblings: Model.SimpleSubAccount[] = [];
  public readonly ancestors: Model.Entity[] = [];
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly created_by: number | null = null;
  public readonly updated_by: number | null = null;

  constructor(data: Model.SubAccount) {
    super(data);
    this.parent_type = data.parent_type;
    this.object_id = data.object_id;
    this.update(data);
  }
}

export class TemplateSubAccount extends SubAccount implements Model.TemplateSubAccount {
  constructor(data: Model.TemplateSubAccount) {
    super(data);
    this.update(data);
  }
}

export default class BudgetSubAccount extends SubAccount implements Model.BudgetSubAccount {
  public readonly variance: number = 0.0;
  public readonly actual: number = 0.0;

  constructor(data: Model.BudgetSubAccount) {
    super(data);
    this.update(data);
  }
}
