import { isNil } from "lodash";
import { ActualFileObject } from "filepond/types";

import { notifications } from "lib";

import { parseFieldError, parseGlobalError, setRequestHeaders } from "./util";

type UploadAttachmentFileOptions = {
  readonly progress?: (computable: boolean, percent: number, total: number) => void;
  readonly error?: (message: string) => void;
  readonly success?: (m: Model.Attachment[]) => void;
  readonly send?: boolean;
};

type F = File | ActualFileObject;
type UploadableFileProp = F | FileList | F[];

const isFile = (f: UploadableFileProp): f is F => {
  return typeof f === "object" && (f as F).name !== undefined;
};

const isFiles = (f: UploadableFileProp): f is F[] => Array.isArray(f);

export const uploadAttachmentFile = (
  file: File | ActualFileObject | (File | ActualFileObject)[] | FileList,
  path: string,
  options?: UploadAttachmentFileOptions
): XMLHttpRequest => {
  const url = `${process.env.REACT_APP_API_DOMAIN}${path}`;
  const formData = new FormData();

  if (isFile(file)) {
    formData.append("file", file, file.name);
  } else if (isFiles(file)) {
    for (let i = 0; i < file.length; i++) {
      formData.append("files", file[i], file[i].name);
    }
  } else {
    Object.entries(file).forEach((v: [string, File]) => formData.append("file", v[1], v[1].name));
  }

  const request = new XMLHttpRequest();
  request.open("POST", url, true);

  request.withCredentials = true;
  setRequestHeaders(request);

  request.upload.onprogress = evt => {
    options?.progress?.(evt.lengthComputable, evt.loaded, evt.total);
  };

  request.onload = function () {
    if (request.status >= 200 && request.status < 300) {
      const responseData: { data: Model.Attachment[] } = JSON.parse(request.response);
      options?.success?.(responseData.data);
    } else {
      if (request.status === 401) {
        // It is safe to assume that this is not the token validation endpoint.
        window.location.href = "/login";
      } else {
        let errorData: Http.ErrorResponse | null = null;
        try {
          errorData = JSON.parse(request.response);
        } catch (err) {
          if (err instanceof SyntaxError) {
            console.warn("Could not parse error data from response while uploading attachment.");
            options?.error?.("There was an error processing the attachment.");
          } else {
            throw err;
          }
        }
        if (!isNil(errorData)) {
          const fieldError = parseFieldError(errorData.errors, "file");
          const globalError = parseGlobalError(errorData.errors);
          if (!isNil(globalError)) {
            options?.error?.(globalError.message);
          } else if (!isNil(fieldError)) {
            options?.error?.(fieldError.message);
          } else {
            console.warn(
              "Unexpected error returned when uploading attachment. \n" + notifications.objToJson(errorData)
            );
            options?.error?.("There was an error processing the attachment.");
          }
        } else {
          options?.error?.("There was an error processing the attachment.");
        }
      }
    }
  };
  if (options?.send !== false) {
    request.send(formData);
  }
  return request;
};
