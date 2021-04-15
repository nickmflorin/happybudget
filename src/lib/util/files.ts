import { isNil } from "lodash";

export const getFileType = (filename: string): string | undefined => {
  if (!filename.includes(".")) {
    return undefined;
  }
  return filename.split(".").slice(-1)[0];
};

export const getBase64 = (file: File | Blob, callback: (result: string | ArrayBuffer | null) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(file);
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);
  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const isBase64 = (value: string): boolean => {
  if (value === "" || value.trim() === "") {
    return false;
  }
  try {
    return btoa(atob(value)) === value;
  } catch (err) {
    return false;
  }
};

export const download = async (file_obj: string, name: string, ext?: string) => {
  if (!isNil(ext)) {
    if (ext.startsWith(".")) {
      ext = ext.slice(1);
    }
  }
  let extension = getFileType(name);
  if (isNil(extension)) {
    if (isNil(ext)) {
      throw new Error(`Could not determine file type from file name ${name}.`);
    }
    extension = ext;
  } else {
    if (!isNil(ext) && ext !== extension) {
      throw new Error(`Invalid extension ${ext} for file name ${name}.`);
    }
  }
  if (name.endsWith(extension)) {
    name = `${name}.${extension}`;
  }
  let blob: Blob;
  if (isBase64(file_obj)) {
    const bytes = base64ToArrayBuffer(file_obj);
    blob = new Blob([bytes], { type: "application/" + extension });
  } else {
    blob = new Blob([file_obj], { type: "application/" + extension });
  }
  const blobUrl = URL.createObjectURL(blob);
  if (!isNil(blobUrl)) {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", name);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    if (!isNil(link.parentNode)) {
      link.parentNode.removeChild(link);
    }
  } else {
    throw new Error("Could not create blob from file data.");
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

  var csvFile = "";
  for (var i = 0; i < data.length; i++) {
    csvFile += processRow(data[i]);
  }

  if (!filename.endsWith(".csv")) {
    filename = `${filename}.csv`;
  }

  var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // Feature detection: Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
