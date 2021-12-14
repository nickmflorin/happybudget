declare namespace Table {
  type GetRowStyle = (params: RowClassParams) => import("react").CSSProperties | null | undefined;

  type RowClassParams = import("@ag-grid-community/core").RowClassParams;
  type RowClassName = ClassName<import("@ag-grid-community/core").RowClassParams>;
  type GetRowClassName = (params: RowClassParams) => RowClassName;

  interface RowColorDef {
    readonly backgroundColor?: string;
    readonly color?: string;
  }

  type PreviousValues<T> = [T, T] | [T];

  type DataRowType = "placeholder" | "model";

  type EditableRowType = "model" | "markup";
  type BodyRowType = DataRowType | "group" | "markup";
  type RowType = BodyRowType | "footer";

  type ModelRowId = number;
  type FooterRowId = `footer-${FooterGridId}`;
  type PlaceholderRowId = `placeholder-${number}`;
  type GroupRowId = `group-${number}`;
  type MarkupRowId = `markup-${number}`;

  type DataRowId = ModelRowId | PlaceholderRowId;
  type EditableRowId = ModelRowId | MarkupRowId;
  type NonPlaceholderBodyRowId = EditableRowId | GroupRowId;
  type BodyRowId = NonPlaceholderBodyRowId | PlaceholderRowId;

  type RowId = BodyRowId | FooterRowId;

  type RowNameLabelType = number | string | null;

  type RowStringGetter<R extends Row> = RowNameLabelType | FnWithTypedArgs<RowNameLabelType, [R]>;

  type RowData = object;

  type IRow<RId extends RowId, TP extends RowType, Grid extends GridId = GridId> = {
    readonly id: RId;
    readonly rowType: TP;
    readonly gridId: Grid;
  };

  type IBodyRow<RId extends RowId, TP extends BodyRowType, D extends RowData> = IRow<RId, TP, "data"> & {
    readonly data: D;
  };

  type FooterRow<Grid extends FooterGridId = FooterGridId> = IRow<FooterRowId, "footer", Grid>;

  type ModelRow<R extends RowData> = IBodyRow<ModelRowId, "model", R> & {
    readonly children: number[];
    readonly order: string;
  };

  type PlaceholderRow<R extends RowData> = IBodyRow<PlaceholderRowId, "placeholder", R> & {
    readonly children: [];
  };

  type GroupRow<R extends RowData> = IBodyRow<GroupRowId, "group", R> & {
    readonly children: number[];
    readonly groupData: Pick<Model.Group, "name" | "color">;
  };

  type MarkupRow<R extends RowData> = IBodyRow<MarkupRowId, "markup", R> & {
    readonly children: number[];
    readonly markupData: Pick<Model.Markup, "unit" | "rate">;
  };

  type DataRow<D extends RowData> = ModelRow<D> | PlaceholderRow<D>;
  type EditableRow<D extends RowData> = ModelRow<D> | MarkupRow<D>;

  type NonPlaceholderBodyRow<D extends RowData> = ModelRow<D> | MarkupRow<D> | GroupRow<D>;

  type BodyRow<D extends RowData = RowData> = ModelRow<D> | PlaceholderRow<D> | GroupRow<D> | MarkupRow<D>;
  type Row<D extends RowData = RowData> = BodyRow<D> | FooterRow;

  type RowWithColor<D extends RowData = RowData> = BodyRow<D & { color: Style.HexColor | null }>;

  type RowWithName<D extends RowData = RowData> = BodyRow<D & { name: string | null }>;

  type RowWithDescription<D extends RowData = RowData> = BodyRow<D & { description: string | null }>;

  type RowWithIdentifier<D extends RowData = RowData> = BodyRow<D & { identifier: string | null }>;
}
