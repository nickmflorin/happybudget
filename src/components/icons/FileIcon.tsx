import { useMemo } from "react";

import { find } from "lodash";

import { ui, fs } from "lib";

import { Icon } from "./Icon";

type FileIconExtensionMap = {
  readonly extensions: string[];
  readonly icon: ui.IconName;
};

const FILE_ICON_EXTENSION_MAPPING: FileIconExtensionMap[] = [
  {
    extensions: ["jpg", "jpeg", "gif", "png"],
    icon: ui.IconNames.FILE_IMAGE,
  },
  {
    extensions: ["mp4", "avi", "mov", "wmv"],
    icon: ui.IconNames.FILE_VIDEO,
  },
  {
    extensions: ["mp3", "wma", "aac", "wav"],
    icon: ui.IconNames.FILE_AUDIO,
  },
  {
    extensions: ["csv"],
    icon: ui.IconNames.FILE_CSV,
  },
  {
    extensions: ["zip"],
    icon: ui.IconNames.FILE_ARCHIVE,
  },
  {
    extensions: ["pdf"],
    icon: ui.IconNames.FILE_PDF,
  },
  {
    extensions: [
      "ppt",
      "pot",
      "pps",
      "pptx",
      "pptm",
      "potx",
      "potm",
      "ppam",
      "ppsx",
      "ppsm",
      "sldx",
      "sldm",
    ],
    icon: ui.IconNames.FILE_POWERPOINT,
  },
  {
    extensions: [
      "xls",
      "xlt",
      "xlm",
      "xlsx",
      "xlsm",
      "xlsx",
      "xllm",
      "xlsb",
      "xla",
      "xlam",
      "xll",
      "xlw",
    ],
    icon: ui.IconNames.FILE_EXCEL,
  },
  {
    extensions: ["doc", "dot", "wbk", "docx", "docm", "dotx", "dotm", "docb"],
    icon: ui.IconNames.FILE_WORD,
  },
];

const getFileExtension = (
  name: string | undefined,
  ext: string | undefined | null,
): string | undefined => {
  if (ext !== undefined && ext !== null) {
    return ext.toLowerCase();
  } else if (name !== undefined) {
    return fs.getFileType(name)?.toLowerCase();
  }
  return undefined;
};

const getFileIcon = (name: string | undefined, ext: string | undefined | null): ui.IconName => {
  const mapping: FileIconExtensionMap | undefined = find(
    FILE_ICON_EXTENSION_MAPPING,
    (mp: FileIconExtensionMap) => mp.extensions.includes(getFileExtension(name, ext) as string),
  );
  return mapping?.icon || ui.IconNames.FILE;
};

type FileIconProps = Omit<ui.IconComponentProps, "icon"> & {
  readonly name?: string | undefined;
  readonly ext?: string | null | undefined;
};

export const FileIcon = ({ name, ext, ...props }: FileIconProps) => {
  const icon = useMemo(() => getFileIcon(name, ext), [name, ext]);
  return <Icon {...props} icon={icon} />;
};
