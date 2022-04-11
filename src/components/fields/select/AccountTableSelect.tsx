import React from "react";

import MultiValue, { MultiValueProps } from "./MultiValue";
import Option, { OptionProps } from "./Option";
import MultiModelSyncSelect, { MultiModelSyncSelectProps } from "./MultiModelSyncSelect";
import EntityTextMultiValue from "./EntityTextMultiValue";
import EntityTextOption from "./EntityTextOption";

type AccountTableModel = Model.PdfAccount | { readonly id: "topsheet" };

type AccountTableMultiValueProps = MultiValueProps<ModelSelectOption<AccountTableModel>>;

const AccountTableMultiValue = (props: AccountTableMultiValueProps) =>
  props.data.id === "topsheet" ? <MultiValue {...props}>{"Topsheet"}</MultiValue> : <EntityTextMultiValue {...props} />;

type AccountTableOptionProps = OptionProps<ModelSelectOption<AccountTableModel>, true>;

const AccountTableOption = (props: AccountTableOptionProps) =>
  props.data.id === "topsheet" ? <Option {...props}>{"Topsheet"}</Option> : <EntityTextOption {...props} />;

export type AccountTableProps = Omit<
  MultiModelSyncSelectProps<AccountTableModel>,
  "getOptionLabel" | "components" | "options"
> & {
  readonly options: Model.PdfAccount[];
};

const AccountTableSelect = (props: AccountTableProps): JSX.Element => (
  <MultiModelSyncSelect<AccountTableModel>
    placeholder={"Search tables..."}
    {...props}
    isSearchable={false}
    options={[{ id: "topsheet" }, ...props.options]}
    components={{ Option: AccountTableOption, MultiValue: AccountTableMultiValue }}
    noOptionsMessage={() => "No tables found."}
  />
);

export default React.memo(AccountTableSelect) as typeof AccountTableSelect;
