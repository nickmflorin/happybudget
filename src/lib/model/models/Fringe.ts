import Model from "./Model";

export default class Fringe extends Model implements Model.Fringe {
  public readonly created_at: string = "";
  public readonly updated_at: string = "";
  public readonly created_by: number | null = null;
  public readonly updated_by: number | null = null;
  public readonly color: string | null = null;
  public readonly name: string | null = null;
  public readonly description: string | null = null;
  public readonly rate: number | null = null;
  public readonly unit: Model.FringeUnit | null = null;
  public readonly cutoff: number | null = null;

  constructor(data: Model.Fringe) {
    super(data);
    this.update(data);
  }
}
