import { useState, useMemo } from "react";
import { reduce, uniq, filter, isNil } from "lodash";

import { hooks, models, tabling } from "lib";
import { EditAttachmentsModal } from "components/modals";

import usePublicAttachments from "./usePublicAttachments";

interface UseAttachmentsProps<
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> {
  readonly table: Table.TableInstance<R, M>;
  readonly path: (id: number) => string;
  readonly listAttachments: (
    id: number,
    query?: Http.ListQuery,
    options?: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Attachment>>;
  readonly deleteAttachment: (id: number, objId: number, options?: Http.RequestOptions) => Promise<null>;
}

type UseAttachmentsReturnType<R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData> = [
  (row: R) => string,
  (value: string) => Model.SimpleAttachment[],
  (id: number) => void,
  JSX.Element | null,
  (row: Table.ModelRow<R>, attachment: Model.Attachment) => void,
  (row: Table.ModelRow<R>, id: number) => void
];

const useAttachments = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(
  props: UseAttachmentsProps<R, M>
): UseAttachmentsReturnType<R> => {
  const [editAttachments, setEditAttachments] = useState<number | null>(null);

  const removeAttachment = useMemo(
    () => (row: Table.ModelRow<R>, rowId: number) => {
      props.table.dispatchEvent({
        type: "updateRows",
        payload: {
          id: row.id,
          data: {
            attachments: filter(row.data.attachments, (a: Model.SimpleAttachment) => a.id !== rowId)
          } as Partial<R>
        }
      });
    },
    [props.table]
  );

  const addAttachment = useMemo(
    () => (row: Table.ModelRow<R>, attachment: Model.Attachment) => {
      props.table.dispatchEvent({
        type: "updateRows",
        payload: {
          id: row.id,
          data: {
            attachments: [
              ...(row.data.attachments || []),
              { id: attachment.id, name: attachment.name, extension: attachment.extension, url: attachment.url }
            ]
          } as Partial<R>
        }
      });
    },
    [props.table]
  );

  const processAttachmentsCellForClipboard = usePublicAttachments();

  const processAttachmentsCellFromClipboard = hooks.useDynamicCallback((value: string) => {
    const modelRows = filter(props.table.getRows(), (r: Table.Row<R>) =>
      tabling.typeguards.isModelRow(r)
    ) as Table.ModelRow<R>[];
    const attachments = reduce(
      modelRows,
      (curr: Model.SimpleAttachment[], r: Table.ModelRow<R>) => uniq([...curr, ...(r.data.attachments || [])]),
      []
    );
    return models.getModels<Model.SimpleAttachment>(attachments, models.parseIdsFromDeliminatedString(value), {
      warnOnMissing: false,
      modelName: "attachment"
    });
  });

  const modal = useMemo(() => {
    if (isNil(editAttachments)) {
      return null;
    }
    return (
      <EditAttachmentsModal
        id={editAttachments}
        listAttachments={props.listAttachments}
        deleteAttachment={props.deleteAttachment}
        path={props.path(editAttachments)}
        open={true}
        onCancel={() => setEditAttachments(null)}
        onAttachmentRemoved={(id: number) => {
          const row = props.table.getRow(editAttachments);
          if (!isNil(row)) {
            if (tabling.typeguards.isModelRow(row)) {
              removeAttachment(row, id);
            } else {
              console.warn(
                `Suspicous Behavior: After attachment was added, row with ID
                ${editAttachments} did not refer to a model row.`
              );
            }
          } else {
            console.warn(
              `Suspicous Behavior: After attachment was added, could not find row in
              state for ID ${editAttachments}.`
            );
          }
        }}
        onAttachmentAdded={(m: Model.Attachment) => {
          const row = props.table.getRow(editAttachments);
          if (!isNil(row)) {
            if (tabling.typeguards.isModelRow(row)) {
              addAttachment(row, m);
            } else {
              console.warn(
                `Suspicous Behavior: After attachment was added, row with ID
                ${editAttachments} did not refer to a model row.`
              );
            }
          } else {
            console.warn(
              `Suspicous Behavior: After attachment was added, could not find row in
              state for ID ${editAttachments}.`
            );
          }
        }}
      />
    );
  }, [editAttachments, props.table, addAttachment, removeAttachment]);

  return [
    processAttachmentsCellForClipboard,
    processAttachmentsCellFromClipboard,
    setEditAttachments,
    modal,
    addAttachment,
    removeAttachment
  ];
};

export default useAttachments;
