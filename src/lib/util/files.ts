import { isNil } from "lodash";

export const fileSizeInMB = (file: File) => file.size / 1024 / 1024;

export const getFileType = (filename: string): string | undefined => {
  if (!filename.includes(".")) {
    return undefined;
  }
  return filename.split(".").slice(-1)[0];
};

export const getBase64 = (file: File | Blob): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      reader.result === null ? reject("Could not encode image with base64 encoding.") : resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const getBase64FromUrl = (url: string): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.readAsDataURL(xhr.response);
      reader.onload = () =>
        reader.result === null ? reject("Could not determine base64 encoding from URL.") : resolve(reader.result);
      reader.onerror = error => reject(error);
    };
    // For AWS S3 Bucket
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  });

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);
  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const stringIsBase64 = (value: string): boolean => {
  if (value === "" || value.trim() === "") {
    return false;
  }
  try {
    return btoa(atob(value)) === value;
  } catch (err) {
    return false;
  }
};

type DownloadOptions = {
  readonly ext?: string;
  readonly includeExtensionInName?: boolean;
};

export const removeBase64IndicatorsFromString = (value: string, ext: string): string => {
  const indicators = [`data:application/${ext.toLowerCase()};`, "base64,", "base64"];
  for (let i = 0; i < indicators.length; i++) {
    value = value.replace(indicators[i], "");
  }
  return value.trim();
};

export const download = async (
  fileObj: string | ArrayBuffer | Blob,
  name: string,
  options: DownloadOptions = { includeExtensionInName: true }
) => {
  let extension: string;

  let explicitExtension: string | null = null;
  if (!isNil(options.ext)) {
    if (options.ext.startsWith(".")) {
      explicitExtension = options.ext.slice(1);
    }
  }
  let extensionFromName = getFileType(name);
  if (isNil(extensionFromName)) {
    if (isNil(explicitExtension)) {
      throw new Error(`Could not determine file type from file name ${name}.`);
    }
    extension = explicitExtension;
  } else {
    if (!isNil(explicitExtension) && explicitExtension !== extensionFromName) {
      throw new Error(`Invalid extension ${explicitExtension} for file name ${name}.`);
    }
    extension = extensionFromName;
  }
  if (!name.endsWith(extension) && options.includeExtensionInName === true) {
    name = `${name}.${extension}`;
  } else if (name.endsWith(extension) && options.includeExtensionInName === false) {
    name = name.slice(0, name.indexOf(extension) - 1);
  }
  let blob: Blob;
  if (!(fileObj instanceof Blob)) {
    if (fileObj instanceof ArrayBuffer) {
      blob = new Blob([fileObj], { type: "application/" + extension });
    } else {
      fileObj = removeBase64IndicatorsFromString(fileObj, extension);
      if (stringIsBase64(fileObj)) {
        const bytes = base64ToArrayBuffer(fileObj);
        blob = new Blob([bytes], { type: "application/" + extension });
      } else {
        blob = new Blob([fileObj], {
          type: "application/" + extension
        });
      }
    }
  } else {
    blob = fileObj;
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

export const truncateFileName = (file: string, length: number) => {
  const fileExtension = getFileType(file);
  let filename = file.replace("." + fileExtension, "");
  if (filename.length <= length) {
    return file;
  }
  filename = filename.substr(0, length) + (file.length > length ? "..." : "");
  return filename + "." + fileExtension;
};
