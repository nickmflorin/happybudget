import React, { useMemo } from "react";
import { isNil, find, includes } from "lodash";

import { util } from "lib";
import { Icon } from "components";

type FileIconExtensionMap = {
  readonly extensions: string[];
  readonly icon: IconProp;
};

const FILE_ICON_EXTENSION_MAPPING: FileIconExtensionMap[] = [
  {
    extensions: ["jpg", "jpeg", "gif", "png"],
    icon: "file-image"
  },
  {
    extensions: ["mp4", "avi", "mov", "wmv"],
    icon: "file-video"
  },
  {
    extensions: ["mp3", "wma", "aac", "wav"],
    icon: "file-audio"
  },
  {
    extensions: ["csv"],
    icon: "file-csv"
  },
  {
    extensions: ["zip"],
    icon: "file-archive"
  },
  {
    extensions: ["pdf"],
    icon: "file-pdf"
  },
  {
    extensions: ["ppt", "pot", "pps", "pptx", "pptm", "potx", "potm", "ppam", "ppsx", "ppsm", "sldx", "sldm"],
    icon: "file-powerpoint"
  },
  {
    extensions: ["xls", "xlt", "xlm", "xlsx", "xlsm", "xlsx", "xllm", "xlsb", "xla", "xlam", "xll", "xlw"],
    icon: "file-excel"
  },
  {
    extensions: ["doc", "dot", "wbk", "docx", "docm", "dotx", "dotm", "docb"],
    icon: "file-word"
  }
];

const getFileExtension = (name: string | undefined, ext: string | undefined): string | undefined => {
  if (!isNil(ext)) {
    return ext.toLowerCase();
  } else if (!isNil(name)) {
    return util.files.getFileType(name)?.toLowerCase();
  }
  return undefined;
};

const getFileIcon = (name: string | undefined, ext: string | undefined): IconProp => {
  const mapping: FileIconExtensionMap | undefined = find(FILE_ICON_EXTENSION_MAPPING, (mp: FileIconExtensionMap) =>
    includes(mp.extensions, getFileExtension(name, ext))
  );
  return mapping?.icon || "file";
};

type FileIconProps = Omit<IconProps, "icon"> & {
  readonly name?: string | undefined;
  readonly ext?: string | undefined;
};

const FileIcon = ({ name, ext, ...props }: FileIconProps) => {
  const icon = useMemo(() => getFileIcon(name, ext), [name, ext]);
  return <Icon {...props} icon={icon} />;
};

export default React.memo(FileIcon);
