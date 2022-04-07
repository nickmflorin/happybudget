import { useMemo, useState } from "react";
import { MultiValue, SingleValue } from "react-select";

import { parseMultiModelSelectValues, parseSingleModelSelectValues } from "./util";

type UseMultiModelAsyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"][];
  readonly isAsync: true;
};

type UseMultiModelSyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"][];
  readonly options: (M | ModelSelectOption<M>)[];
};

type UseMultiModelSelectProps<M extends Model.Model> =
  | UseMultiModelAsyncSelectProps<M>
  | UseMultiModelSyncSelectProps<M>;

const isMultiAsync = <M extends Model.Model>(
  props: UseMultiModelSelectProps<M>
): props is UseMultiModelAsyncSelectProps<M> => (props as UseMultiModelAsyncSelectProps<M>).isAsync === true;

type UseMultiModelSelectReturnType<M extends Model.Model> = {
  readonly value: MultiValue<ModelSelectOption<M>>;
  // Only applicable for the async case.
  readonly onResponse: (response: Http.ListResponse<M>) => void;
};

export const useMultiModelSelect = <M extends Model.Model>(
  props: UseMultiModelSelectProps<M>
): UseMultiModelSelectReturnType<M> => {
  const [data, setData] = useState<M[]>([]);

  const convertedValue = useMemo<MultiValue<ModelSelectOption<M>>>(
    () => parseMultiModelSelectValues(isMultiAsync(props) ? data : props.options, props.value),
    [props]
  );

  return { value: convertedValue, onResponse: (rsp: Http.ListResponse<M>) => setData(rsp.data) };
};

type UseSingleModelSyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"] | null;
  readonly options: (M | ModelSelectOption<M>)[];
};

type UseSingleModelAsyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"] | null;
  readonly isAsync: true;
};

type UseSingleModelSelectProps<M extends Model.Model> =
  | UseSingleModelAsyncSelectProps<M>
  | UseSingleModelSyncSelectProps<M>;

const isSingleAsync = <M extends Model.Model>(
  props: UseSingleModelSelectProps<M>
): props is UseSingleModelAsyncSelectProps<M> => (props as UseSingleModelAsyncSelectProps<M>).isAsync === true;

type UseSingleModelSelectReturnType<M extends Model.Model> = {
  readonly value: SingleValue<ModelSelectOption<M>>;
  // Only applicable for the async case.
  readonly onResponse: (response: Http.ListResponse<M>) => void;
};

export const useSingleModelSelect = <M extends Model.Model>(
  props: UseSingleModelSelectProps<M>
): UseSingleModelSelectReturnType<M> => {
  const [data, setData] = useState<M[]>([]);

  const convertedValue = useMemo<SingleValue<ModelSelectOption<M>>>(
    () => parseSingleModelSelectValues(isSingleAsync(props) ? data : props.options, props.value),
    [props]
  );
  return { value: convertedValue, onResponse: (rsp: Http.ListResponse<M>) => setData(rsp.data) };
};
