import React, { useMemo } from "react";

import { isNil, find } from "lodash";

import { model } from "lib";

import Icon from "./Icon";

type ImportSourceIconMap = {
  readonly sourceId: Model.ActualImportSource["id"];
  readonly icon: IconProp;
};

const IMPORT_SOURCE_MAPPING: ImportSourceIconMap[] = [
  {
    icon: "bank",
    sourceId: model.budgeting.ActualImportSources.bank_account.id,
  },
];

const getImportSourceIcon = (id: Model.ActualImportSource["id"]): IconProp => {
  const mapping: ImportSourceIconMap | undefined = find(
    IMPORT_SOURCE_MAPPING,
    (mp: ImportSourceIconMap) => mp.sourceId === id,
  );
  if (isNil(mapping)) {
    console.warn(`No icon is configured for import source ${id}.`);
  }
  return mapping?.icon || "file-import";
};

type ActualImportSourceIconProps = Omit<IconProps, "icon"> & {
  readonly source: Model.ActualImportSource | Model.ActualImportSource["id"];
};

const ActualImportSourceIcon = ({ source, ...props }: ActualImportSourceIconProps) => {
  const icon = useMemo(
    () => getImportSourceIcon(typeof source === "number" ? source : source.id),
    [source],
  );
  return <Icon {...props} icon={icon} />;
};

export default React.memo(ActualImportSourceIcon);
