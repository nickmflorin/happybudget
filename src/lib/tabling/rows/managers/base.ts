import * as ids from "../ids";

export type CreateRowConfig<RW extends Table.Row<R>, R extends Table.RowData> = {
  readonly id: RW["id"];
};

export type RowManagerConfig<RW extends Table.Row<R>, R extends Table.RowData> = {
  readonly rowType: RW["rowType"];
  readonly gridId: RW["gridId"];
};

abstract class RowManager<RW extends Table.Row<R>, R extends Table.RowData> {
  public rowType: RW["rowType"];
  public gridId: RW["gridId"];

  constructor(config: RowManagerConfig<RW, R>) {
    this.rowType = config.rowType;
    this.gridId = config.gridId;
  }

  public createBasic(config: CreateRowConfig<RW, R>): Pick<RW, "id" | "rowType" | "gridId"> {
    return {
      id: config.id,
      rowType: this.rowType,
      gridId: this.gridId
    };
  }
}

export const createRow = <RW extends Table.Row<R>, R extends Table.RowData>(
  config: RowManagerConfig<RW, R> & CreateRowConfig<RW, R>
): Pick<RW, "id" | "rowType" | "gridId"> => {
  return {
    id: config.id,
    rowType: config.rowType,
    gridId: config.gridId
  };
};

export const createFooterRow = <Grid extends Table.FooterGridId = Table.FooterGridId>(
  config: Omit<RowManagerConfig<Table.FooterRow<Grid>, Table.RowData>, "rowType">
): Table.FooterRow =>
  createRow<Table.FooterRow, Table.RowData>({
    ...config,
    rowType: "footer",
    id: ids.footerRowId(config.gridId)
  });

export default RowManager;
