export const isFieldAlterationEvent = (event: FieldAlterationEvent | CreateEvent): event is FieldAlterationEvent => {
  return (event as FieldAlterationEvent).field !== undefined;
};
