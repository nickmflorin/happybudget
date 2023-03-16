import { isNil, map, reduce } from "lodash";

const GridIds: Table.GridId[] = ["page", "footer", "data"];

export default class TableApis implements Table.ITableApis {
  public store: Partial<Table.TableApiSet>;

  constructor(config: Partial<Table.TableApiSet>) {
    /*
		We do this so we don't always have to provide the `primary` ID and the
    `footer` ID since they are common for all table APIs. */
    this.store = {
      ...reduce(
        GridIds,
        (prev: Partial<Table.TableApiSet>, id: Table.GridId) => ({ ...prev, [id]: null }),
        {},
      ),
      ...config,
    };
  }

  public get = (id: Table.GridId): Table.GridApis | null => {
    const apis: Table.GridApis | null | undefined = this.store[id];
    if (apis === undefined) {
      throw new Error(`Table APIs not configured for Grid ID ${id}!`);
    }
    return apis;
  };

  public set = (id: Table.GridId, apis: Table.GridApis) => {
    this.store[id] = apis;
  };

  public gridMap = (callback: (api: Table.GridApi) => void) =>
    map(this.gridApis, (api: Table.GridApi) => callback(api));

  public columnMap = (callback: (api: Table.ColumnApi) => void) =>
    map(this.columnApis, (api: Table.ColumnApi) => callback(api));

  public clone = (): TableApis => new TableApis({ ...this.store });

  public get gridApis(): Table.GridApi[] {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const self = this;
    const ids: Table.GridId[] = Object.keys(this.store) as Table.GridId[];
    return reduce(
      ids,
      (grids: Table.GridApi[], id: Table.GridId) => {
        const apis = self.get(id);
        if (!isNil(apis)) {
          return [...grids, apis.grid];
        }
        return grids;
      },
      [],
    );
  }

  public get columnApis() {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const self = this;
    const ids: Table.GridId[] = Object.keys(this.store) as Table.GridId[];
    return reduce(
      ids,
      (columns: Table.ColumnApi[], id: Table.GridId) => {
        const apis = self.get(id);
        if (!isNil(apis)) {
          return [...columns, apis.column];
        }
        return columns;
      },
      [],
    );
  }
}
