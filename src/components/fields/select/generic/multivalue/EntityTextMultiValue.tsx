import React from "react";

import classNames from "classnames";

import { ui } from "lib";
import { EntityText } from "components/typography";

import MultiValue, { MultiValueProps } from "./MultiValue";

export type EntityTextMultiValueProps<
  M extends Model.HttpModel,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
> = MultiValueProps<ModelSelectOption<M>, G>;

const EntityTextMultiValue = <
  M extends Model.HttpModel,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
>(
  props: EntityTextMultiValueProps<M, G>,
) => (
  <MultiValue {...props} className={classNames("entity-text-multi-value", props.className)}>
    <EntityText fillEmpty="----">{ui.select.toSelectModel<M>(props.data)}</EntityText>
  </MultiValue>
);

export default React.memo(EntityTextMultiValue) as typeof EntityTextMultiValue;
