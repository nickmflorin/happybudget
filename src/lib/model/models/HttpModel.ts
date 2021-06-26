import BaseModel from "./Model";

abstract class HttpModel<M extends Model.HttpModel, P extends Http.ModelPayload<M> = Http.ModelPayload<M>>
  extends BaseModel
  implements Model.IHttpModel<M, P>
{
  abstract refresh(options: Http.RequestOptions): Promise<void>;
  abstract patch(
    payload: Partial<Http.BudgetPayload> | FormData,
    options: Http.RequestOptions
  ): Promise<Model.HttpModel>;
}

export default HttpModel;
