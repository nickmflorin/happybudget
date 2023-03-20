import * as rows from "./rows";
import * as table from "./table";

export type ShareConfig<
  T extends Model.PublicHttpModel,
  R extends rows.Row,
  M extends Model.RowHttpModel,
> = {
  readonly instance: T;
  readonly table: table.TableInstance<R, M>;
  readonly onCreated?: (token: Model.PublicToken) => void;
  readonly onUpdated?: (token: Model.PublicToken) => void;
  readonly onDeleted?: () => void;
  readonly create: (
    id: number,
    payload: Http.PublicTokenPayload,
    options: Http.RequestOptions,
  ) => Promise<Model.PublicToken>;
};
