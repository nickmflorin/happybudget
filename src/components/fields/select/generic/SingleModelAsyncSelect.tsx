import React from "react";

import SingleSelect, { SingleSelectProps } from "./SingleSelect";
import * as hocs from "./hocs";

type BaseProps<M extends Model.Model = Model.Model> = Omit<
  SingleSelectProps<ModelSelectOption<M>>,
  "getOptionLabel" | "getOptionValue" | "options" | "value" | "defaultValue" | "onChange"
>;

type _SingleModelSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  hocs.SingleModelSelectInjectedProps<M> &
  hocs.ModelAsyncSelectInjectedProps<M>;

export type SingleModelSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  hocs.WithSingleModelAsyncSelectProps<M> &
  hocs.WithSingleModelSelectProps<M>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const WithSingle = hocs.withSingleModelSelect<any, any, _SingleModelSelectProps<any>>(SingleSelect);
const WithAsync = hocs.withSingleModelAsyncSelect(WithSingle);

export default React.memo(WithAsync) as <M extends Model.Model>(props: SingleModelSelectProps<M>) => JSX.Element;
