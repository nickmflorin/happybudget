import React from "react";

import SingleSelect, { SingleSelectProps } from "./SingleSelect";
import * as hocs from "./hocs";

type BaseProps<M extends Model.Model = Model.Model> = Omit<
  SingleSelectProps<ModelSelectOption<M>>,
  "getOptionLabel" | "getOptionValue" | "options" | "value" | "defaultValue" | "onChange"
>;

type _SingleModelSyncSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  hocs.SingleModelSelectInjectedProps<M> &
  hocs.SingleModelSyncSelectInjectedProps<M>;

export type SingleModelSyncSelectProps<M extends Model.Model = Model.Model> = BaseProps<M> &
  hocs.WithSingleModelSelectProps<M> &
  hocs.WithSingleModelSyncSelectProps<M>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const WithSingle = hocs.withSingleModelSelect<any, any, _SingleModelSyncSelectProps<any>>(SingleSelect);
const WithSync = hocs.withSingleModelSyncSelect(WithSingle);

export default React.memo(WithSync) as <M extends Model.Model>(props: SingleModelSyncSelectProps<M>) => JSX.Element;
