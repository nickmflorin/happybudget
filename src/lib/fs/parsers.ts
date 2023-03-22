import { errors } from "application";

import * as formatters from "./formatters";
import * as types from "./types";
import { getFileType } from "./util";

export type ParseFileNameOptions = {
  readonly ext?: string;
  readonly formatForDownload?: boolean;
};

export type ParsedFileName = {
  readonly name: string;
  readonly extension: string;
  readonly fullName: types.FileWithExtension;
};

export const parseFileName = (name: string, options?: ParseFileNameOptions): ParsedFileName => {
  let extension: string;

  const ext =
    options?.ext !== undefined && options.ext.startsWith(".") ? options.ext.slice(1) : options?.ext;

  const extensionFromName = getFileType(name, false);
  if (extensionFromName === null) {
    /* If the extension cannot be determined from the name and the extension is not explicitly
       provided, throw an error. */
    if (ext === undefined) {
      throw new errors.InvalidFileNameError(name);
    }
    extension = ext;
  } else if (ext !== undefined && ext !== extensionFromName) {
    /* If the extension from the name does not equal the explicitly provided extension, the
       extension from the name is not the real extension and there is an extra period in the
       filename. */
    extension = ext;
  } else {
    extension = extensionFromName;
    name = formatters.removeExtensionFromFileName(name, extension);
  }
  let fullName: types.FileWithExtension = `${name}.${extension}`;
  if (options?.formatForDownload) {
    fullName = formatters.formatFileNameForDownload(fullName) as types.FileWithExtension;
  }
  return { name: formatters.removeExtensionFromFileName(fullName, extension), extension, fullName };
};
