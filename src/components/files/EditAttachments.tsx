import React, { useEffect, useMemo, useState } from "react";

import { filter } from "lodash";

import { redux, notifications, http } from "lib";

import AttachmentsFilePond from "./AttachmentsFilePond";
import AttachmentsList from "./AttachmentsList";

export interface EditAttachmentsProps {
  readonly modelId: number;
  readonly path: string;
  readonly onDownloadError: (e: Error) => void;
  readonly onAttachmentRemoved?: (id: number) => void;
  readonly onAttachmentAdded?: (m: Model.Attachment) => void;
  readonly listAttachments: (
    id: number,
    query?: Http.ListQuery,
    options?: Http.RequestOptions,
  ) => Promise<Http.ListResponse<Model.Attachment>>;
  readonly deleteAttachment: (
    id: number,
    objId: number,
    options?: Http.RequestOptions,
  ) => Promise<null>;
}

const EditAttachments = (props: EditAttachmentsProps): JSX.Element => {
  const {
    isActive: isDeleting,
    removeFromState: setDeleted,
    addToState: setDeleting,
  } = redux.useTrackModelActions([]);
  const [cancelToken] = http.useCancelToken();
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachments, setAttachments] = useState<Model.Attachment[]>([]);

  useEffect(() => {
    setLoadingAttachments(true);
    props
      .listAttachments(props.modelId, {}, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<Model.Attachment>) => setAttachments(response.data))
      .catch((e: Error) => notifications.internal.handleRequestError(e))
      .finally(() => setLoadingAttachments(false));
  }, [props.modelId]);

  const onAttachmentAdded = useMemo(
    () => (attachment: Model.Attachment) => {
      setAttachments([...attachments, attachment]);
      props.onAttachmentAdded?.(attachment);
    },
    [attachments, props.onAttachmentAdded],
  );

  const onAttachmentRemoved = useMemo(
    () => (id: number) => {
      setAttachments(filter(attachments, (a: Model.Attachment) => a.id !== id));
      props.onAttachmentRemoved?.(id);
    },
    [attachments, props.onAttachmentRemoved],
  );

  const onDelete = useMemo(
    () => (attachment: Model.Attachment) => {
      setDeleting(attachment.id);
      props
        .deleteAttachment(attachment.id, props.modelId, { cancelToken: cancelToken() })
        .then(() => onAttachmentRemoved(attachment.id))
        .catch((e: Error) => notifications.internal.handleRequestError(e))
        .finally(() => setDeleted(attachment.id));
    },
    [setDeleting, setDeleted],
  );

  return (
    <div className="edit-attachments">
      {attachments.length !== 0 && (
        <AttachmentsList
          attachments={attachments}
          loading={loadingAttachments}
          onDownloadError={props.onDownloadError}
          isDeleting={isDeleting}
          onDelete={onDelete}
          style={{ maxHeight: 400, overflowY: "scroll", marginBottom: 15 }}
        />
      )}
      <AttachmentsFilePond
        id={props.modelId}
        path={props.path}
        onAttachmentAdded={onAttachmentAdded}
        onAttachmentRemoved={onAttachmentRemoved}
        deleteAttachment={props.deleteAttachment}
      />
    </div>
  );
};

export default React.memo(EditAttachments);
