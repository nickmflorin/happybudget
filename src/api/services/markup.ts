import * as services from "./services";

export const getMarkup = services.retrieveService<Model.Markup>((id: number) => ["markups", id]);
export const deleteMarkup = services.deleteService((id: number) => ["markups", id]);

type UpdateMarkup = {
  <B extends Model.Budget | Model.Template, R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>>(
    id: number,
    p: Partial<Http.MarkupPayload>,
    options?: Http.RequestOptions
  ): Promise<R>;
};

export const updateMarkup = services.detailPatchService((id: number) => ["markups", id]) as UpdateMarkup;
