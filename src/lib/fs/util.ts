import { isNil } from "lodash";
import mime from "mime";

import { errors } from "application";

export const fileSizeInMB = (file: File | number) =>
  (typeof file === "number" ? file : file.size) / 1024 / 1024;

export const fileSizeString = (file: File | number) => `${fileSizeInMB(file).toFixed(2)} MB`;

export const getFileType = (filename: string, strict = false): string | null => {
  const returnNull = () => {
    if (strict === false) {
      return null;
    }
    throw new errors.InvalidFileNameError(filename);
  };
  if (filename.indexOf(".") !== -1) {
    const ext = filename.split(".").pop();
    if (isNil(ext)) {
      return returnNull();
    } else if (ext.trim() === "") {
      throw new errors.InvalidFileNameError(filename);
    }
    return ext.trim();
  }
  return returnNull();
};

export const getDataFromBlob = (file: File | Blob): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      reader.result === null ? reject("Could not read data from blob.") : resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const getDataFromURL = (url: string): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function () {
      const reader = new FileReader();
      reader.readAsDataURL(xhr.response);
      reader.onload = () =>
        reader.result === null ? reject("Could not read data from URL.") : resolve(reader.result);
      reader.onerror = error => reject(error);
    };
    xhr.responseType = "blob";
    xhr.send();
  });

export const extensionIsImage = (ext: string) => {
  const mimeType = mime.getType(ext);
  if (isNil(mimeType)) {
    throw new errors.InvalidFileExtensionError(ext);
  }
  return mimeType.split("/")[0] === "image";
};
