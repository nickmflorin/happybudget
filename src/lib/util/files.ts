import { isNil } from "lodash";
import mime from "mime";

export const fileNameCompat = (filename: string) => filename.replace(".", "");

export const fileSizeInMB = (file: File | number) => (typeof file === "number" ? file : file.size) / 1024 / 1024;

export const fileSizeString = (file: File | number) => `${fileSizeInMB(file).toFixed(2)} MB`;

class InvalidFileNameError extends Error {
  constructor(filename: string) {
    super(`The filename ${filename} is invalid.`);
  }
}

class InvalidFileExtensionError extends Error {
  constructor(ext: string) {
    super(`The file extension ${ext} is invalid.`);
  }
}

export const getFileType = (filename: string, strict = false): string | null => {
  const returnNull = () => {
    if (strict === false) {
      return null;
    }
    throw new InvalidFileNameError(filename);
  };
  if (filename.indexOf(".") !== -1) {
    const ext = filename.split(".").pop();
    if (isNil(ext)) {
      return returnNull();
    } else if (ext.trim() === "") {
      throw new InvalidFileNameError(filename);
    }
    return ext.trim();
  }
  return returnNull();
};

export const removeExtensionFromFileName = (filename: string, ext?: string) => {
  let extension: string | null = ext || null;
  if (!isNil(extension) && filename.indexOf(extension) === -1) {
    throw new InvalidFileExtensionError(extension);
  } else if (isNil(extension)) {
    extension = getFileType(filename, true);
    if (isNil(extension)) {
      throw new InvalidFileNameError(filename);
    }
  }
  extension = extension.startsWith(".") ? extension : `.${extension}`;
  return filename.slice(0, filename.lastIndexOf(extension));
};

export const formatFileNameForDownload = (filename: string, extParsed = false): string => {
  if (!extParsed) {
    const ext = getFileType(filename, false);
    if (!isNil(ext)) {
      return `${formatFileNameForDownload(removeExtensionFromFileName(filename, ext), true)}.${ext}`;
    }
    return formatFileNameForDownload(filename, true);
  }
  return filename.replace(".", "");
};

type FileWithExtension = `${string}.${string}`;

type ParseFileNameOptions = {
  readonly ext?: string;
  readonly formatForDownload?: boolean;
};

type ParsedFileName = {
  readonly name: string;
  readonly extension: string;
  readonly fullName: FileWithExtension;
};

export const parseFileName = (name: string, options?: ParseFileNameOptions): ParsedFileName => {
  let extension: string;

  const ext = !isNil(options?.ext)
    ? options?.ext.startsWith(".")
      ? options.ext.slice(1)
      : options?.ext
    : options?.ext;

  const extensionFromName = getFileType(name, false);
  if (isNil(extensionFromName)) {
    /* If the extension cannot be determined from the name and the extension is
		   not explicitly provided, throw an error. */
    if (isNil(ext)) {
      throw new InvalidFileNameError(name);
    }
    extension = ext;
  } else if (!isNil(ext) && ext !== extensionFromName) {
    /* If the extension from the name does not equal the explicitly provided
       extension, the extension from the name is not the real extension and
       there is an extra period in the filename. */
    extension = ext;
  } else {
    extension = extensionFromName;
    name = removeExtensionFromFileName(name, extension);
  }
  let fullName: FileWithExtension = `${name}.${extension}`;
  if (options?.formatForDownload) {
    fullName = formatFileNameForDownload(fullName) as FileWithExtension;
  }
  return { name: removeExtensionFromFileName(fullName, extension), extension, fullName };
};

export const getDataFromBlob = (file: File | Blob): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => (reader.result === null ? reject("Could not read data from blob.") : resolve(reader.result));
    reader.onerror = error => reject(error);
  });

export const getDataFromURL = (url: string): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function () {
      const reader = new FileReader();
      reader.readAsDataURL(xhr.response);
      reader.onload = () => (reader.result === null ? reject("Could not read data from URL.") : resolve(reader.result));
      reader.onerror = error => reject(error);
    };
    xhr.responseType = "blob";
    xhr.send();
  });

export const downloadData = (data: string, name: string) => {
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", name);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  if (!isNil(link.parentNode)) {
    link.parentNode.removeChild(link);
  }
};

export const downloadBlob = (blob: Blob, name: string) => {
  const blobUrl = URL.createObjectURL(blob);
  if (!isNil(blobUrl)) {
    downloadData(blobUrl, name);
  } else {
    throw new Error("Error downloading file.");
  }
};

export const extensionIsImage = (ext: string) => {
  const mimeType = mime.getType(ext);
  if (isNil(mimeType)) {
    throw new InvalidFileExtensionError(ext);
  }
  return mimeType.split("/")[0] === "image";
};

export const download = (
  fileObj: string | ArrayBuffer | Blob,
  nm: string,
  options?: Omit<ParseFileNameOptions, "formatForDownload">
) => {
  /* eslint-disable-next-line prefer-const */
  const parsed = parseFileName(nm, options);

  const mimeType = mime.getType(parsed.extension);
  if (isNil(mimeType)) {
    throw new InvalidFileExtensionError(parsed.extension);
  }
  let blob: Blob;
  if (!(fileObj instanceof Blob)) {
    if (fileObj instanceof ArrayBuffer) {
      blob = new Blob([fileObj], { type: mimeType });
      downloadBlob(blob, parsed.fullName);
      return;
    } else {
      downloadData(fileObj, parsed.fullName);
      return;
    }
  } else {
    downloadBlob(fileObj, parsed.fullName);
  }
};

export const downloadAsCsvFile = (filename: string, data: CSVData) => {
  const processRow = (row: CSVRow): string => {
    let finalVal = "";
    for (let j = 0; j < row.length; j++) {
      const innerValue = !isNil(row[j]) ? String(row[j]) : "";
      /* eslint-disable quotes */
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) {
        result = '"' + result + '"';
      }
      if (j > 0) {
        finalVal += ",";
      }
      finalVal += result;
    }
    return finalVal + "\n";
  };

  let csvFile = "";
  for (let i = 0; i < data.length; i++) {
    csvFile += processRow(data[i]);
  }
  const parsed = parseFileName(filename, { ext: "csv" });
  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, parsed.fullName);
};

export const truncateFileName = (file: string, length: number) => {
  const fileExtension = getFileType(file);
  let filename = file.replace("." + fileExtension, "");
  if (filename.length <= length) {
    return file;
  }
  filename = filename.substr(0, length) + (file.length > length ? "..." : "");
  return filename + "." + fileExtension;
};
