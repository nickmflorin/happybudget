import { useEffect, useState } from "react";
import { FilePond } from "react-filepond";
import classNames from "classnames";
import { ActualFileObject, ProgressServerConfigFunction } from "filepond/types";
import { ModalProps as RootModalProps } from "antd/lib/modal";

import * as api from "api";
import { notifications } from "lib";
import { AttachmentsList } from "components/files";

import { Modal } from "./generic";

interface EditSubAccountAttachmentsModalProps extends RootModalProps {
  readonly id: number;
  readonly open: boolean;
  readonly onSuccess: (m: Model.SubAccount) => void;
  readonly onCancel: () => void;
}

const EditSubAccountAttachmentsModal = ({ id, open, ...props }: EditSubAccountAttachmentsModalProps): JSX.Element => {
  const [cancelToken] = api.useCancelToken();
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachments, setAttachments] = useState<Model.Attachment[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    setLoadingAttachments(true);
    api
      .getSubAccountAttachments(id, {}, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<Model.Attachment>) => setAttachments(response.data))
      .catch((e: Error) => notifications.requestError(e))
      .finally(() => setLoadingAttachments(false));
  }, [id]);

  return (
    <Modal
      {...props}
      className={classNames("modal--no-footer", props.className)}
      visible={open}
      destroyOnClose={true}
      okText={"Done"}
      cancelText={"Cancel"}
      getContainer={false}
      title={"Attachments"}
      titleIcon={"file-alt"}
      loading={loadingAttachments}
      footer={null}
    >
      <AttachmentsList className={"mb--15"} attachments={attachments} showSize={true} />
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={true}
        maxFiles={3}
        // eslint-disable-next-line quotes
        labelIdle={'Drag & Drop your files or <span class="filepond--label-action">Browse</span>'}
        name={"files"}
        server={{
          // remove: (
          //   source: any,
          //   load: (p: string | { [key: string]: any }) => void,
          //   error: (errorText: string) => void
          // ) => {
          //   console.log({ source });
          // },
          revert: (uniqueFileId: string, load: () => void, error: (text: string) => void) => {
            // const attachment: Model.Attachment = JSON.parse(uniqueFileId);
            const attachmentId = parseInt(uniqueFileId);
            if (!isNaN(attachmentId)) {
              api
                .deleteSubAccountAttachment(attachmentId, id)
                .then(() => load())
                .catch((e: Error) => {
                  error(e.message);
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
            const url = `${process.env.REACT_APP_API_DOMAIN}/v1/subaccounts/${id}/attachments/`;
            const formData = new FormData();
            formData.append("file", file, file.name);

            const request = new XMLHttpRequest();
            request.withCredentials = true;

            request.open("POST", url);
            api.setRequestHeaders(request);

            // Should call the progress method to update the progress to 100% before calling load
            // Setting computable to false switches the loading indicator to infinite mode
            request.upload.onprogress = e => {
              progress(e.lengthComputable, e.loaded, e.total);
            };
            request.onload = function () {
              if (request.status >= 200 && request.status < 300) {
                const data = JSON.parse(request.response);
                load(data.id);
              } else {
                // Can call the error method if something is wrong, should exit after
                error("oh no");
              }
            };

            request.send(formData);

            // Should expose an abort method so the request can be cancelled
            return {
              abort: () => {
                // This function is entered if the user has tapped the cancel button
                request.abort();

                // Let FilePond know the request has been cancelled
                abort();
              }
            };
          }
        }}
      />
    </Modal>
  );
};

export default EditSubAccountAttachmentsModal;
