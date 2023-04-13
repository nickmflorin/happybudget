import * as rows from "./rows";
import * as types from "./types";

export interface ITableApis<R extends rows.Row> {
  readonly store: Partial<types.TableApiSet<R>>;
  readonly get: <G extends types.GridId>(id: G) => types.TableApiSet<R>[G] | null;
  readonly gridMap: (callback: (api: types.GridApi<R>) => void) => void;
  readonly columnMap: (callback: (api: types.ColumnApi) => void) => void;
  readonly set: <G extends types.GridId>(id: G, apis: types.TableApiSet<R>[G]) => void;
  readonly clone: () => ITableApis<R>;
  readonly gridApis: types.GridApi<R>[];
  readonly columnApis: types.ColumnApi[];
}

export default class TableApis<R extends rows.Row> implements ITableApis<R> {
  public store: types.TableApiSet<R>;

  constructor(config: Partial<types.TableApiSet<R>>) {
    /* We do this so we don't always have to provide the `primary` ID and the `footer` ID since they
       are common for all table APIs. */
    this.store = {
      ...types.GridIds.__ALL__.reduce(
        (prev: types.TableApiSet<R>, id: types.GridId) => ({ ...prev, [id]: null }),
        {} as types.TableApiSet<R>,
      ),
      ...config,
    };
  }

  public get = <G extends types.GridId>(id: G): types.TableApiSet<R>[G] | null => {
    const apis: types.TableApiSet<R>[G] | undefined = this.store[id];
    if (apis === undefined) {
      throw new Error(`types.APIs not configured for Grid ID ${id}!`);
    }
    return apis;
  };

  public set = <G extends types.GridId>(id: G, apis: types.TableApiSet<R>[G]) => {
    this.store[id] = apis;
  };

  public gridMap = (callback: (api: types.GridApi<R>) => void) =>
    this.gridApis.map((api: types.GridApi<R>) => callback(api));

  public columnMap = (callback: (api: types.ColumnApi) => void) =>
    this.columnApis.map((api: types.ColumnApi) => callback(api));

  public clone = (): ITableApis<R> => new TableApis<R>({ ...this.store });

  public get gridApis(): types.GridApi<R>[] {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const self = this;
    const ids: types.GridId[] = Object.keys(this.store) as types.GridId[];
    return ids.reduce((grids: types.GridApi<R>[], id: types.GridId): types.GridApi<R>[] => {
      const apis = self.get<typeof id>(id);
      if (apis !== null) {
        return [...grids, apis.grid];
      }
      return grids;
    }, []);
  }

  public get columnApis() {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const self = this;
    const ids: types.GridId[] = Object.keys(this.store) as types.GridId[];
    return ids.reduce((columns: types.ColumnApi[], id: types.GridId) => {
      const apis = self.get(id);
      if (apis !== null) {
        return [...columns, apis.column];
      }
      return columns;
    }, []);
  }
}
