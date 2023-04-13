import { useRef } from "react";

import { logger } from "internal";
import { notifications } from "lib";

import * as model from "../model";

import * as rows from "./rows";
import * as types from "./types";

export const InitialGridRef: types.DataGridInstance = {
  getCSVData: () => [],
};

export const useDataGrid = (): NonNullRef<types.DataGridInstance> =>
  useRef<types.DataGridInstance>(InitialGridRef);

export const InitialTableRef: types.TableInstance<rows.Row> = {
  ...InitialGridRef,
  notifications: [],
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  saving: () => {},
  notify: () => {
    logger.warn(
      `Cannot dispatch notifications ${notifications.objToJson(
        notifications,
      )} to table because table ref has not been attached yet.`,
    );
    return [];
  },
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  clearNotifications: () => {},
  lookupAndNotify: () => [],
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  handleRequestError: () => [],
  getColumns: () => [],
  getFocusedRow: () => null,
  getRow: () => null,
  getRows: () => [],
  getRowsAboveAndIncludingFocusedRow: () => [],
  /* eslint-disable @typescript-eslint/no-empty-function */
  changeColumnVisibility: () => {},
  /* eslint-disable @typescript-eslint/no-empty-function */
  dispatchEvent: () => {},
};

export const useTable = <
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
>(): NonNullRef<types.TableInstance<R, M>> =>
  useRef<types.TableInstance<R, M>>(InitialTableRef as types.TableInstance<R, M>);
