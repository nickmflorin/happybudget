import React, { useState } from "react";

import { ActualFileObject, FilePondFile, ProgressServerConfigFunction } from "filepond/types";
import { map } from "lodash";
import { FilePond } from "react-filepond";

import * as api from "api";
import { notifications } from "lib";

interface AttachmentsFilePondProps {
  readonly id: number;
  readonly path: string;
  readonly onAttachmentRemoved?: (id: number) => void;
  readonly onAttachmentAdded?: (m: Model.Attachment) => void;
  readonly deleteAttachment: (
    id: number,
    objId: number,
    options?: Http.RequestOptions,
  ) => Promise<null>;
}

const AttachmentsFilePond = (props: AttachmentsFilePondProps): JSX.Element => {
  const [files, setFiles] = useState<FilePondFile[]>([]);

  return (
    <FilePond
      /* There seems to be an issue with the types between FilePondFile and
         InitialFilePondFile */
      files={files as unknown as ActualFileObject[]}
      onupdatefiles={setFiles}
      allowMultiple={true}
      labelIdle="Drag & Drop or Click to Browse"
      labelFileProcessingError={(error: { body: string }) =>
        error.body || "There was an error processing the attachment."
      }
      name="files"
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
          metadata: Record<string, unknown>,
          load: (p: string | Record<string, unknown>) => void,
          error: (errorText: string) => void,
          progress: ProgressServerConfigFunction,
          abort: () => void,
        ) => {
          const request = api.xhr.uploadAttachmentFile(file, props.path, {
            error: (e: Http.ApiError) => {
              notifications.internal.handleRequestError(e);
              error("There was an error uploading the attachment.");
            },
            progress,
            success: (ms: Model.Attachment[]) =>
              map(ms, (m: Model.Attachment) => {
                load(String(m.id));
                props.onAttachmentAdded?.(m);
              }),
          });
          return {
            abort: () => {
              request.abort();
              abort();
            },
          };
        },
      }}
    />
  );
};

export default React.memo(AttachmentsFilePond);
