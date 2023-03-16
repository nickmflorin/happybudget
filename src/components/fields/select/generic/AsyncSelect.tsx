import React, { useMemo, useRef } from "react";

import classNames from "classnames";
import { isNil } from "lodash";
import { OnChangeValue, SelectComponentsConfig, ActionMeta } from "react-select";
import RCAsyncSelect, { AsyncProps } from "react-select/async";
import Select from "react-select/dist/declarations/src/Select";

import { ConditionalWrapper } from "components";
import { InputFieldNotifications } from "components/notifications";

import { Option } from "./options";
import { useSelectRef } from "./Select";

export type AsyncSelectProps<
  O extends SelectOption,
  M extends boolean = false,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends SelectGroupBase<O> = SelectGroupBase<O>,
> = Omit<
  AsyncProps<O, M, G>,
  "getOptionLabel" | "getOptionValue" | "onChange" | "components" | "loadOptions" | "options"
> & {
  readonly borderless?: boolean;
  readonly components?: SelectComponentsConfig<O, M, G>;
  readonly wrapperStyle?: React.CSSProperties;
  readonly loadOptionsWithoutValue?: boolean;
  readonly select?: NonNullRef<SelectInstance>;
  readonly onResponse?: (response: RSP) => void;
  readonly loadOptions?: (inputValue: string) => Promise<RSP>;
  readonly onError?: (e: Error) => void;
  readonly processResponse?: (response: RSP) => O[];
  readonly getOptionLabel?: (m: O) => string;
  readonly getOptionValue: (m: O) => string;
  readonly onChange?: (m: OnChangeValue<O, M>, actionMeta: ActionMeta<O>) => void;
};

const AsyncSelect = <
  O extends SelectOption,
  M extends boolean = false,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends SelectGroupBase<O> = SelectGroupBase<O>,
>({
  borderless,
  wrapperStyle,
  loadOptionsWithoutValue,
  loadOptions,
  onError,
  onResponse,
  processResponse,
  ...props
}: AsyncSelectProps<O, M, RSP, G>): JSX.Element => {
  const notificationsManager = useSelectRef(props.select);
  const selectRef = useRef<Select<O, M, G>>(null);

  const _onError = useMemo(
    () => (e: Error) => {
      onError?.(e);
      notificationsManager.handleRequestError(e);
    },
    [notificationsManager.handleRequestError, onError],
  );

  const _loadOptions = useMemo(
    () => (inputValue: string) =>
      new Promise<O[]>(resolve => {
        if (inputValue.trim() === "" && loadOptionsWithoutValue === false) {
          resolve([]);
        } else {
          /* Unfortunately, the reject of the promise is pointless - as it does
					not trigger anything in the underlying mechanics of react-select. */
          if (!isNil(loadOptions)) {
            loadOptions(inputValue)
              .then((response: RSP) => {
                onResponse?.(response);
                notificationsManager.clearNotifications();
                if (!isNil(processResponse)) {
                  resolve(processResponse(response));
                } else {
                  console.error(
                    "The options were loaded asynchronusly, but the process response method was not provided.",
                  );
                  resolve([]);
                }
              })
              .catch((e: Error) => _onError(e));
          }
        }
      }),
    [loadOptions, onError, processResponse, loadOptionsWithoutValue],
  );

  return (
    <ConditionalWrapper conditional={wrapperStyle !== undefined} style={wrapperStyle}>
      <RCAsyncSelect<O, M, G>
        cacheOptions={true}
        {...props}
        components={{ Option, ...props.components }}
        loadOptions={_loadOptions}
        className={classNames("react-select-container", props.className, { borderless })}
        classNamePrefix="react-select"
        menuPosition="fixed"
        ref={selectRef}
      />
      <InputFieldNotifications notifications={notificationsManager.notifications} />
    </ConditionalWrapper>
  );
};

export default React.memo(AsyncSelect) as typeof AsyncSelect;
