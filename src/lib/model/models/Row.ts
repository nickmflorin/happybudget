import { generateRandomNumericId } from "lib/util";
import BaseModel from "./Model";

type RowType = "model" | "groupFooter" | "tableFooter";

interface IRow extends Model.Model {
  readonly type: RowType;
}

interface IRowConfig {}

interface IModelRowConfig<M extends Model.Model> extends IRowConfig {
  readonly getModelChildren: (m: M) => number[];
}

interface IModelRow<M extends Model.Model> extends IRow {
  readonly model: M;
  readonly getModelChildren: () => number[];
}

class PlaceholderRow extends BaseModel {}

class RowConfig {}

class ModelRowConfig<M extends Model.Model> extends RowConfig implements IModelRowConfig<M> {
  public readonly getModelChildren: (m: M) => number[] = (m: M) => [];
}

interface RowInitData<T extends RowType, C extends IRowConfig = IRowConfig> {
  readonly type: T;
  readonly config: C;
}

abstract class Row<T extends RowType, C extends RowConfig = RowConfig> implements IRow {
  public readonly id: number;
  public readonly type: T;
  public readonly config: C;

  constructor(data: RowInitData<T, C>) {
    this.id = generateRandomNumericId();
    this.config = data.config;
    this.type = data.type;
  }
}

class GroupFooterRow extends Row<"groupFooter"> {
  constructor(data: Omit<RowInitData<"groupFooter">, "type">) {
    super({ ...data, type: "groupFooter" });
  }
}

class TableFooterRow extends Row<"tableFooter"> {
  constructor(data: Omit<RowInitData<"tableFooter">, "type">) {
    super({ ...data, type: "tableFooter" });
  }
}

interface ModelRowInitData<M extends Model.Model> extends RowInitData<"model", IModelRowConfig<M>> {
  readonly model: M;
}

class ModelRow<M extends Model.Model> extends Row<"model", ModelRowConfig<M>> implements IModelRow<M> {
  public readonly model: M;
  public readonly errors: Table.CellError[] = [];
  public readonly type: "model" = "model";

  constructor(data: Omit<ModelRowInitData<M>, "type">) {
    super({ ...data, type: "model" });
    this.model = data.model;
  }

  public getModelChildren = (): number[] => {
    return this.config.getModelChildren(this.model);
  };
}

interface TableConfigData<M extends Model.Model> {}

interface ITableConfig<M extends Model.Model> {
  readonly getModelChildren: (m: M) => number[];
}

class TableConfig<M extends Model.Model> implements ITableConfig<M> {
  public readonly getModelChildren: (m: M) => number[] = (m: M) => [];

  constructor(data: ITableConfig<M>) {
    this.getModelChildren = data.getModelChildren;
  }
}
