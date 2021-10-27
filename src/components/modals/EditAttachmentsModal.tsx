import { useEffect, useState, useMemo } from "react";
import { FilePond } from "react-filepond";
import { filter } from "lodash";
import classNames from "classnames";
import { ActualFileObject, FilePondFile, ProgressServerConfigFunction } from "filepond/types";
import { ModalProps as RootModalProps } from "antd/lib/modal";

import * as api from "api";
import { notifications, redux } from "lib";
import { AttachmentsList } from "components/files";

import { Modal } from "./generic";

interface EditAttachmentsModalProps extends RootModalProps {
  readonly id: number;
  readonly open: boolean;
  readonly path: string;
  readonly onAttachmentAdded?: (m: Model.Attachment) => void;
  readonly listAttachments: (
    id: number,
    query?: Http.ListQuery,
    options?: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Attachment>>;
  readonly deleteAttachment: (id: number, objId: number, options?: Http.RequestOptions) => Promise<null>;
  readonly uploadAttachment: (id: number, data: FormData, options?: Http.RequestOptions) => Promise<Model.Attachment>;
}

const EditAttachmentsModal = ({
  id,
  open,
  path,
  listAttachments,
  deleteAttachment,
  onAttachmentAdded,
  uploadAttachment,
  ...props
}: EditAttachmentsModalProps): JSX.Element => {
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);
  const [cancelToken] = api.useCancelToken();
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachments, setAttachments] = useState<Model.Attachment[]>([]);
  const [files, setFiles] = useState<FilePondFile[]>([]);

  useEffect(() => {
    setLoadingAttachments(true);
    listAttachments(id, { no_pagination: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<Model.Attachment>) => setAttachments(response.data))
      .catch((e: Error) => notifications.requestError(e))
      .finally(() => setLoadingAttachments(false));
  }, [id]);

  const onDelete = useMemo(
    () => (attachment: Model.Attachment) => {
      setDeleting(attachment.id);
      deleteAttachment(attachment.id, id, { cancelToken: cancelToken() })
        .then(() => setAttachments(filter(attachments, (a: Model.Attachment) => a.id !== attachment.id)))
        .catch((e: Error) => notifications.requestError(e))
        .finally(() => setDeleted(attachment.id));
    },
    [setDeleting, setDeleted]
  );

  return (
    <Modal
      {...props}
      className={classNames("modal--no-footer", props.className)}
      visible={open}
      destroyOnClose={true}
      getContainer={false}
      title={"Attachments"}
      titleIcon={"file-alt"}
      loading={loadingAttachments}
      footer={null}
    >
      <AttachmentsList
        className={"mb--15"}
        attachments={attachments}
        showSize={true}
        isDeleting={isDeleting}
        onDelete={onDelete}
        style={{ maxHeight: 400, overflowY: "scroll" }}
      />
      <FilePond
        // @ts-ignore 2769 There seems to be an issue with the types between FilePondFile and InitialFilePondFile
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={true}
        labelIdle={"Drag & Drop or Click to Browse"}
        name={"files"}
        server={{
          revert: (uniqueFileId: string, load: () => void, error: (text: string) => void) => {
            const attachmentId = parseInt(uniqueFileId);
            if (!isNaN(attachmentId)) {
              deleteAttachment(attachmentId, id)
                .then(() => load())
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
            const url = `${process.env.REACT_APP_API_DOMAIN}${path}`;
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
                onAttachmentAdded?.(data);
              } else {
                error("There was an error processing the attachment.");
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
    </Modal>
  );
};

export default EditAttachmentsModal;
