import { isNil } from "lodash";
import mime from "mime";

export const fileSizeInMB = (file: File | number) => (typeof file === "number" ? file : file.size) / 1024 / 1024;

export const getFileType = (filename: string): string | undefined => filename.split(".").pop();

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

export const parseFileNameAndExtension = (name: string, ext?: string): [string, string] => {
  let extension: string;
  let explicitExtension: string | null = null;
  if (!isNil(ext)) {
    if (ext.startsWith(".")) {
      explicitExtension = ext.slice(1);
    }
  }
  const extensionFromName = getFileType(name);
  if (isNil(extensionFromName)) {
    if (isNil(explicitExtension)) {
      throw new InvalidFileNameError(name);
    }
    extension = explicitExtension;
  } else {
    if (!isNil(explicitExtension) && explicitExtension !== extensionFromName) {
      throw new InvalidFileExtensionError(explicitExtension);
    }
    extension = extensionFromName;
  }
  return [name, extension];
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

type DownloadOptions = {
  readonly ext?: string;
  readonly includeExtensionInName?: boolean;
};

export const downloadData = async (data: string, name: string) => {
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

export const downloadBlob = async (blob: Blob, name: string) => {
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

export const download = async (
  fileObj: string | ArrayBuffer | Blob,
  nm: string,
  options: DownloadOptions = { includeExtensionInName: true }
) => {
  /* eslint-disable-next-line prefer-const */
  let [name, extension] = parseFileNameAndExtension(nm, options.ext);
  if (!name.endsWith(extension) && options.includeExtensionInName === true) {
    name = `${name}.${extension}`;
  } else if (name.endsWith(extension) && options.includeExtensionInName === false) {
    name = name.slice(0, name.indexOf(extension) - 1);
  }
  const mimeType = mime.getType(extension);
  if (isNil(mimeType)) {
    throw new InvalidFileExtensionError(extension);
  }
  let blob: Blob;
  if (!(fileObj instanceof Blob)) {
    if (fileObj instanceof ArrayBuffer) {
      blob = new Blob([fileObj], { type: mimeType });
      downloadBlob(blob, name);
      return;
    } else {
      downloadData(fileObj, name);
      return;
    }
  } else {
    downloadBlob(fileObj, name);
  }
};

export const downloadAsCsvFile = async (filename: string, data: CSVData) => {
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

  if (!filename.endsWith(".csv")) {
    filename = `${filename}.csv`;
  }

  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
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
