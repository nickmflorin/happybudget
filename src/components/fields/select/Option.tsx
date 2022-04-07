import React, { ReactNode } from "react";
import { components, OptionProps as RootOptionProps, GroupBase } from "react-select";
import { isNil } from "lodash";
import classNames from "classnames";

import { ui } from "lib";
import { Icon } from "components";

export type OptionChildrenRenderProps<
  O extends SelectOption,
  IsMulti extends boolean = false,
  G extends GroupBase<O> = GroupBase<O>
> = Omit<RootOptionProps<O, IsMulti, G>, "children">;

export type OptionProps<
  O extends SelectOption,
  IsMulti extends boolean = false,
  G extends GroupBase<O> = GroupBase<O>,
  RENDERPARAMS extends OptionChildrenRenderProps<O, IsMulti, G> = OptionChildrenRenderProps<O, IsMulti, G>
> = OptionChildrenRenderProps<O, IsMulti, G> & {
  readonly children: ReactNode | ((params: RENDERPARAMS) => JSX.Element);
};

const Option = <O extends SelectOption, IsMulti extends boolean = false, G extends GroupBase<O> = GroupBase<O>>(
  props: OptionProps<O, IsMulti, G>
): JSX.Element => (
  <components.Option className={classNames("select-option", props.className)} {...props}>
    {!isNil(props.data.icon) && (
      <div className={"icon-wrapper"}>
        {ui.iconIsJSX(props.data.icon) ? props.data.icon : <Icon icon={props.data.icon} weight={"light"} />}
      </div>
    )}
    <div className={"select-option-content"}>
      {typeof props.children === "function" ? props.children(props) : props.children}
    </div>
  </components.Option>
);

export default React.memo(Option) as typeof Option;
