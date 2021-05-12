import { isNil, map, filter } from "lodash";

export const createBulkCreatePayload = <
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  /* eslint-disable indent */
  models: M[],
  count: number,
  autoIndex?: boolean
): Http.BulkCreatePayload<{ identifier?: string }> => {
  if (autoIndex === true) {
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
  } else {
    return { count };
  }
};
