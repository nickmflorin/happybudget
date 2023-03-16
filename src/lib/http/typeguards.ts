export const listResponseFailed = <M>(
  response: Http.RenderedListResponse<M>,
): response is Http.FailedListResponse<M> =>
  (response as Http.FailedListResponse<M>).error !== undefined;

export const detailResponseFailed = <M extends Model.HttpModel>(
  response: Http.RenderedDetailResponse<M>,
): response is Http.FailedDetailResponse =>
  (response as Http.FailedDetailResponse).error !== undefined;

export const tableResponseFailed = <M extends Model.RowHttpModel = Model.RowHttpModel>(
  response: Http.TableResponse<M>,
): response is Http.FailedTableResponse =>
  (response as Http.FailedTableResponse).error !== undefined;
