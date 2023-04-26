import { useMemo } from "react";

import { find } from "lodash";

import * as fs from "lib/fs";
import * as icons from "lib/ui/icons";

import { Icon } from "./Icon";

type FileIconExtensionMap = {
  readonly extensions: string[];
  readonly icon: icons.IconName;
};

const FILE_ICON_EXTENSION_MAPPING: FileIconExtensionMap[] = [
  {
    extensions: ["jpg", "jpeg", "gif", "png"],
    icon: icons.IconNames.FILE_IMAGE,
  },
  {
    extensions: ["mp4", "avi", "mov", "wmv"],
    icon: icons.IconNames.FILE_VIDEO,
  },
  {
    extensions: ["mp3", "wma", "aac", "wav"],
    icon: icons.IconNames.FILE_AUDIO,
  },
  {
    extensions: ["csv"],
    icon: icons.IconNames.FILE_CSV,
  },
  {
    extensions: ["zip"],
    icon: icons.IconNames.FILE_ZIPPER,
  },
  {
    extensions: ["pdf"],
    icon: icons.IconNames.FILE_PDF,
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
    icon: icons.IconNames.FILE_POWERPOINT,
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
    icon: icons.IconNames.FILE_EXCEL,
  },
  {
    extensions: ["doc", "dot", "wbk", "docx", "docm", "dotx", "dotm", "docb"],
    icon: icons.IconNames.FILE_WORD,
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

const getFileIcon = (name: string | undefined, ext: string | undefined | null): icons.IconName => {
  const mapping: FileIconExtensionMap | undefined = find(
    FILE_ICON_EXTENSION_MAPPING,
    (mp: FileIconExtensionMap) => mp.extensions.includes(getFileExtension(name, ext) as string),
  );
  return mapping?.icon || icons.IconNames.FILE;
};

type FileIconProps = Omit<icons.IconComponentProps, "icon"> & {
  readonly name?: string | undefined;
  readonly ext?: string | null | undefined;
};

export const FileIcon = ({ name, ext, ...props }: FileIconProps) => {
  const icon = useMemo(() => getFileIcon(name, ext), [name, ext]);
  return <Icon {...props} icon={icon} />;
};
