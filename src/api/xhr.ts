import { isNil } from "lodash";
import { ActualFileObject } from "filepond/types";

import { setRequestHeaders } from "./client";
import { parseFieldError, parseGlobalError } from "./util";

type UploadAttachmentFileOptions = {
  readonly progress?: (computable: boolean, percent: number, total: number) => void;
  readonly error?: (message: string) => void;
  readonly success?: (m: Model.Attachment) => void;
  readonly send?: boolean;
};

export const uploadAttachmentFile = (
  file: File | ActualFileObject,
  path: string,
  options?: UploadAttachmentFileOptions
): [XMLHttpRequest, FormData] => {
  const url = `${process.env.REACT_APP_API_DOMAIN}${path}`;
  const formData = new FormData();
  formData.append("file", file, file.name);

  const request = new XMLHttpRequest();
  request.withCredentials = true;

  request.open("POST", url);
  setRequestHeaders(request);

  request.upload.onprogress = evt => {
    options?.progress?.(evt.lengthComputable, evt.loaded, evt.total);
  };

  request.onload = function () {
    if (request.status >= 200 && request.status < 300) {
      const data: Model.Attachment = JSON.parse(request.response);
      options?.success?.(data);
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
          console.warn("Unexpected error returned when uploading attachment. \n" + JSON.stringify(errorData));
          options?.error?.("There was an error processing the attachment.");
        }
      } else {
        options?.error?.("There was an error processing the attachment.");
      }
    }
  };
  if (options?.send !== false) {
    request.send(formData);
  }
  return [request, formData];
};
