import { isNil, map, reduce, filter, orderBy as rootOrderBy, sortBy, findIndex } from "lodash";

import { util } from "lib";

/**
 * Orders the array of models by the Http.Ordering array with additional
 * functionality pertinent to models received from an API response.
 *
 * The purpose of this utility is to be used in cases where we need to add,
 * update or remove elements from state and maintain the ordering of those
 * elements in state.
 *
 * The utility implements important functionality regarding date valued fields.
 * When determining what values to use for ordering the models by the fields
 * in the ordering, the logic will use a Moment value for any string that
 * can be converted to a valid date.
 *
 * @param data The array of models that should be ordered.
 * @param ordering The Http.Ordering array corresponding to the fields of the
 *                 provided models.
 * @param user The user in state.  This is optional but should be provided in
 *             the case that there is an authenticated user such that any
 *             valid date string values on the model are converted to dates in
 *             the user's timezone.
 * @returns The provided array of models ordered by the provided ordering array.
 */
export const orderBy = <M extends Model.HttpModel, F extends string>(
  data: M[],
  ordering: Http.Ordering<F>,
  user?: Model.User | null
): M[] => {
  // We are only concerned with fields in the ordering that have a non-0 order.
  const fields = map(
    filter(ordering, (o: Http.FieldOrder<F>) => o.order !== 0),
    (o: Http.FieldOrder<F>) => o.field
  );

  /* The lodash orderBy method requires that we specify the ordering as "asc"
     or "desc". */
  const directions: ("asc" | "desc")[] = map(
    filter(ordering, (o: Http.FieldOrder<F>) => o.order !== 0),
    (o: Http.FieldOrder<F>) => (o.order === 1 ? "asc" : "desc")
  );

  /* A model that is comprised of the numeric ID and any field-value pairs
     indicated by the fields of the ordering. */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type ModelFromOrderedFields = Model.HttpModel & { [key in F]: any };

  /* Using each provided original model and the fields in the provided ordering,
     create a new object that contains the ID of the original model and the
     field-value pairs for only the fields defined in the ordering. */
  const models = reduce(
    data,
    (curr: ModelFromOrderedFields[], m: M) => [
      ...curr,
      reduce(
        fields,
        (currM: ModelFromOrderedFields, f: F) => {
          const v = m[f as keyof M];
          /* If the value of the model field can be treated as a date, we
               should convert it to a date such that the Moment object is what
               the field is ordered by. */
          if (!isNil(v) && typeof v === "string") {
            const vAsDate = util.dates.toLocalizedMoment(v, { warnOnInvalid: false, tz: user?.timezone });
            if (!isNil(vAsDate)) {
              return { ...currM, [f]: vAsDate };
            }
          }
          return { ...currM, [f]: v };
        },
        { id: m.id } as ModelFromOrderedFields
      )
    ],
    []
  );

  /* Order the models that are comprised of just the ordering fields by the
     fields in the ordering. */
  const orderedFieldModels = rootOrderBy(models, fields, directions);
  /* Sort the original models by the location of the corresponding ID in the
     ordered field models. */
  return sortBy(data, (m: M) => findIndex(orderedFieldModels, (oM: ModelFromOrderedFields) => oM.id === m.id));
};
