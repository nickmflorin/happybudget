import { useState } from "react";
import { FilePond } from "react-filepond";
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
          const [request, formData] = api.xhr.uploadAttachmentFile(file, props.path, {
            error,
            progress,
            success: (m: Model.Attachment) => {
              load(String(m.id));
              props.onAttachmentAdded?.(m);
            }
          });
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
