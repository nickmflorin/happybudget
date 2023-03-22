import { orderBy as rootOrderBy, sortBy, findIndex } from "lodash";
import { Moment } from "moment";

import { type Ordering, type FieldOrder } from "api";

import { dates } from "../util";

import { ApiModel } from "./types";
import { User } from "./user";

/**
 * Orders the array of models by the fields defined in the ordering array, {@link Ordering<F>}, with
 * additional functionality pertinent to models received from an API response.
 *
 * The purpose of this utility is to be used in cases where we need to add, update or remove
 * elements from state and maintain the ordering of those elements in state.
 *
 * The utility implements important functionality regarding date valued fields. When determining
 * what values to use for ordering the models by the fields in the ordering, the logic will use a
 * Moment value for any string that can be converted to a valid date.
 *
 * @param {M[]} data The array of models that should be ordered.
 *
 * @param {Ordering<F>} ordering
 *   The ordering array corresponding to the fields of the provided models.
 *
 * @param {User | null} user
 *   The user in state.  This is optional but should be provided in the case that there is an
 *   authenticated user such that any valid date string values on the model are converted to dates
 *   in the user's timezone.
 *
 * @returns {M[]} The provided array of models ordered by the provided ordering array.
 */
export const orderModelsBy = <M extends ApiModel, F extends string & keyof M>(
  data: M[],
  ordering: Ordering<F>,
  user?: User | null,
): M[] => {
  // We are only concerned with fields in the ordering that have a non-0 order.
  const fields = ordering
    .filter((o: FieldOrder<F>) => o.order !== 0)
    .map((o: FieldOrder<F>) => o.field);

  /* The lodash orderBy method requires that we specify the ordering as "asc" or "desc". */
  const directions: ("asc" | "desc")[] = ordering
    .filter((o: FieldOrder<F>) => o.order !== 0)
    .map((o: FieldOrder<F>) => (o.order === 1 ? "asc" : "desc"));

  /* A model that is comprised of the numeric ID and any field-value pairs indicated by the fields
     of the ordering. */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  // type ModelFromOrderedFields = HttpModel & { [key in F]: any };

  type ModelWithOrderableFields = { id: M["id"] } & { [key in F]: M[key] | Moment };

  /* Using each provided original model and the fields in the provided ordering,
     create a new object that contains the ID of the original model and the
     field-value pairs for only the fields defined in the ordering. */

  /* For each provided model, construct a new model that consists of the id of the original model
     and its associated fields that are in the ordering array. */
  const models = data.reduce(
    (prev: ModelWithOrderableFields[], m: M): ModelWithOrderableFields[] => [
      ...prev,
      fields.reduce(
        (prevModel: ModelWithOrderableFields, f: F): ModelWithOrderableFields => {
          const v = m[f as keyof M];
          /* If the value of the model field can be treated as a date, we should convert it to a
             date such that the Moment object is what the field is ordered by. */
          if (typeof v === "string") {
            const vAsDate = dates.toLocalizedMoment(v, {
              warnOnInvalid: false,
              tz: user?.timezone,
            });
            if (vAsDate !== undefined) {
              return { ...prevModel, [f]: vAsDate };
            }
          }
          return { ...prevModel, [f]: v };
        },
        { id: m.id } as ModelWithOrderableFields,
      ),
    ],
    [],
  );

  // Order the models that consist of only the fields in the ordering and the original IDs.
  const orderedFieldModels = rootOrderBy(models, fields, directions);
  // Sort the original models by the location of the corresponding ID in the ordered field models.
  return sortBy(data, (m: M) =>
    findIndex(orderedFieldModels, (oM: ModelWithOrderableFields) => oM.id === m.id),
  );
};
