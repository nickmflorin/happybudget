import { useMemo } from "react";

import { find } from "lodash";

import { logger } from "internal";
import { budgeting } from "lib/model";
import { icons } from "lib/ui";

import { Icon } from "./Icon";

type ImportSourceIconMap = {
  readonly sourceId: budgeting.ActualImportSource["id"];
  readonly icon: icons.IconName;
};

const IMPORT_SOURCE_MAPPING: ImportSourceIconMap[] = [
  {
    icon: icons.IconNames.BUILDING_COLUMNS,
    sourceId: budgeting.ActualImportSources.BANK_ACCOUNT.id,
  },
];

const getImportSourceIcon = (id: budgeting.ActualImportSource["id"]): icons.IconName => {
  const mapping: ImportSourceIconMap | undefined = find(
    IMPORT_SOURCE_MAPPING,
    (mp: ImportSourceIconMap) => mp.sourceId === id,
  );
  if (mapping === undefined) {
    logger.warn(`No icon is configured for import source ${id}.`);
  }
  return mapping?.icon || icons.IconNames.FILE_IMPORT;
};

type ActualImportSourceIconProps = Omit<icons.IconComponentProps, "icon"> & {
  readonly source: budgeting.ActualImportSource | budgeting.ActualImportSource["id"];
};

export const ActualImportSourceIcon = ({ source, ...props }: ActualImportSourceIconProps) => {
  const icon = useMemo(
    () => getImportSourceIcon(typeof source === "number" ? source : source.id),
    [source],
  );
  return <Icon {...props} icon={icon} />;
};
