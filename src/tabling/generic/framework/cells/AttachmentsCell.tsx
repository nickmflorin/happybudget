import React, { useEffect, useMemo, useRef, useReducer } from "react";

import { isNil, map } from "lodash";
import { Progress } from "antd";

import * as api from "api";
import { ui, enumeratedLiterals, EnumeratedLiteralType } from "lib";
import { Icon } from "components";
import { AttachmentText } from "components/typography";

import { Cell } from "./generic";

type DragEventName = "dragenter" | "dragover" | "dragleave" | "drop";

type Listener<T extends DragEventName = DragEventName> = {
  event: T;
  handler: (e: HTMLElementEventMap[T]) => void;
};

const DragCountActionTypes = enumeratedLiterals([
  "increment",
  "decrement",
  "set",
  "clear",
] as const);
type DragCountActionType = EnumeratedLiteralType<typeof DragCountActionTypes>;

type DragCountAction = {
  type: DragCountActionType;
  payload?: boolean;
};

type DragState = { count: number; drag: boolean };

const InitialDragState: DragState = { count: 0, drag: false };

const DragCountReducer = (
  state: DragState = InitialDragState,
  action: DragCountAction,
): DragState => {
  let newState = { ...state };
  if (action.type === DragCountActionTypes.INCREMENT) {
    return { ...newState, count: newState.count + 1 };
  } else if (action.type === DragCountActionTypes.SET) {
    if (action.payload !== undefined) {
      return { ...newState, drag: action.payload };
    }
    return newState;
  } else if (action.type === DragCountActionTypes.CLEAR) {
    return { ...newState, count: 0, drag: false };
  } else {
    newState = { ...newState, count: Math.max(newState.count - 1, 0) };
    if (newState.count === 0) {
      newState = { ...newState, drag: false };
    }
    return newState;
  }
};

interface AttachmentsCellProps<
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> extends Table.CellProps<R, M, C, S, Model.SimpleAttachment[]> {
  readonly uploadAttachmentsPath: (id: number) => string;
  readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
}

const AttachmentsCell = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>({
  value,
  ...props
}: AttachmentsCellProps<R, M, C, S>): JSX.Element => {
  const divRef = useRef<HTMLDivElement>(null);
  const [progressValue, progressActive, progressUpdate, progressCancel] =
    ui.progress.useDampenedProgress({
      dampenedRate: 0.1,
      perMilliseconds: 80,
    });

  const [dragState, dispatchDragState] = useReducer(DragCountReducer, InitialDragState);
  const row: Table.ModelRow<R> = props.node.data;

  const [attachment, additionalCount] = useMemo(() => {
    if (!isNil(value) && value.length !== 0) {
      return [value[0], value.slice(1).length];
    }
    return [null, 0];
  }, [value]);

  useEffect(() => {
    const cellRef = divRef.current;

    const listeners: Listener[] = [
      {
        event: "dragenter",
        handler: (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          dispatchDragState({ type: DragCountActionTypes.INCREMENT });
          if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
            dispatchDragState({ type: DragCountActionTypes.SET, payload: true });
          }
        },
      },
      {
        event: "dragover",
        handler: (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
        },
      },
      {
        event: "dragleave",
        handler: (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          dispatchDragState({ type: DragCountActionTypes.DECREMENT });
        },
      },
      {
        event: "drop",
        handler: (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          dispatchDragState({ type: DragCountActionTypes.SET, payload: false });
          if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            api.xhr.uploadAttachmentFile(
              e.dataTransfer.files,
              props.uploadAttachmentsPath(row.id),
              {
                error: (err: Http.ApiError) => {
                  props.table.handleRequestError(err, {
                    message: "There was an error uploading the attachment.",
                  });
                  progressCancel();
                },
                progress: (computable: boolean, percent: number, total: number) =>
                  progressUpdate(percent, total),
                success: (ms: Model.Attachment[]) =>
                  map(ms, (m: Model.Attachment) => props.onAttachmentAdded(row, m)),
              },
            );
            e.dataTransfer.clearData();
            dispatchDragState({ type: DragCountActionTypes.CLEAR });
          }
        },
      },
    ];

    listeners.forEach((l: Listener) => {
      if (cellRef !== null) {
        cellRef.addEventListener(l.event, l.handler);
      }
    });

    return () => {
      listeners.forEach((l: Listener) => {
        if (cellRef !== null) {
          cellRef.removeEventListener(l.event, l.handler);
        }
      });
    };
  });

  const content = useMemo(() => {
    if (progressActive) {
      return <Progress className="progress-bar" percent={Math.floor(progressValue * 100.0)} />;
    } else {
      if (dragState.drag) {
        return (
          <div className="drag">
            <Icon weight="regular" icon="arrow-circle-down" />
            Drop files here
          </div>
        );
      } else if (!isNil(attachment)) {
        return <AttachmentText additionalCount={additionalCount}>{attachment}</AttachmentText>;
      } else {
        return (
          <div className="selected">
            <Icon weight="regular" icon="arrow-circle-down" />
            Double click or drop files here
          </div>
        );
      }
    }
  }, [attachment, progressActive, dragState.drag, progressValue, additionalCount]);

  return (
    <Cell {...props} ref={divRef} className="cell--attachments">
      {content}
    </Cell>
  );
};

export default React.memo(AttachmentsCell);
