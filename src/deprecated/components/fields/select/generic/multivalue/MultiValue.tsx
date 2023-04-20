import React, { ReactNode } from "react";

import classNames from "classnames";
import { isNil } from "lodash";
import { components, MultiValueProps as RootMultiValueProps, GroupBase } from "react-select";

import { ui } from "lib";
import { Icon } from "components";

export type MultiValueChildrenRenderProps<
  O extends SelectOption,
  G extends GroupBase<O> = GroupBase<O>,
> = Omit<RootMultiValueProps<O, true, G>, "children">;

export type MultiValueProps<
  O extends SelectOption,
  G extends GroupBase<O> = GroupBase<O>,
> = MultiValueChildrenRenderProps<O, G> & {
  readonly children: ReactNode | ((props: MultiValueChildrenRenderProps<O, G>) => JSX.Element);
};

const MultiValue = <O extends SelectOption, G extends GroupBase<O> = GroupBase<O>>(
  props: MultiValueProps<O, G>,
): JSX.Element => (
  <components.MultiValue className={classNames("select-multi-value", props.className)} {...props}>
    {!isNil(props.data.icon) && (
      <div className="icon-wrapper">
        {ui.iconIsJSX(props.data.icon) ? (
          props.data.icon
        ) : (
          <Icon icon={props.data.icon} weight="light" />
        )}
      </div>
    )}
    <div className="select-multi-value-content">
      {typeof props.children === "function" ? props.children(props) : props.children}
    </div>
  </components.MultiValue>
);

export default React.memo(MultiValue) as typeof MultiValue;
