import { isNil } from "lodash";

export const getFileType = (filename: string): string | undefined => {
  if (!filename.includes(".")) {
    return undefined;
  }
  // TODO: Validate that the extension is valid.
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

export const download = (file_obj: string, name: string) => {
  const bytes = base64ToArrayBuffer(file_obj);
  const currentBlob = new Blob([bytes], { type: "application/" + getFileType(name) });
  const blobUrl = window.URL.createObjectURL(currentBlob);
  if (!isNil(blobUrl)) {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    if (!isNil(link.parentNode)) {
      link.parentNode.removeChild(link);
    }
  } else {
    throw new Error("Could not create blog from file data.");
  }
};

export const downloadAsJsonFile = async (filename: string, data: any) => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const href = await URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  if (!filename.endsWith(".json")) {
    filename = `${filename}.json`;
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
