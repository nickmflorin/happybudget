import React from "react";

import { options, multivalue, MultiModelSyncSelect, MultiModelSyncSelectProps } from "./generic";

type AccountTableModel = Model.PdfAccount | { readonly id: "topsheet" };

type AccountTableMultiValueProps = multivalue.MultiValueProps<ModelSelectOption<AccountTableModel>>;

const AccountTableMultiValue = (props: AccountTableMultiValueProps) =>
  props.data.id === "topsheet" ? (
    <multivalue.MultiValue {...props}>{"Topsheet"}</multivalue.MultiValue>
  ) : (
    <multivalue.EntityTextMultiValue {...props} />
  );

type AccountTableOptionProps = options.OptionProps<ModelSelectOption<AccountTableModel>, true>;

const AccountTableOption = (props: AccountTableOptionProps) =>
  props.data.id === "topsheet" ? (
    <options.Option {...props}>{"Topsheet"}</options.Option>
  ) : (
    <options.EntityTextOption {...props} />
  );

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
