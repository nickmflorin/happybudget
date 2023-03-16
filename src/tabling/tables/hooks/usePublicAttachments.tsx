import { map } from "lodash";

import { hooks } from "lib";

type UsePublicAttachmentsReturnType<
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
> = (row: R) => string;

const usePublicAttachments = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
>(): UsePublicAttachmentsReturnType<R> => {
  const processAttachmentsCellForClipboard = hooks.useDynamicCallback((row: R) =>
    map(row.attachments, (a: Model.SimpleAttachment) => a.id).join(", "),
  );

  return processAttachmentsCellForClipboard;
};

export default usePublicAttachments;
