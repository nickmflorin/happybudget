import { useMemo, useState } from "react";
import { MultiValue } from "react-select";
import { find, filter, map } from "lodash";

import { toSelectOption, toSelectModel } from "./util";

type PresentFetch<M extends Model.Model> = { id: M["id"]; model: M };
type MissingFetch<M extends Model.Model> = { id: M["id"]; model: null };
type FetchedValue<M extends Model.Model> = MissingFetch<M> | PresentFetch<M>;

type UseMultiModelAsyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"][];
  readonly isAsync: true;
};

type UseMultiModelSyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"][];
  readonly options: Model.WithStringId<M>[];
};

type UseMultiModelSelectProps<M extends Model.Model> =
  | UseMultiModelAsyncSelectProps<M>
  | UseMultiModelSyncSelectProps<M>;

const isAsync = <M extends Model.Model>(
  props: UseMultiModelSelectProps<M>
): props is UseMultiModelAsyncSelectProps<M> => (props as UseMultiModelAsyncSelectProps<M>).isAsync === true;

type UseMultiModelSelectReturnType<M extends Model.Model> = {
  readonly value: MultiValue<Model.WithStringId<M>>;
  // Only applicable for the async case.
  readonly onResponse: (response: Http.ListResponse<M>) => void;
};

export const useMultiModelSelect = <M extends Model.Model>(
  props: UseMultiModelSelectProps<M>
): UseMultiModelSelectReturnType<M> => {
  const [data, setData] = useState<M[]>([]);

  const retrieve = useMemo(
    () =>
      (id: M["id"], dat: M[]): FetchedValue<M> => {
        const m: M | undefined = find(dat, (d: M) => d.id === id) as M | undefined;
        return m === undefined ? { id, model: null } : { id, model: m };
      },
    []
  );

  const convertedValue = useMemo<MultiValue<Model.WithStringId<M>>>(() => {
    const dataSource = isAsync(props) ? data : map(props.options, (o: Model.WithStringId<M>) => toSelectModel(o));

    if (props.value === undefined || (props.value.length === 0 && data.length === 0)) {
      return [];
    }
    const retrieved: FetchedValue<M>[] = map(props.value, (id: M["id"]) => retrieve(id, dataSource));
    const valids = filter(retrieved, (m: FetchedValue<M>) => m.model !== null) as PresentFetch<M>[];
    const invalids = filter(retrieved, (m: FetchedValue<M>) => m.model === null) as MissingFetch<M>[];
    /* If the number of fetched results equals 0, and the number of invalid
		   elements in the value array is not equal to 0, this means that there
			 are values in the value array that could not be mapped to models in the
			 data.  We need to issue a warning and exclude them from the models that
			 are converted to select options. */
    if (data.length !== 0 && invalids.length !== 0) {
      const invalidString = map(invalids, (m: MissingFetch<M>) => m.id).join(", ");
      console.warn(
        `The value(s) ${invalidString} provided to the select ` +
          "could not be found in the asynchrously loaded options and " +
          "thus must be excluded."
      );
    }
    /* Convert the models associated with the values provided to the
			 select value array to select option form with String IDs. Regardless
			 of whether or not there are valid or invalid values, this is always
			 safe.  This is because the following cases apply:
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
    return map(valids, (m: PresentFetch<M>) => toSelectOption(m.model));
  }, [retrieve, props]);

  return { value: convertedValue, onResponse: (rsp: Http.ListResponse<M>) => setData(rsp.data) };
};
