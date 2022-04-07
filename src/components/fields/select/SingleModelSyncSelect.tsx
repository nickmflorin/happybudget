import React from "react";

import SingleSelect, { SingleSelectProps } from "./SingleSelect";
import {
  withSingleModelSyncSelect,
  withSingleModelSelect,
  SingleModelSyncSelectInjectedProps,
  SingleModelSelectInjectedProps,
  WithSingleModelSelectProps,
  WithSingleModelSyncSelectProps
} from "./hocs";

type BaseProps<M extends Model.Model = Model.Model> = Omit<
  SingleSelectProps<ModelSelectOption<M>>,
  "getOptionLabel" | "getOptionValue" | "options" | "value" | "defaultValue" | "onChange"
>;

type _SingleModelSyncSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  SingleModelSelectInjectedProps<M> &
  SingleModelSyncSelectInjectedProps<M>;

export type SingleModelSyncSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  WithSingleModelSelectProps<M> &
  WithSingleModelSyncSelectProps<M>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const WithSingle = withSingleModelSelect<any, _SingleModelSyncSelectProps<any>>(SingleSelect);
const WithSync = withSingleModelSyncSelect(WithSingle);

export default React.memo(WithSync) as <M extends Model.Model>(props: SingleModelSyncSelectProps<M>) => JSX.Element;
