import { MultiValue, SingleValue } from "react-select";
import { find, map, filter } from "lodash";

export const toSelectModel = <M extends Model.Model>(m: ModelSelectOption<M>): SelectModel<M> =>
  !isNaN(parseInt(m.id)) ? ({ ...m, id: parseInt(m.id) } as M) : ({ ...m, id: m.id } as M);

export const toModelSelectOption = <M extends Model.Model>(m: SelectModel<M>): ModelSelectOption<M> => ({
  ...m,
  id: String(m.id)
});

type PresentFetch<M extends Model.Model> = { id: M["id"]; model: M };
type MissingFetch<M extends Model.Model> = { id: M["id"]; model: null };
type FetchedValue<M extends Model.Model> = MissingFetch<M> | PresentFetch<M>;

const isSelectOption = <M extends Model.Model>(m: M | ModelSelectOption<M>): m is ModelSelectOption<M> =>
  typeof m.id === "string";

/**
 * Converts the provided select value array in it's model form (i.e. a list of
 * model IDs that are not necessarily of type string) to the full Option type
 * required by react-select.
 *
 * To do this, we need to use the information in the associated set of data
 * to find the full model representations associated with each ID in the select
 * value array and then convert them to the full Option type.
 */
export const parseSingleModelSelectValues = <M extends Model.Model>(
  data: (M | ModelSelectOption<M>)[],
  value?: M["id"] | null
): SingleValue<ModelSelectOption<M>> => {
  const retrieve = (id: M["id"], dat: M[]): FetchedValue<M> => {
    const m: M | undefined = find(dat, (d: M) => d.id === id);
    return m === undefined ? { id, model: null } : { id, model: m };
  };

  const dataSource = map(data, (o: M | ModelSelectOption<M>) => (isSelectOption(o) ? toSelectModel(o) : o));

  if (value === undefined || value === null) {
    return null;
  }
  const retrieved: FetchedValue<M> = retrieve(value, dataSource);
  if (retrieved.model === null) {
    console.warn(
      `The value ${retrieved.id} provided to the select could not be found ` +
        "in the options and thus must be excluded."
    );
    return null;
  }
  return toModelSelectOption(retrieved.model);
};

/**
 * Converts the provided select value array in it's model form (i.e. a list of
 * model IDs that are not necessarily of type string) to the full Option type
 * required by react-select.
 *
 * To do this, we need to use the information in the associated set of data
 * to find the full model representations associated with each ID in the select
 * value array and then convert them to the full Option type.
 */
export const parseMultiModelSelectValues = <M extends Model.Model>(
  data: (M | ModelSelectOption<M>)[],
  value?: M["id"][]
): MultiValue<ModelSelectOption<M>> => {
  const retrieve = (id: M["id"], dat: M[]): FetchedValue<M> => {
    const m: M | undefined = find(dat, (d: M) => d.id === id);
    return m === undefined ? { id, model: null } : { id, model: m };
  };

  const dataSource = map(data, (o: M | ModelSelectOption<M>) => (isSelectOption(o) ? toSelectModel(o) : o));

  if (value === undefined || (value.length === 0 && dataSource.length === 0)) {
    return [];
  }
  const retrieved: FetchedValue<M>[] = map(value, (id: M["id"]) => retrieve(id, dataSource));
  const valids = filter(retrieved, (m: FetchedValue<M>) => m.model !== null) as PresentFetch<M>[];
  const invalids = filter(retrieved, (m: FetchedValue<M>) => m.model === null) as MissingFetch<M>[];
  /* If the number of fetched results equals 0, and the number of invalid
		 elements in the value array is not equal to 0, this means that there
		 are values in the value array that could not be mapped to models in the
		 data.  We need to issue a warning and exclude them from the models that
		 are converted to select options. */
  if (dataSource.length !== 0 && invalids.length !== 0) {
    const invalidString = map(invalids, (m: MissingFetch<M>) => m.id).join(", ");
    console.warn(
      `The value(s) ${invalidString} provided to the select ` +
        "could not be found in the options and thus must be excluded."
    );
  }
  /* Convert the models associated with the values provided to the select value
	   array to select Option form with string IDs.  Regardless of whether or not
		 there are valid or invalid values, this is always the desired behavior.
		 This is because both of the following cases apply:
		(1) There are no valid values:  In this case, it is guaranteed that
				all the values are invalid, since we know that the number of
				retrieved results is not 0.  In this case, an empty array
				is appropriate, since it effectively means the select has no
				value.
		(2) There are some valid values: In this case, it is appropriate
				to map the valid values to options and return them, because even
				if there are invalid values in the value array, we still want to
				include the options associated with the valid values from the
				value array. */
  return map(valids, (m: PresentFetch<M>) => toModelSelectOption(m.model));
};
