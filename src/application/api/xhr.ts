import { ActualFileObject } from "filepond/types";

import * as config from "application/config";

import * as errors from "../../api/deprecated/errors";
import * as parsers from "../../api/deprecated/parsers";

import { setRequestHeaders } from "./util/util";

type XHRRequestOptions<R> = {
  readonly progress?: (computable: boolean, percent: number, total: number) => void;
  readonly error?: (e: Http.ApiError) => void;
  readonly success?: (r: R) => void;
  readonly send?: boolean;
};

export const xhrRequestor = <R>(
  req: XMLHttpRequest,
  data: FormData,
  opts?: XHRRequestOptions<R>,
): XMLHttpRequest => {
  req.withCredentials = true;
  setRequestHeaders(req);

  req.upload.onprogress = (evt: ProgressEvent) => {
    opts?.progress?.(evt.lengthComputable, evt.loaded, evt.total);
  };

  req.onload = function () {
    const err = parsers.parseErrorFromResponse(
      {
        data: req.response,
        url: req.responseURL,
        status: req.status,
      },
      true,
    );
    if (err !== null) {
      // If the user is being force logged out - do nothing.
      if (!(err instanceof errors.ForceLogout)) {
        throw opts?.error?.(err);
      }
    } else {
      const responseData = JSON.parse(req.response);
      opts?.success?.(responseData);
    }
  };
  if (opts?.send !== false) {
    req.send(data);
  }
  return req;
};

export const xhrPostRequest = <R>(path: string, data: FormData, opts?: XHRRequestOptions<R>) => {
  const request = new XMLHttpRequest();
  const url = `${config.env.API_DOMAIN}${path}`;
  request.open("POST", url, true);
  return xhrRequestor(request, data, opts);
};

type F = File | ActualFileObject;
type UploadableFileProp = F | FileList | F[];

const isFile = (f: UploadableFileProp): f is F =>
  typeof f === "object" && (f as F).name !== undefined;

const isFiles = (f: UploadableFileProp): f is F[] => Array.isArray(f);

export const uploadAttachmentFile = (
  file: File | ActualFileObject | (File | ActualFileObject)[] | FileList,
  path: string,
  options?: XHRRequestOptions<Model.Attachment[]>,
): XMLHttpRequest => {
  const formData = new FormData();
  if (isFile(file)) {
    formData.append("file", file, file.name);
  } else if (isFiles(file)) {
    for (let i = 0; i < file.length; i++) {
      formData.append("files", file[i], file[i].name);
    }
  } else {
    Object.entries(file).forEach((v: [string, File]) => formData.append("files", v[1], v[1].name));
  }
  return xhrPostRequest<{ readonly data: Model.Attachment[] }>(path, formData, {
    ...options,
    success: (r: { readonly data: Model.Attachment[] }) => options?.success?.(r.data),
  });
};
