import { useMemo } from "react";

import { find } from "lodash";

import { logger } from "internal";
import { model, ui } from "lib";

import { Icon } from "./Icon";

type ImportSourceIconMap = {
  readonly sourceId: model.ActualImportSource["id"];
  readonly icon: ui.IconName;
};

const IMPORT_SOURCE_MAPPING: ImportSourceIconMap[] = [
  {
    icon: ui.IconNames.BANK,
    sourceId: model.ActualImportSources.BANK_ACCOUNT.id,
  },
];

const getImportSourceIcon = (id: model.ActualImportSource["id"]): ui.IconName => {
  const mapping: ImportSourceIconMap | undefined = find(
    IMPORT_SOURCE_MAPPING,
    (mp: ImportSourceIconMap) => mp.sourceId === id,
  );
  if (mapping === undefined) {
    logger.warn(`No icon is configured for import source ${id}.`);
  }
  return mapping?.icon || ui.IconNames.FILE_IMPORT;
};

type ActualImportSourceIconProps = Omit<ui.IconComponentProps, "icon"> & {
  readonly source: model.ActualImportSource | model.ActualImportSource["id"];
};

export const ActualImportSourceIcon = ({ source, ...props }: ActualImportSourceIconProps) => {
  const icon = useMemo(
    () => getImportSourceIcon(typeof source === "number" ? source : source.id),
    [source],
  );
  return <Icon {...props} icon={icon} />;
};
