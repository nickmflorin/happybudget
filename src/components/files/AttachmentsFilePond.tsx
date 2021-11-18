import { useState } from "react";
import { FilePond } from "react-filepond";
import { isNil } from "lodash";
import { ActualFileObject, FilePondFile, ProgressServerConfigFunction } from "filepond/types";

import * as api from "api";

interface AttachmentsFilePondProps {
  readonly id: number;
  readonly path: string;
  readonly onAttachmentRemoved?: (id: number) => void;
  readonly onAttachmentAdded?: (m: Model.Attachment) => void;
  readonly deleteAttachment: (id: number, objId: number, options?: Http.RequestOptions) => Promise<null>;
}

const AttachmentsFilePond = (props: AttachmentsFilePondProps): JSX.Element => {
  const [files, setFiles] = useState<FilePondFile[]>([]);

  return (
    <FilePond
      // @ts-ignore 2769 There seems to be an issue with the types between FilePondFile and InitialFilePondFile
      files={files}
      onupdatefiles={setFiles}
      allowMultiple={true}
      labelIdle={"Drag & Drop or Click to Browse"}
      labelFileProcessingError={(error: any) => {
        return error.body || "There was an error processing the attachment.";
      }}
      name={"files"}
      server={{
        revert: (uniqueFileId: string, load: () => void, error: (text: string) => void) => {
          const attachmentId = parseInt(uniqueFileId);
          if (!isNaN(attachmentId)) {
            props
              .deleteAttachment(attachmentId, props.id)
              .then(() => {
                props.onAttachmentRemoved?.(attachmentId);
                load();
              })
              .catch((e: Error) => {
                console.error(e.message);
                error("There was a problem deleting the attachment.");
              });
          } else {
            console.error("File Upload Error: Could not parse Attachment ID from response.");
            error("There was a problem deleting the attachment.");
          }
        },
        process: (
          fieldName: string,
          file: ActualFileObject,
          metadata: { [key: string]: any },
          load: (p: string | { [key: string]: any }) => void,
          error: (errorText: string) => void,
          progress: ProgressServerConfigFunction,
          abort: () => void
        ) => {
          const url = `${process.env.REACT_APP_API_DOMAIN}${props.path}`;
          const formData = new FormData();
          formData.append("file", file, file.name);

          const request = new XMLHttpRequest();
          request.withCredentials = true;

          request.open("POST", url);
          api.setRequestHeaders(request);

          request.upload.onprogress = e => {
            progress(e.lengthComputable, e.loaded, e.total);
          };
          request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
              const data: Model.Attachment = JSON.parse(request.response);
              load(String(data.id));
              props.onAttachmentAdded?.(data);
            } else {
              let errorData: Http.ErrorResponse | null = null;
              try {
                errorData = JSON.parse(request.response);
              } catch (e) {
                if (e instanceof SyntaxError) {
                  console.warn("Could not parse error data from response while uploading attachment.");
                  error("There was an error processing the attachment.");
                } else {
                  throw e;
                }
              }
              if (!isNil(errorData)) {
                const fieldError = api.parseFieldError(errorData.errors, "file");
                const globalError = api.parseGlobalError(errorData.errors);
                if (!isNil(globalError)) {
                  error(globalError.message);
                } else if (!isNil(fieldError)) {
                  error(fieldError.message);
                } else {
                  console.warn("Unexpected error returned when uploading attachment. \n" + JSON.stringify(errorData));
                  error("There was an error processing the attachment.");
                }
              } else {
                error("There was an error processing the attachment.");
              }
            }
          };
          request.send(formData);
          return {
            abort: () => {
              request.abort();
              abort();
            }
          };
        }
      }}
    />
  );
};

export default AttachmentsFilePond;
