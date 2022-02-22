import React from "react";
import { Icon } from "components";
import DropdownMenu, { DropdownMenuProps } from "./DropdownMenu";

type ImportActualsMenuItemModel = Omit<MenuItemModel, "id"> & {
  readonly id: Model.ActualImportSourceId;
};

type ImportActualsDropdownMenuProps = Omit<
  /* Always extend the props of the component you are wrapping so we can use
     this in more flexible ways if need be. */
  DropdownMenuProps<MenuItemSelectedState, ImportActualsMenuItemModel>,
  /* We don't want any of these to be specified by
     whatever is using this component because
     they are either not applicable or are overridden. */
  "onChange" | "mode" | "clientSearching" | "searchIndices" | "includeSearch" | "checkbox" | "selected" | "models"
> & {
  /* We can omit the onChange for the menu because we are going to intercept it
     and expose the slightly more applicable onChange defined here. */
  readonly onChange: (source: Model.ActualImportSourceId) => void;
};

const ImportActualsDropdownMenu = (props: ImportActualsDropdownMenuProps): JSX.Element => (
  <DropdownMenu
    {...props}
    onChange={(e: MenuChangeEvent<MenuItemSelectedState, ImportActualsMenuItemModel>) => props.onChange(e.model.id)}
    models={[
      {
        id: 0,
        label: "Plaid",
        icon: <Icon icon={"bank"} weight={"light"} />
      }
    ]}
  />
);

export default React.memo(ImportActualsDropdownMenu);
