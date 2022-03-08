import { isNil, reduce, filter, includes, intersection } from "lodash";

import { budgeting, tabling, util, redux } from "lib";
import { groupRowFromState, reorderRows, markupRowFromState, updateRowGroup, rowGroupRowFromState } from "./util";

/**
 * Reducer that updates the Redux.TableStore<R> store by converting models to
 * rows after they are created and inserting the rows into the table data in the
 * store.
 *
 * @returns The updated table store, Redux.TableStore<R>, with the models
 *          converted to rows and inserted into the store.
 */
const createModelsUpdatedEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A>
): Redux.Reducer<S, Table.ModelsUpdatedEvent<M>> => {
  const groupRowManager = new tabling.managers.GroupRowManager<R, M>({ columns: config.columns });
  const markupRowManager = new tabling.managers.MarkupRowManager({ columns: config.columns });
  const modelRowManager = new tabling.managers.ModelRowManager<R, M>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns
  });

  /**
   * Updates the table store by replacing the previously generated GroupRow
   * associated with the provided Group with an updated GroupRow generated from
   * the provided updated form of the Group.
   *
   * When a Group is updated, it may be updated with children that already belong
   * to another Group.  ?In this case, the backend will automatically remove
   * those children from the previous Group they belong to - but we also need to
   * apply that change in the reducer here.
   *
   * @returns The updated table store, Redux.TableStore<R>, with the
   *          updated Table.GroupRow.
   */
  const updateGroupInState = (group: Model.Group, s: S, reorder = true) => {
    const groupRow: Table.GroupRow<R> | null = groupRowFromState<R, S>(s, tabling.managers.groupRowId(group.id));
    if (!isNil(groupRow)) {
      const newGroupRow: Table.GroupRow<R> = groupRowManager.create({ model: group });
      const groupsWithChild: Table.GroupRow<R>[] = filter(
        s.data,
        (r: Table.Row<R>) =>
          tabling.typeguards.isGroupRow(r) && intersection(r.children, newGroupRow.children).length !== 0
      ) as Table.GroupRow<R>[];
      const newState = reduce(
        groupsWithChild,
        (st: S, gChild: Table.GroupRow<R>) => {
          return {
            ...st,
            data: util.replaceInArray<Table.BodyRow<R>>(
              st.data,
              { id: gChild.id },
              {
                ...gChild,
                children: filter(gChild.children, (id: number) => !includes(newGroupRow.children, id))
              }
            )
          };
        },
        s
      );
      return reorder
        ? reorderRows({
            ...newState,
            data: util.replaceInArray<Table.BodyRow<R>>(newState.data, { id: groupRow.id }, newGroupRow)
          })
        : { ...newState, data: util.replaceInArray<Table.BodyRow<R>>(newState.data, { id: groupRow.id }, newGroupRow) };
    }
    return s;
  };

  /**
   * Updates the table store by replacing the previously generated MarkupRow
   * associated with the provided Markup with an updated Markup generated from
   * the provided updated form of the Markup.
   *
   * We first have to create a new MarkupRow with the updated Markup model -
   * which will cause the MarkupRow to include updated values for the unit and
   * rate properties.  Once that is done, we need to update the children rows
   * of the MarkupRow to reflect these new values, and then finally update the
   * MarkupRow again to reflect the new children.
   *
   * Note: This event occurs when Markup is updated via a Modal and the response
   * is received - so we have access to the complete updated Markup and do not
   * need to perform any recalculations or manipulations of the Markup itself.
   *
   * @returns The updated table store, Redux.TableStore<R>, with the
   *          updated Table.MarkupRow.
   */
  const updateMarkupInState = (markup: Model.Markup, s: S, reorder = true) => {
    type BR = Tables.AccountRowData | Tables.SubAccountRowData;

    const isSubAccountRowData = (d: BR): d is Tables.SubAccountRowData =>
      (d as Tables.SubAccountRowData).fringe_contribution !== undefined;

    const markupRow: Table.MarkupRow<R> | null = markupRowFromState<R, S>(s, tabling.managers.markupRowId(markup.id));
    if (!isNil(markupRow)) {
      const updatedMarkupRow = markupRowManager.create({ model: markup });
      const childrenRows = filter(
        s.data,
        (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) && includes(updatedMarkupRow.children, r.id)
      ) as Table.ModelRow<R>[];
      // Update the Markup Row itself in state.
      s = {
        ...s,
        data: util.replaceInArray<Table.BodyRow<R>>(s.data, { id: updatedMarkupRow.id }, updatedMarkupRow)
      };
      /* Update the children rows of the MarkupRow to reflect the new MarkupRow
				data. */
      s = reduce(
        childrenRows,
        (st: S, r: Table.ModelRow<R>) => {
          /* Since the Markup model is only applicable for the Budget related
						tables, it is safe to coerce the row to being a ModelRow for either
						the AccountRowData or the SubAccountRowData. */
          const row = r as unknown as Table.ModelRow<BR>;

          const otherMarkupRows = filter(
            s.data,
            (ri: Table.BodyRow<R>) =>
              tabling.typeguards.isMarkupRow(ri) && includes(ri.children, row.id) && ri.id !== updatedMarkupRow.id
          ) as Table.MarkupRow<R>[];
          return {
            ...st,
            data: util.replaceInArray<Table.BodyRow<BR>>(
              /* Since the Markup model is only applicable for the Budget
								related tables, it is safe to coerce the row to being a BodyRow
								for either the AccountRowData or the SubAccountRowData. */
              st.data as Table.BodyRow<BR>[],
              { id: row.id },
              {
                ...row,
                data: {
                  ...row.data,
                  /* Markup contributions get applied to the value after
										fringes are applied. */
                  markup_contribution: budgeting.businessLogic.contributionFromMarkups(
                    isSubAccountRowData(row.data)
                      ? row.data.nominal_value +
                          row.data.accumulated_fringe_contribution +
                          row.data.accumulated_markup_contribution +
                          row.data.fringe_contribution
                      : row.data.nominal_value +
                          row.data.accumulated_fringe_contribution +
                          row.data.accumulated_markup_contribution,
                    [...otherMarkupRows, updatedMarkupRow]
                  )
                }
              }
            )
          };
        },
        s
      );
    }
    return reorder ? reorderRows(s) : s;
  };

  /**
   * Updates the table store by updating a model that was previously in
   * the table by converting the model to a row and replacing the row in the
   * table corresponding to the previous form of the model.
   *
   * If the group is undefined, it means there was no change to the model's
   * group.  If the group is `null`, it means that the group was removed.
   *
   * @returns The updated table store, Redux.TableStore<R>, with the
   *          Table.ModelRow updated in the store data.
   */
  const updateModelInState = (model: M, group: number | null | undefined, s: S, reorder = true) => {
    const modelRow: Table.ModelRow<R> | null = redux.reducers.modelFromState<Table.ModelRow<R>>(
      filter(s.data, (ri: Table.BodyRow<R>) => tabling.typeguards.isModelRow(ri)) as Table.ModelRow<R>[],
      model.id
    );
    if (!isNil(modelRow)) {
      s = {
        ...s,
        data: util.replaceInArray<Table.BodyRow<R>>(s.data, { id: modelRow.id }, modelRowManager.create({ model }))
      };
      /* If the `group` on the event payload is undefined, it means
				there was no change to the model's group.  A `null` group means
				that the group was removed. */
      if (group !== undefined) {
        const groupRowId = group !== null ? tabling.managers.groupRowId(group) : null;
        const previousGroupRow: Table.GroupRow<R> | null = rowGroupRowFromState<R, S>(s, model.id, {
          warnOnMissing: false
        });
        const previousGroupRowId = !isNil(previousGroupRow) ? previousGroupRow.id : null;
        // Make sure the Group actually changed before proceeding.
        if (previousGroupRowId !== groupRowId) {
          if (groupRowId !== null) {
            /* If the Group ID of the Model is non-null, this means that
							the GroupRow associated with the ModelRow was either
							added or changed. */
            s = updateRowGroup(s, [modelRow.id], groupRowId);
          } else if (previousGroupRow !== null) {
            /* If the previous GroupRow associated with the ModelRow is
							not null but the new Group ID of the Model is null, this
							means that the GroupRow was removed from the ModelRow. */
            s = {
              ...s,
              data: util.replaceInArray<Table.BodyRow<R>>(
                s.data,
                { id: previousGroupRow.id },
                groupRowManager.removeChildren(previousGroupRow, [modelRow.id])
              )
            };
          }
        }
      }
      return reorder ? reorderRows(s) : s;
    }
    return s;
  };

  const isMarkup = (p: Table.ModelTableEventPayload<M> | Model.Group | Model.Markup): p is Model.Markup =>
    (p as Model.Markup).type === "markup";

  const isGroup = (p: Table.ModelTableEventPayload<M> | Model.Group | Model.Markup): p is Model.Group =>
    (p as Model.Group).type === "group";

  return (state: S = config.initialState, e: Table.ModelsUpdatedEvent<M>): S => {
    const payloads: (Table.ModelTableEventPayload<M> | Model.Group | Model.Markup)[] = Array.isArray(e.payload)
      ? e.payload
      : [e.payload];
    return reorderRows(
      reduce(
        payloads,
        (s: S, p: Table.ModelTableEventPayload<M> | Model.Group | Model.Markup) => {
          if (isMarkup(p)) {
            return updateMarkupInState(p, s, false);
          } else if (isGroup(p)) {
            return updateGroupInState(p, s, false);
          } else {
            return updateModelInState(p.model, p.group, s, false);
          }
        },
        state
      )
    );
  };
};

export default createModelsUpdatedEventReducer;
