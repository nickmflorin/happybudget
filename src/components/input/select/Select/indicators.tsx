import classNames from "classnames";
import {
  OptionProps as RootOptionProps,
  DropdownIndicatorProps,
  ClearIndicatorProps,
  LoadingIndicatorProps,
  components,
} from "react-select";

import * as ui from "lib/ui";
import { forms, icons } from "lib/ui";
import { Icon } from "components/icons";
import { Checkbox } from "components/input";
import { Spinner } from "components/loading";

export type OptionProps<
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
> = ui.ComponentProps<{ children: React.ReactNode }, { external: RootOptionProps<O, M> }>;

export const Option = <
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
>(
  props: OptionProps<O, M>,
) => (
  <components.Option {...props} className={classNames("select__option", props.className)}>
    {props.children}
  </components.Option>
);

type TextSelectOptionProps<
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
> = Omit<OptionProps<O, M>, "children">;

export const TextSelectOption = <
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
>(
  props: TextSelectOptionProps<O, M>,
) => (
  <Option<O, M> {...props} className={classNames("select__option--text", props.className)}>
    <div className="select__option__content">{props.label}</div>
  </Option>
);

type MultiSelectCheckboxOptionProps<
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
> = Omit<OptionProps<O, M>, "children">;

export const MultiSelectCheckboxOption = <
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
>(
  props: MultiSelectCheckboxOptionProps<O, M>,
) => (
  <Option<O, M>
    {...props}
    className={classNames("select__option--multi-checkbox", props.className)}
  >
    <Checkbox value={props.isSelected} />
    <div className="select__option__content">{props.label}</div>
  </Option>
);

export const DropdownIndicator = <
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
>(
  props: DropdownIndicatorProps<O, M>,
) => (
  <components.DropdownIndicator {...props}>
    <Icon
      color={icons.IconColors.GREY}
      icon={{ type: icons.IconCodes.SOLID, name: icons.IconNames.CHEVRON_DOWN }}
    />
  </components.DropdownIndicator>
);

export const ClearIndicator = <
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
>(
  props: ClearIndicatorProps<O, M>,
) => (
  <components.ClearIndicator
    {...props}
    className={classNames("select--clear-indicator", props.className)}
  >
    <Icon
      color={icons.IconColors.GREY}
      icon={{ type: icons.IconCodes.SOLID, name: icons.IconNames.XMARK }}
    />
  </components.ClearIndicator>
);

export const LoadingIndicator = <
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
>(
  props: LoadingIndicatorProps<O, M>,
) => (
  <Spinner
    color={icons.IconColors.GREY}
    className="select__spinner"
    loading={props.selectProps.isLoading}
  />
);
