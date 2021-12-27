import { useState, useMemo } from "react";
import { map, reduce, uniq, filter, isNil } from "lodash";

import { hooks, models, tabling } from "lib";
import { EditAttachmentsModal } from "components/modals";

interface UseAttachmentsProps<
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> {
  readonly table: Table.TableInstance<R, M>;
  readonly path: (id: number) => string;
  readonly onAttachmentRemoved: (row: Table.ModelRow<R>, id: number) => void;
  readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
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
  JSX.Element | null
];

export const useAttachments = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(
  props: UseAttachmentsProps<R, M>
): UseAttachmentsReturnType<R> => {
  const [editAttachments, setEditAttachments] = useState<number | null>(null);

  const processAttachmentsCellForClipboard = hooks.useDynamicCallback((row: R) =>
    map(row.attachments, (a: Model.SimpleAttachment) => a.id).join(", ")
  );

  const processAttachmentsCellFromClipboard = hooks.useDynamicCallback((value: string) => {
    const modelRows = filter(props.table.getRows(), (r: Table.Row<R>) =>
      tabling.typeguards.isModelRow(r)
    ) as Table.ModelRow<R>[];
    const attachments = reduce(
      modelRows,
      (curr: Model.SimpleAttachment[], r: Table.ModelRow<R>) => uniq([...curr, ...(r.data.attachments || [])]),
      []
    );
    return models.getModelsByIds<Model.SimpleAttachment>(attachments, models.parseIdsFromDeliminatedString(value), {
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
              props.onAttachmentRemoved(row, id);
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
              props.onAttachmentAdded(row, m);
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
  }, [editAttachments, props.table, props.onAttachmentAdded, props.onAttachmentRemoved]);

  return [processAttachmentsCellForClipboard, processAttachmentsCellFromClipboard, setEditAttachments, modal];
};
