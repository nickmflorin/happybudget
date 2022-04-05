import React, { useMemo } from "react";
import { OptionProps, GroupBase, OnChangeValue, SelectComponentsConfig } from "react-select";
import RCAsyncSelect, { AsyncProps } from "react-select/async";
import classNames from "classnames";
import { filter, isNil } from "lodash";

import { ui, notifications } from "lib";

export type AsyncSelectProps<
  O,
  M extends boolean = false,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
> = Omit<
  AsyncProps<AsyncSelectOption<O>, M, G>,
  "getOptionLabel" | "getOptionValue" | "onChange" | "components" | "loadOptions"
> & {
  readonly borderless?: boolean;
  readonly components?: SelectComponentsConfig<AsyncSelectOption<O>, M, G>;
  readonly onResponse?: (response: RSP) => void;
  readonly loadOptions?: (inputValue: string) => Promise<RSP>;
  readonly onError?: (e: Error) => void;
  readonly processResponse?: (response: RSP) => O[];
  readonly getOptionLabel?: (m: O) => string;
  readonly getOptionValue: (m: O) => string;
  readonly onChange?: (m: OnChangeValue<O, M>) => void;
};

export const AsyncOptionRender = <
  O,
  M extends boolean = false,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
>(
  props: OptionProps<AsyncSelectOption<O>, M, G>
): JSX.Element =>
  ui.isSelectErrorOption(props.data) ? (
    <div>
      {props.data.message}
      {props.data.detail}
    </div>
  ) : (
    <>{props.selectProps.getOptionLabel(props.data)}</>
  );

const MemoizedAsyncOptionRender = React.memo(AsyncOptionRender) as typeof AsyncOptionRender;

const AsyncSelect = <
  O,
  M extends boolean = false,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends GroupBase<O | SelectErrorOption> = GroupBase<O | SelectErrorOption>
>({
  borderless,
  loadOptions,
  onError,
  onResponse,
  processResponse,
  ...props
}: AsyncSelectProps<O, M, RSP, G>): JSX.Element => {
  const _loadOptions = useMemo(
    () => (inputValue: string) =>
      new Promise<AsyncSelectOption<O>[]>(resolve => {
        /* Unfortunately, the reject of the promise is pointless - as it does
           not trigger anything in the underlying mechanics of react-select.
           The only way to properly handle errors is to resolve the Promise with
           an error-like option. */
        if (!isNil(loadOptions)) {
          loadOptions(inputValue)
            .then((response: RSP) => {
              onResponse?.(response);
              if (!isNil(processResponse)) {
                resolve(processResponse(response));
              } else {
                console.error(
                  "The options were loaded asynchronusly, but the process response method was not provided."
                );
                resolve([]);
              }
            })
            .catch((e: Error) => {
              onError?.(e);
              /* The response error should never be a FieldsError - so we do not
                 have to be concerned with providing a field notification
								 handler. */
              const notices = notifications.ui.parseRequestErrorNotifications(e);
              /* There should almost always just be 1 or 0 notifications, there
                 will be 0 only in the case that the error was related to a
                 cancelled request or force logout. */
              if (notices.length !== 0) {
                const detail = notices[0].detail;
                if (typeof detail === "string") {
                  resolve([
                    { message: notices[0].message || "There was an error loading the data.", detail, isError: true }
                  ]);
                } else {
                  resolve([{ message: notices[0].message || "There was an error loading the data.", isError: true }]);
                }
              }
            });
        }
      }),
    [loadOptions, onError, processResponse]
  );

  return (
    <RCAsyncSelect
      cacheOptions={true}
      components={{ ...props.components, Option: MemoizedAsyncOptionRender }}
      {...props}
      loadOptions={_loadOptions}
      className={classNames("react-select-container", props.className, { borderless })}
      classNamePrefix={"react-select"}
      getOptionLabel={(m: O | SelectErrorOption) => {
        if (ui.isSelectErrorOption(m)) {
          return "";
        }
        return props.getOptionLabel?.(m) || "";
      }}
      getOptionValue={(m: O | SelectErrorOption) => {
        if (ui.isSelectErrorOption(m)) {
          return "";
        }
        return props.getOptionValue(m);
      }}
      onChange={(v: OnChangeValue<AsyncSelectOption<O>, M>) => {
        if (Array.isArray(v)) {
          /* If there is an error, it will be embedded in the options as the first
				 and only option.  If this is the case, we do not want to trigger the
				 onChange handler. */
          const errs = filter(v, (vi: AsyncSelectOption<O>) => ui.isSelectErrorOption(vi)) as SelectErrorOption[];
          if (errs.length !== 0) {
            if (errs.length !== 1) {
              console.warn(
                "Suspicious Select Behavior: There should only ever be one " +
                  "option dedicated to indicating an HTTP error."
              );
            }
            if (v.length !== errs.length) {
              console.warn(
                "Suspicious Select Behavior: When there is an option dedicated " +
                  "to indicating an HTTP error, there should be no other options."
              );
            }
          } else {
            props.onChange?.(v as OnChangeValue<O, M>);
          }
        } else {
          /* If the only option is an error, we do not want to trigger the
					   onChange behavior. */
          if (v === null || !ui.isSelectErrorOption(v)) {
            props.onChange?.(v as OnChangeValue<O, M>);
          }
        }
      }}
    />
  );
};

export default React.memo(AsyncSelect) as typeof AsyncSelect;
