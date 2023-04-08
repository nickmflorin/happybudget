import { isNil, filter, includes, reduce, map, uniq } from "lodash";

import { tabling, redux, util } from "lib";

export const reorderRows = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  st: S,
): S => ({
  ...st,
  data: tabling.rows.orderTableData<R>(st.data),
});

export const groupRowFromState = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  st: S,
  id: Table.GroupRowId,
  rowId?: Table.ModelRowId,
  options?: Model.GetReduxModelOptions<Table.GroupRow<R>>,
): Table.GroupRow<R> | null => {
  let predicate: Model.ModelLookup<Table.GroupRow<R>> = id;
  if (!isNil(rowId)) {
    predicate = (g: Table.GroupRow<R>) => g.id === id && includes(g.children, rowId);
  }
  return redux.modelFromState<Table.GroupRow<R>>(
    filter(st.data, (r: Table.BodyRow<R>) => tabling.rows.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    options,
  );
};

export const markupRowFromState = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  st: S,
  id: Table.MarkupRowId,
  rowId?: Table.ModelRowId,
  options?: Model.GetModelOptions<Table.MarkupRow<R>>,
): Table.MarkupRow<R> | null => {
  let predicate = (mrk: Table.MarkupRow<R>) => mrk.id === id;
  if (!isNil(rowId)) {
    predicate = (mrk: Table.MarkupRow<R>) => mrk.id === id && includes(mrk.children, rowId);
  }
  return redux.modelFromState<Table.MarkupRow<R>>(
    filter(st.data, (r: Table.BodyRow<R>) => tabling.rows.isMarkupRow(r)) as Table.MarkupRow<R>[],
    predicate,
    options,
  );
};

export const rowGroupRowFromState = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  st: S,
  rowId: Table.ModelRowId,
  options?: Model.GetReduxModelOptions<Table.GroupRow<R>>,
): Table.GroupRow<R> | null => {
  const predicate = (g: Table.GroupRow<R>) => includes(g.children, rowId);
  return redux.modelFromState<Table.GroupRow<R>>(
    filter(st.data, (r: Table.BodyRow<R>) => tabling.rows.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    options,
  );
};

export const removeRowsFromTheirGroupsIfTheyExist = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  st: S,
  rowIds: (Table.ModelRowId | Table.ModelRow<R>)[],
): S => {
  /*
	Keep track of which groups were altered and what their most recent children
	were after all alterations, because it will be faster to recalculate the
	groups in the state after so we can only recalculate each group once.
	*/
  type Alteration = {
    groupRow: Table.GroupRow<R>;
    children: number[];
  };
  type AlteredGroups = { [key: Table.GroupRowId]: Alteration };

  const alteredGroupsWithChildren: AlteredGroups = reduce(
    rowIds,
    (alterations: AlteredGroups, rowId: Table.ModelRowId | Table.ModelRow<R>) => {
      let r: Table.ModelRow<R> | null = null;
      if (typeof rowId === "number" || typeof rowId === "string") {
        r = redux.modelFromState<Table.ModelRow<R>>(
          filter(st.data, (ri: Table.BodyRow<R>) =>
            tabling.rows.isDataRow(ri),
          ) as Table.ModelRow<R>[],
          rowId,
        );
      } else {
        r = rowId;
      }
      if (!isNil(r)) {
        const groupRow = rowGroupRowFromState<R, S>(st, r.id, { warnOnMissing: false });
        if (!isNil(groupRow)) {
          /*
					This will be overwrittten if a group belongs to multiple rows
					associated with the provided IDS - but that is what we want, because
					we want the final values to have the most up to date children for
					each group after all alterations.
					*/
          const modelId = r.id;
          return {
            ...alterations,
            [groupRow.id]: {
              groupRow,
              children: filter(groupRow.children, (id: number) => id !== modelId),
            },
          };
        }
      }
      return alterations;
    },
    {},
  );
  return reduce(
    alteredGroupsWithChildren,
    (s: S, alteration: Alteration) => ({
      ...s,
      data: util.replaceInArray<Table.BodyRow<R>>(
        st.data,
        { id: alteration.groupRow.id },
        {
          ...alteration.groupRow,
          children: alteration.children,
        },
      ),
    }),
    st,
  );
};

export const updateRowGroup = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  st: S,
  rowIds: SingleOrArray<Table.ModelRowId>,
  group: Table.GroupRowId,
): S => {
  const ids: Table.ModelRowId[] = Array.isArray(rowIds) ? rowIds : [rowIds];

  const g: Table.GroupRow<R> | null = groupRowFromState<R, S>(st, group);
  if (!isNil(g)) {
    /*
		If any of the ModelRow(s) already belong to Group(s), they must be
		disassociated from those Group(s) since a ModelRow can only belong to one
		and only one Group.
		*/
    const newState = removeRowsFromTheirGroupsIfTheyExist(st, ids);
    /*
		Find the rows associated with this Group including the rows that are
		being added to the group.  Note that this is intentionally redundant (as
		we simply set the children propery to these IDs afterwards anyways) - but
		is done so to make sure that the IDs are valid and associated with
		ModelRow(s) in state.
		*/
    const rws = redux.findModelsInData<Table.ModelRow<R>>(
      filter(newState.data, (r: Table.BodyRow<R>) =>
        tabling.rows.isModelRow(r),
      ) as Table.ModelRow<R>[],
      uniq([...ids, ...g.children]),
    );
    return {
      ...newState,
      data: util.replaceInArray<Table.BodyRow<R>>(
        newState.data,
        { id: g.id },
        {
          ...g,
          children: map(rws, (r: Table.ModelRow<R>) => r.id),
        },
      ),
    };
  }
  return st;
};
