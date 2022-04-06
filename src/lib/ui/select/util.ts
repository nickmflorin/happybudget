export const toSelectModel = <M extends Model.Model>(m: Model.WithStringId<M>): M =>
  ({ ...m, id: parseInt(m.id) } as M);

export const toSelectOption = <M extends Model.Model>(m: M): Model.WithStringId<M> => ({ ...m, id: String(m.id) });
