import { isNil } from "lodash";
import mime from "mime";

import { errors } from "application";

import * as parsers from "./parsers";
import * as types from "./types";

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

export const download = (
  fileObj: string | ArrayBuffer | Blob,
  nm: string,
  options?: Omit<parsers.ParseFileNameOptions, "formatForDownload">,
) => {
  const parsed = parsers.parseFileName(nm, options);

  const mimeType = mime.getType(parsed.extension);
  if (isNil(mimeType)) {
    throw new errors.InvalidFileExtensionError(parsed.extension);
  }
  let blob: Blob;
  if (!(fileObj instanceof Blob)) {
    if (fileObj instanceof ArrayBuffer) {
      blob = new Blob([fileObj], { type: mimeType });
      return downloadBlob(blob, parsed.fullName);
    }
    return downloadData(fileObj, parsed.fullName);
  }
  return downloadBlob(fileObj, parsed.fullName);
};

export const downloadAsCsvFile = (filename: string, data: types.CSVData) => {
  const processRow = (row: types.CSVRow): string => {
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
  const parsed = parsers.parseFileName(filename, { ext: "csv" });
  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, parsed.fullName);
};
