import React, { useEffect, useMemo, useRef, useReducer } from "react";
import { isNil, map } from "lodash";
import { Progress } from "antd";

import * as api from "api";
import { ui, notifications } from "lib";

import { Icon } from "components";
import { AttachmentText } from "components/files";

import { Cell } from "./generic";

import "./AttachmentsCell.scss";

type DragCountAction = { type: "INCREMENT_COUNT" | "DECREMENT_COUNT" | "SET_DRAG" | "CLEAR"; payload?: boolean };
type DragState = { count: number; drag: boolean };
const InitialDragState: DragState = { count: 0, drag: false };

const DragCountReducer = (state: DragState = InitialDragState, action: DragCountAction): DragState => {
  let newState = { ...state };
  if (action.type === "INCREMENT_COUNT") {
    return { ...newState, count: newState.count + 1 };
  } else if (action.type === "SET_DRAG") {
    if (action.payload !== undefined) {
      return { ...newState, drag: action.payload };
    }
    return newState;
  } else if (action.type === "CLEAR") {
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
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.CellProps<R, M, S, Model.SimpleAttachment[]> {
  readonly uploadAttachmentsPath: (id: number) => string;
  readonly onAttachmentAdded: (row: Table.ModelRow<R>, attachment: Model.Attachment) => void;
}

/* eslint-disable indent */
const AttachmentsCell = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  value,
  ...props
}: AttachmentsCellProps<R, M, S>): JSX.Element => {
  const divRef = useRef<HTMLDivElement>(null);
  const [progressValue, progressActive, progressUpdate, progressCancel] = ui.progress.useDampenedProgress({
    dampenedRate: 0.1,
    perMilliseconds: 80
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
    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragIn = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatchDragState({ type: "INCREMENT_COUNT" });
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        dispatchDragState({ type: "SET_DRAG", payload: true });
      }
    };

    const handleDragOut = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatchDragState({ type: "DECREMENT_COUNT" });
    };

    const handleDrop = (e: DragEvent) => {
      const error = (message: string) => {
        // TODO: Display error in banner.
        notifications.notify({ message, level: "error", dispatchToSentry: true });
        progressCancel();
      };

      e.preventDefault();
      e.stopPropagation();
      dispatchDragState({ type: "SET_DRAG", payload: false });
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          api.xhr.uploadAttachmentFile(e.dataTransfer.files, props.uploadAttachmentsPath(row.id), {
            error,
            progress: (computable: boolean, percent: number, total: number) => progressUpdate(percent, total),
            /* eslint-disable-next-line no-loop-func */
            success: (ms: Model.Attachment[]) => map(ms, (m: Model.Attachment) => props.onAttachmentAdded(row, m))
          });
        }
        e.dataTransfer.clearData();
        dispatchDragState({ type: "CLEAR" });
      }
    };

    if (!isNil(divRef.current)) {
      divRef.current.addEventListener("dragenter", handleDragIn);
      divRef.current.addEventListener("dragleave", handleDragOut);
      divRef.current.addEventListener("dragover", handleDrag);
      divRef.current.addEventListener("drop", handleDrop);
    }
    return () => {
      divRef.current?.removeEventListener("dragenter", handleDragIn);
      divRef.current?.removeEventListener("dragleave", handleDragOut);
      divRef.current?.removeEventListener("dragover", handleDrag);
      divRef.current?.removeEventListener("drop", handleDrop);
    };
  });

  const content = useMemo(() => {
    if (progressActive) {
      return <Progress className={"progress-bar"} percent={Math.floor(progressValue * 100.0)} />;
    } else {
      if (dragState.drag) {
        return (
          <div className={"drag"}>
            <Icon weight={"regular"} icon={"arrow-circle-down"} />
            {"Drop files here"}
          </div>
        );
      } else if (!isNil(attachment)) {
        return <AttachmentText additionalCount={additionalCount}>{attachment}</AttachmentText>;
      } else {
        return (
          <div className={"selected"}>
            <Icon weight={"regular"} icon={"arrow-circle-down"} />
            {"Double click or drop files here"}
          </div>
        );
      }
    }
  }, [attachment, progressActive, dragState.drag, progressValue]);

  return (
    <Cell {...props} ref={divRef} className={"cell--attachments"}>
      {content}
    </Cell>
  );
};

export default React.memo(AttachmentsCell);
