import React from "react";
import { map } from "lodash";

import { integrations } from "lib";

import { ActualImportSourceIcon } from "components/icons";
import DropdownMenu, { DropdownMenuProps } from "./DropdownMenu";
type ImportActualsMenuItemModel = Omit<MenuItemModel, "id"> & Model.ActualImportSource;

type ImportActualsDropdownMenuProps = Omit<
  DropdownMenuProps<MenuItemSelectedState, ImportActualsMenuItemModel>,
  "onChange" | "mode" | "clientSearching" | "searchIndices" | "includeSearch" | "checkbox" | "selected" | "models"
> & {
    readonly onChange: (source: Model.ActualImportSource) => void;
};

const ImportActualsDropdownMenu = (props: ImportActualsDropdownMenuProps): JSX.Element => (
  <DropdownMenu
    {...props}
    onChange={(e: MenuChangeEvent<MenuItemSelectedState, ImportActualsMenuItemModel>) => props.onChange(e.model)}
    models={map(integrations.models.ActualImportSources, (source: Model.ActualImportSource) => ({
      ...source,
      label: source.name,
      icon: <ActualImportSourceIcon weight={"light"} source={source} />
    }))}
  />
);

export default React.memo(ImportActualsDropdownMenu);
