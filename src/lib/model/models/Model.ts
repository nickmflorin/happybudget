import { BaseModel } from "sjs-base-model";
import { generateRandomNumericId } from "lib/util";

export default class Model extends BaseModel implements Model.Model {
  public readonly id: number;

  constructor(data: Partial<Model>) {
    super();
    this.id = generateRandomNumericId(); // Will be overwritten if present.
    this.update(data);
  }

  public update(data: Partial<Model>): void {
    super.update(data);
  }
}
