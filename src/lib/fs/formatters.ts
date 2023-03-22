import { isNil } from "lodash";

import { errors } from "application";

import { getFileType } from "./util";

export const removeExtensionFromFileName = (filename: string, ext?: string) => {
  let extension: string | null = ext || null;
  if (!isNil(extension) && filename.indexOf(extension) === -1) {
    throw new errors.InvalidFileExtensionError(extension);
  } else if (isNil(extension)) {
    extension = getFileType(filename, true);
    if (isNil(extension)) {
      throw new errors.InvalidFileNameError(filename);
    }
  }
  extension = extension.startsWith(".") ? extension : `.${extension}`;
  return filename.slice(0, filename.lastIndexOf(extension));
};

export const formatFileNameForDownload = (filename: string, extParsed = false): string => {
  if (!extParsed) {
    const ext = getFileType(filename, false);
    if (!isNil(ext)) {
      return `${formatFileNameForDownload(
        removeExtensionFromFileName(filename, ext),
        true,
      )}.${ext}`;
    }
    return formatFileNameForDownload(filename, true);
  }
  return filename.replace(".", "");
};

export const truncateFileName = (file: string, length: number) => {
  let filename = file;
  const fileExtension = getFileType(file, true);
  if (fileExtension !== null) {
    filename = file.replace("." + fileExtension, "");
  }
  if (filename.length <= length) {
    return file;
  }
  filename = filename.substr(0, length) + (file.length > length ? "..." : "");
  if (fileExtension !== null) {
    return filename + "." + fileExtension;
  }
  return filename;
};
