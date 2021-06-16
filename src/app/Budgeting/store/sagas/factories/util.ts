import { isNil, map, filter } from "lodash";
import { RowManager } from "lib/model";

type AutoIndexParams<M extends Model.Model & { identifier: any }> = {
  models: M[];
  autoIndex: boolean;
};

export const createBulkCreatePayload = <
  R extends Table.Row,
  P extends Http.ModelPayload<M>,
  M extends Model.Model & { identifier: any } = any
>(
  /* eslint-disable indent */
  actionPayload: Table.RowAddPayload<R>,
  manager: RowManager<R, any, any>,
  autoIndexParams?: AutoIndexParams<M>
) => {
  let payload: Http.BulkCreatePayload<P>;
  if (!isNil(autoIndexParams) && autoIndexParams.autoIndex === true && typeof actionPayload === "number") {
    payload = createAutoIndexedBulkCreatePayload(actionPayload, autoIndexParams.models) as Http.BulkCreatePayload<P>;
  } else if (typeof actionPayload === "number") {
    payload = { count: actionPayload };
  } else if (!Array.isArray(actionPayload)) {
    payload = { data: [manager.payload(actionPayload)] };
  } else {
    payload = { data: map(actionPayload, (r: Partial<R>) => manager.payload(r)) };
  }
  return payload;
};

export const createAutoIndexedBulkCreatePayload = <M extends Model.Model & { identifier: any }>(
  /* eslint-disable indent */
  count: number,
  models: M[]
): Http.BulkCreatePayload<{ identifier?: string }> => {
  const converter = (model: M): number | null => {
    if (!isNil(model.identifier) && !isNaN(parseInt(model.identifier))) {
      return parseInt(model.identifier);
    }
    return null;
  };
  const numericIdentifiers: number[] = filter(
    map(models, converter),
    (identifier: number | null) => identifier !== null
  ) as number[];
  // Apparently, Math.max() (no arguments) is not 0, it is -Infinity.  Dumb
  const baseIndex = numericIdentifiers.length === 0 ? 0 : Math.max(...numericIdentifiers);
  return {
    data: Array(count)
      .fill(0)
      .map((_, i: number) => ({ identifier: String(baseIndex + i + 1) }))
  };
};
