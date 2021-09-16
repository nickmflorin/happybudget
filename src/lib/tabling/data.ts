import { tabling } from "lib";
import { includes, groupBy, isNil, reduce, find, filter, map, orderBy, indexOf, sortBy } from "lodash";

import * as rows from "./rows";

/**
 * @deprecated We need to further explore row ordering as it applies to our complex situations of
 * different row types.
 */
export const orderRowsByFieldOrdering = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  array: Table.DataRow<R, M>[],
  fieldOrdering: FieldOrdering<keyof R>
): Table.DataRow<R, M>[] => {
  return orderBy(
    array,
    (row: Table.DataRow<R, M>) => map(fieldOrdering, (fieldOrder: FieldOrder<keyof R>) => row.data[fieldOrder.field]),
    map(fieldOrdering, (fieldOrder: FieldOrder<keyof R>) => (fieldOrder.order === 1 ? "asc" : "desc"))
  );
};

type RowWithPotentialGroupRow<R extends Table.RowData, M extends Model.Model = Model.Model> = {
  readonly groupRow: Table.GroupRow<R> | null;
  readonly row: Table.DataRow<R, M>;
};

type RowWithGroupRow<R extends Table.RowData, M extends Model.Model = Model.Model> = {
  readonly groupRow: Table.GroupRow<R>;
  readonly row: Table.DataRow<R, M>;
};

type RowsWithGroupRow<R extends Table.RowData, M extends Model.Model = Model.Model> = {
  readonly groupRow: Table.GroupRow<R>;
  readonly rows: Table.DataRow<R, M>[];
};

export const orderTableRows = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  rws: Table.Row<R, M>[],
  ordering?: FieldOrder<keyof R>[]
) => {
  const groupRows = filter(rws, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[];
  const dataRows = filter(rws, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R, M>[];

  const rowsWithTheirGroup: RowWithPotentialGroupRow<R, M>[] = reduce(
    dataRows,
    (curr: RowWithPotentialGroupRow<R, M>[], dataRow: Table.DataRow<R, M>) => {
      if (!isNil(dataRow.group)) {
        const groupRow = find(groupRows, { group: dataRow.group });
        if (isNil(groupRow)) {
          /* eslint-disable no-console */
          console.error(`Could not find group row with group ID ${dataRow.group} for data row ${dataRow.id}!`);
          return [...curr, { groupRow: null, row: dataRow }];
        }
        return [...curr, { groupRow, row: dataRow }];
      }
      return [...curr, { groupRow: null, row: dataRow }];
    },
    []
  );
  const groupless: Table.DataRow<R, M>[] = map(
    filter(rowsWithTheirGroup, (rg: RowWithPotentialGroupRow<R, M>) => rg.groupRow === null),
    (rg: RowWithPotentialGroupRow<R, M>) => rg.row
  );
  const withGroup = filter(
    rowsWithTheirGroup,
    (rg: RowWithPotentialGroupRow<R, M>) => rg.groupRow !== null
  ) as RowWithGroupRow<R, M>[];

  const gr = groupBy(withGroup, (rg: RowWithGroupRow<R, M>) => rg.groupRow.group) as {
    [key: ID]: RowWithGroupRow<R, M>[];
  };

  const grouped: RowsWithGroupRow<R, M>[] = reduce(
    gr,
    (curr: RowsWithGroupRow<R, M>[], rg: RowWithGroupRow<R, M>[]) => {
      if (rg.length !== 0) {
        // Note: It is safe to assume that rg[0] has the same groupRow as all of the other sets in
        // the array because of the groupBy operation.
        return [...curr, { groupRow: rg[0].groupRow, rows: map(rg, (rgi: RowWithGroupRow<R, M>) => rgi.row) }];
      }
      return curr;
    },
    []
  );
  /*
  There are some underlying assumptions about the order of the non-<GroupRow>(s) relative to the <GroupRow>(s)
  The order of the original <Row>(s) needs to be preserved, and <GroupRow>(s) apply to a sequential
  set of <Row>(s) above it in the table.  For instance, if we have <Row>(s) [A, B, C, D], we cannot have a
  <GroupRow> that corresponds to [A, C, D] - it must be [A], or [A, B], or [A, B, C], so on and so forth.

  The assumption is that the order of the <Row>(s) provided to this method are already consistent with how
  they should be ordered, and the <GroupRow>(s) contain children <Row>(s) such that the above described
  constraint is met.  This constraint, which is enforced by the backend, is safe to assume here.  That
  being said, we want to make sure this ordering is always maintained.  In order to do this, we order each
  set of RowsWithGroupRow<R, M> by the *index that the first row in the set occurred at in the original
  set of provided rows*.

  Non-Group Rows: [A, B, C, D, E, F]
  Group Rows: [G(A, B), G(C, D, E)]
  Rows Provided: [A, B, C, D, E, F, G(A, B), G(C, D, E)]
  Rows Ordered: [
    (First Group - Ordered first because A appeared first in "Rows Provided")
    -- A,
    -- B,
    -- G(A, B)
    (First Group - Ordered second because C appeared after A in "Rows Provided")
    -- C
    -- D
    -- E
    -- G(C, D, E)
    (No Group Rows)
    -- F
  ]
  */
  return [
    ...reduce(
      sortBy(grouped, (iteree: RowsWithGroupRow<R, M>) => indexOf(rws, iteree.rows[0])),
      (curr: Table.Row<R, M>[], iteree: RowsWithGroupRow<R, M>) => {
        return [
          ...curr,
          ...(!isNil(ordering) ? orderRowsByFieldOrdering(iteree.rows, ordering) : iteree.rows),
          iteree.groupRow
        ];
      },
      []
    ),
    ...groupless
  ];
};

export const createTableRows = <R extends Table.RowData, M extends Model.Model, G extends Model.Group>(
  config: Table.CreateTableDataConfig<R, M, G> & {
    readonly gridId: Table.GridId;
  }
): Table.Row<R, M>[] => {
  const getGroupForModel = (m: M): G | null => find(config.groups, (g: G) => includes(g.children, m.id)) || null;

  const modelRows: Table.ModelRow<R, M>[] = reduce(
    config.models,
    (curr: Table.ModelRow<R, M>[], m: M) => {
      let group: G | null = getGroupForModel(m);
      return [
        ...curr,
        rows.createModelRow<R, M, G>({
          model: m,
          columns: config.columns,
          group: !isNil(group) ? group.id : null,
          gridId: config.gridId,
          getRowChildren: config.getModelRowChildren,
          getRowLabel: config.getModelRowLabel,
          getRowName: config.getModelRowName
        })
      ];
    },
    []
  );

  const groupRows: Table.GroupRow<R>[] = reduce(
    config.groups,
    (curr: Table.GroupRow<R>[], g: G) => {
      return [
        ...curr,
        rows.createGroupRow<R, M, G>({
          columns: config.columns,
          group: g,
          getRowLabel: config.getGroupRowLabel,
          getRowName: config.getGroupRowName
        })
      ];
    },
    []
  );
  return orderTableRows([...modelRows, ...groupRows], config.ordering);
};
