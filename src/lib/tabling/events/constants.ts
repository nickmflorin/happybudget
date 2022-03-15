export const CHANGE_EVENT_IDS: Table.ChangeEventId[] = [
  "dataChange",
  "rowAdd",
  "groupAdd",
  "rowInsert",
  "rowPositionChanged",
  "rowDelete",
  "rowRemoveFromGroup",
  "rowAddToGroup"
];

export const CONTROL_EVENT_IDS: Table.ControlEventId[] = [
  "modelsUpdated",
  "updateRows",
  "modelsAdded",
  "placeholdersActivated"
];

export const TRAVERSIBLE_EVENT_IDS: Table.TraversibleEventId[] = ["dataChange"];

export const META_EVENT_IDS: Table.MetaEventId[] = ["forward", "reverse"];
