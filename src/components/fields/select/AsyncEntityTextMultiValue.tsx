import React from "react";
import { components, MultiValueProps } from "react-select";

import classNames from "classnames";

import { ui } from "lib";
import { EntityText } from "components/typography";

import AsyncMultiValue from "./AsyncMultiValue";

export type AsyncEntityTextMultiValueProps<
  M extends Model.HttpModel,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>>
> = MultiValueProps<AsyncSelectOption<AsyncModelSelectOption<M>>, true, G>;

const AsyncEntityTextMultiValue = <
  M extends Model.HttpModel,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>>
>(
  props: AsyncEntityTextMultiValueProps<M, G>
) => {
  return ui.select.isSelectErrorOption(props.data) ? (
    <AsyncMultiValue {...props} className={classNames("entity-text-multi-value", props.className)} />
  ) : (
    <components.MultiValue {...props} className={classNames("entity-text-multi-value", props.className)}>
      <EntityText fillEmpty={"----"}>{ui.select.toSelectModel<M>(props.data)}</EntityText>
    </components.MultiValue>
  );
};

export default React.memo(AsyncEntityTextMultiValue) as typeof AsyncEntityTextMultiValue;
