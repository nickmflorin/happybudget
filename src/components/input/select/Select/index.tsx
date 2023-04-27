import React, { useMemo } from "react";

import classNames from "classnames";
import { GroupBase, StylesConfig, OnChangeValue } from "react-select";
import RootAsyncSelect, { AsyncProps as RootAsyncSelectProps } from "react-select/async";
import { Optional } from "utility-types";

import * as ui from "lib/ui";
import { forms } from "lib/ui";

import {
  MultiSelectCheckboxOption,
  ClearIndicator,
  DropdownIndicator,
  LoadingIndicator,
  TextSelectOption,
} from "./indicators";

// The props that we want to expose from the underlying react-select package.
type RootProps =
  | "getOptionLabel"
  | "isMulti"
  | "components"
  | "menuIsOpen"
  | "isSearchable"
  | "isClearable"
  | "cacheOptions"
  | "placeholder";

export type SelectProps<
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
> = forms.WithFormInput<
  ui.ComponentProps &
    Optional<Pick<RootAsyncSelectProps<O, M, GroupBase<O>>, RootProps>, "getOptionLabel"> & {
      readonly value?: forms.FieldValue<D, N> & forms.SelectValue<O, M>;
      readonly defaultValue?: forms.FieldValue<D, N> & forms.SelectValue<O, M>;
      readonly loading?: boolean;
      readonly getOptionValue?: (o: O) => string;
      /* Overridden to force the Promise type to be Promise<Option[]>, not the version that includes
         groups, Promise<OptionsOrGroups<Option, Group>> */
      readonly loadOptions: (
        inputValue: string,
        callback: (options: O[]) => void,
      ) => Promise<O[]> | void;
    },
  forms.SelectValue<O, M>,
  D,
  N,
  forms.SelectElement<O, M>
>;

const NOOP = () => ({});

/**
 * The "react-select" package applies styles via randomly generated class names that always take
 * precedence over our own style definitions and cannot be overridden.  The only way to override
 * is to tell "react-select" that they should not apply any styles for that sub-component of the
 * select, which has to be done via the `styles` prop.
 *
 * This variable defines the sub-components for which the styles in "react-select" should be
 * removed, so they do not have to be overridden.  When styling a specific portion of the select,
 * we should first look at "react-select"'s style definitions and copy the relevant properties
 * into our own internal stylesheet.  Then, in that stylesheet we can apply custom styles.  But,
 * the styles will not take full effect until the relevant sub-component of the select is
 * uncommented below.
 */
const NOOP_REACT_SELECT_STYLES: StylesConfig<unknown, boolean> = {
  clearIndicator: NOOP,
  control: NOOP,
  indicatorsContainer: NOOP,
  menu: NOOP,
  option: NOOP,
  placeholder: NOOP,
  loadingIndicator: NOOP,
  indicatorSeparator: () => ({ display: "none" }),
};

export const Select = <
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
>({
  field,
  input,
  disabled = false,
  loading = false,
  ...props
}: SelectProps<O, M, D, N>) => {
  const components = useMemo(
    () => ({
      Option: props.isMulti ? MultiSelectCheckboxOption : TextSelectOption,
      ClearIndicator,
      DropdownIndicator,
      LoadingIndicator,
      ...props.components,
    }),
    [props.components, props.isMulti],
  );

  return (
    <RootAsyncSelect<O, M, GroupBase<O>>
      hideSelectedOptions={false}
      backspaceRemovesValue={true}
      closeMenuOnSelect={!props.isMulti}
      controlShouldRenderValue={!props.isMulti}
      // Set defaultOptions to true (to automatically run loadOptions on render) for async case
      defaultOptions
      getOptionValue={(o: O) => {
        /* The default case is to treat the name of the option attribute - which dictates the value
           of the option - as "id" (which is typed by the default generic forms.SelectOption<"id">).
           If the option type differs from the default, the getOptionValue prop must be overridden
           to return the value attribute on the option.

           Reference: https://react-select.com/props (under "getOptionValue")
           */
        if (typeof o.id !== "string") {
          throw new Error(
            "The select option does not have an 'id' attribute, the 'getOptionValue' prop must " +
              "be overridden.",
          );
        }
        return o.id;
      }}
      getOptionLabel={(o: O) => {
        /* The default case is to treat the label of the option attribute - which dictates the
           representation of the option in the select - as "label" (which is typed by the default
           generic forms.SelectOption<"id">).  If the option type differs from the default, the
           getOptionValue prop must be overridden to return the label attribute on the option.

           Reference: https://react-select.com/props (under "getOptionLabel")
           */
        if (typeof o.label !== "string") {
          throw new Error(
            "The select option does not have an 'label' attribute, the 'getOptionLabel' prop " +
              "must be overridden.",
          );
        }
        return o.label;
      }}
      {...props}
      onChange={(newValue: OnChangeValue<O, M>) =>
        // This must be overridden to properly work with forms.
        props.onChange?.({
          type: "onSelect",
          target: {
            value: newValue,
          },
        })
      }
      ref={input}
      menuIsOpen={!disabled ? props.menuIsOpen : false}
      isLoading={loading && !disabled}
      isDisabled={disabled}
      components={components}
      classNamePrefix="select"
      className={classNames(
        "select",
        field?.feedbackType !== undefined && `select--feedback-${field.feedbackType}`,
        { disabled },
        props.isSearchable ? "select--is-searchable" : undefined,
        props.className,
      )}
      styles={NOOP_REACT_SELECT_STYLES as StylesConfig<O, M>}
    />
  );
};
