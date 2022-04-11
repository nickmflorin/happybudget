import React from "react";
import { components, OptionProps } from "react-select";
import classNames from "classnames";

import { ui } from "lib";
import { EntityText } from "components/typography";

import AsyncOption from "./AsyncOption";

export type AsyncEntityTextOptionProps<
  M extends Model.HttpModel,
  IsMulti extends boolean = true,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
> = OptionProps<AsyncSelectOption<AsyncModelSelectOption<M>>, IsMulti, G>;

const AsyncEntityTextOption = <
  M extends Model.HttpModel,
  IsMulti extends boolean = true,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
>(
  props: AsyncEntityTextOptionProps<M, IsMulti, G>
) => {
  return ui.select.isSelectErrorOption(props.data) ? (
    <AsyncOption {...props} />
  ) : (
    <components.Option {...props} className={classNames("entity-text-select-option", props.className)}>
      <EntityText fillEmpty={"----"}>{ui.select.toSelectModel<M>(props.data)}</EntityText>
    </components.Option>
  );
};

export default React.memo(AsyncEntityTextOption) as typeof AsyncEntityTextOption;
