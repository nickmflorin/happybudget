import React, { useImperativeHandle } from "react";

import classNames from "classnames";
import RCSelect, { Props, GroupBase } from "react-select";

import { notifications } from "lib";
import { ConditionalWrapper } from "components";
import { InputFieldNotifications } from "deprecated/components/notifications";

import Option from "./options/Option";

export type SelectProps<
  O extends SelectOption,
  M extends boolean = false,
  G extends SelectGroupBase<O> = SelectGroupBase<O>,
> = Props<O, M, G> & {
  readonly borderless?: boolean;
  readonly wrapperStyle?: React.CSSProperties;
  readonly select?: NonNullRef<SelectInstance>;
};

export const useSelectRef = (select: NonNullRef<SelectInstance> | undefined) => {
  const notificationsManager = notifications.ui.useNotificationsManager({
    defaultBehavior: "replace",
    defaultClosable: true,
  });

  useImperativeHandle(select, () => ({ ...notificationsManager }));

  return { ...notificationsManager };
};

const Select = <
  O extends SelectOption,
  M extends boolean = false,
  G extends GroupBase<O> = GroupBase<O>,
>({
  borderless,
  wrapperStyle,
  ...props
}: SelectProps<O, M, G>): JSX.Element => {
  const notificationsManager = useSelectRef(props.select);

  return (
    <ConditionalWrapper conditional={wrapperStyle !== undefined} style={wrapperStyle}>
      <RCSelect
        {...props}
        components={{ Option, ...props.components }}
        className={classNames(
          "react-select-container",
          props.className,
          { disabled: props.isDisabled },
          { borderless },
        )}
        classNamePrefix="react-select"
        menuPosition="fixed"
      />
      <InputFieldNotifications notifications={notificationsManager.notifications} />
    </ConditionalWrapper>
  );
};

export default React.memo(Select) as typeof Select;
