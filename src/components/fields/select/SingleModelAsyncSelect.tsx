import React from "react";

import SingleSelect, { SingleSelectProps } from "./SingleSelect";
import {
  withSingleModelSelect,
  withSingleModelAsyncSelect,
  WithSingleModelAsyncSelectProps,
  WithSingleModelSelectProps,
  ModelAsyncSelectInjectedProps,
  SingleModelSelectInjectedProps
} from "./hocs";

type BaseProps<M extends Model.Model = Model.Model> = Omit<
  SingleSelectProps<ModelSelectOption<M>>,
  "getOptionLabel" | "getOptionValue" | "options" | "value" | "defaultValue" | "onChange"
>;

type _SingleModelSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  SingleModelSelectInjectedProps<M> &
  ModelAsyncSelectInjectedProps<M>;

export type SingleModelSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  WithSingleModelAsyncSelectProps<M> &
  WithSingleModelSelectProps<M>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const WithSingle = withSingleModelSelect<any, _SingleModelSelectProps<any>>(SingleSelect);
const WithAsync = withSingleModelAsyncSelect(WithSingle);

export default React.memo(WithAsync) as <M extends Model.Model>(props: SingleModelSelectProps<M>) => JSX.Element;
