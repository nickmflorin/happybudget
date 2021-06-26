import Model from "./Model";

abstract class Group extends Model implements Model.Group {
  public readonly children: number[] = [];
  public readonly name: string = "";
  public readonly color: string | null = null;
  public readonly estimated: number = 0.0;
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly created_by: number | null = null;
  public readonly updated_by: number | null = null;

  constructor(data: Model.Group) {
    super(data);
    this.update(data);
  }
}

export class TemplateGroup extends Group implements Model.TemplateGroup {
  constructor(data: Model.TemplateGroup) {
    super(data);
    this.update(data);
  }
}

export default class BudgetGroup extends Group implements Model.BudgetGroup {
  public readonly variance: number = 0.0;
  public readonly actual: number = 0.0;

  constructor(data: Model.BudgetGroup) {
    super(data);
    this.update(data);
  }
}
