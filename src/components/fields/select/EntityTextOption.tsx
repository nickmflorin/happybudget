import React from "react";
import classNames from "classnames";

import { ui } from "lib";
import { EntityText } from "components/typography";

import Option, { OptionProps } from "./Option";

export type EntityTextOptionProps<
  M extends Model.HttpModel,
  IsMulti extends boolean = true,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
> = OptionProps<ModelSelectOption<M>, IsMulti, G>;

const AsyncEntityTextOption = <
  M extends Model.HttpModel,
  IsMulti extends boolean = true,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
>(
  props: EntityTextOptionProps<M, IsMulti, G>
) => (
  <Option {...props} className={classNames("entity-text-select-option", props.className)}>
    <EntityText fillEmpty={"----"}>{ui.select.toSelectModel<M>(props.data)}</EntityText>
  </Option>
);

export default React.memo(AsyncEntityTextOption) as typeof AsyncEntityTextOption;
