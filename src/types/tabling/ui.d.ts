declare namespace Table {
  type DataGridInstance = {
    readonly getCSVData: (fields?: string[]) => CSVData;
  };

  type TableInstance<
    R extends RowData = RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = DataGridInstance & {
    readonly removeNotification: () => void;
    readonly notify: (notification: TableNotification) => void;
    readonly getColumns: () => Table.Column<R, M>[];
    readonly getFocusedRow: () => BodyRow<R> | null;
    readonly getRow: (id: BodyRowId) => BodyRow<R> | null;
    readonly getRows: () => BodyRow<R>[];
    readonly getRowsAboveAndIncludingFocusedRow: () => BodyRow<R>[];
    readonly applyTableChange: (event: SingleOrArray<Table.ChangeEvent<R, M>>) => void;
    readonly changeColumnVisibility: (changes: SingleOrArray<ColumnVisibilityChange>, sizeToFit?: boolean) => void;
  };

  type MenuActionObj = {
    readonly index?: number;
    readonly icon: IconOrElement;
    readonly tooltip?: Tooltip;
    readonly disabled?: boolean;
    readonly label?: string;
    readonly isWriteOnly?: boolean;
    // If being wrapped in a Dropdown, the onClick prop will not be used.
    readonly onClick?: () => void;
    readonly wrapInDropdown?: (children: import("react").ReactChild | import("react").ReactChild[]) => JSX.Element;
    readonly render?: RenderFunc;
  };

  type MenuActionParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly apis: GridApis;
    readonly columns: Column<R, M>[];
    readonly hiddenColumns?: HiddenColumns;
  };

  type UnauthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = MenuActionParams<R, M>;

  type AuthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = MenuActionParams<R, M> & {
    readonly selectedRows: EditableRow<R>[];
  };

  type MenuActionCallback<
    V,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = (params: T) => V;

  type MenuAction<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;

  type MenuActions<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

  type UnauthenticatedMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;

  type AuthenticatedMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  type UnauthenticatedMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;

  type AuthenticatedMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  interface DataGridConfig<R extends RowData> {
    readonly refreshRowExpandColumnOnCellHover?: (row: Row<R>) => boolean;
  }

  type AuthenticatedDataGridConfig<R extends RowData> = DataGridConfig<R> & {
    readonly rowCanDelete?: (row: EditableRow<R>) => boolean;
    readonly includeRowInNavigation?: (row: EditableRow<R>) => boolean;
  };

  type UnauthenticatedDataGridConfig<R extends RowData> = {
    readonly includeRowInNavigation?: (row: EditableRow<R>) => boolean;
  };

  type FooterGridConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly id: "page" | "footer";
    readonly rowClass: RowClassName;
    readonly className: GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: Column<R, M>) => FooterColumn<R, M> | null;
  };
}
