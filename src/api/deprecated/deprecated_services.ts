type Method = "POST" | "PATCH" | "GET" | "DELETE";

type RequestOptions = {
  readonly timeout?: number;
  readonly publicTokenId?: string;
  readonly headers?: { [key: string]: string };
  readonly cancelToken?: import("axios").CancelToken | undefined;
};

type QueryParamValue = string | number | boolean;
type Query = Record<string, QueryParamValue>;

type RawQuery = {
  readonly page_size?: number;
  readonly page?: number;
  readonly search?: string;
  readonly simple?: boolean;
  readonly ordering?: string;
};

type TokenType = "email-confirmation" | "password-recovery";

type PathParam = string | number;

type PathParams = Array<PathParam>;

type V1Url = `v1/${string}/`;

type Order = 1 | -1 | 0;
type DefinitiveOrder = 1 | -1;
type FieldOrder<F extends string = string> = {
  readonly field: F;
  readonly order: Order;
};

type Ordering<F extends string = string> = FieldOrder<F>[];

type ListQuery = Omit<RawQuery, "ordering"> & {
  readonly ordering?: Ordering<string>;
  readonly ids?: number[];
  readonly exclude?: number[];
};

type FullServiceArgs<ARGS extends unknown[]> = [...ARGS, RequestOptions?];

type PostServiceArgs<P extends Payload> = [P, RequestOptions?];
type PatchServiceArgs<P extends Payload> = [P, RequestOptions?];
type DeleteServiceArgs = [number, RequestOptions?];
type RetrieveServiceArgs = [number, RequestOptions?];
type ListServiceArgs = [ListQuery?, RequestOptions?];
type DetailListServiceArgs = [number, ListQuery?, RequestOptions?];
type DetailPostServiceArgs<P extends Payload> = [number, ...PostServiceArgs<P>];
type DetailPatchServiceArgs<P extends Payload> = [number, ...PatchServiceArgs<P>];
type DetailDeleteServiceArgs = [number, ...DeleteServiceArgs];

type RetrieveService<R> = Service<R, RetrieveServiceArgs>;
type PostService<R, P extends Payload> = Service<R, PostServiceArgs<P>>;
type PatchService<R, P extends Payload> = Service<R, PatchServiceArgs<P>>;
type DeleteService = Service<null, DeleteServiceArgs>;
type ListService<R> = Service<ListResponse<R>, ListServiceArgs>;
type DetailListService<R> = Service<ListResponse<R>, DetailListServiceArgs>;
type DetailDeleteService = Service<null, DetailDeleteServiceArgs>;
type DetailPatchService<R, P extends Payload> = Service<R, DetailPatchServiceArgs<P>>;
type DetailPostService<R, P extends Payload> = Service<R, DetailPostServiceArgs<P>>;

type BulkDeleteServiceArgs = [BulkDeletePayload, RequestOptions?];
type BulkDeleteService = Service<null, BulkDeleteServiceArgs>;

type ParentBulkDeleteServiceArgs = [number, ...BulkDeleteServiceArgs];
type ParentBulkDeleteService<PARENT extends Model.HttpModel> = Service<
  ParentResponse<PARENT>,
  ParentBulkDeleteServiceArgs
>;

type TreeBulkDeleteServiceArgs = [number, ...BulkDeleteServiceArgs];
type TreeBulkDeleteService<PARENT extends Model.HttpModel, C extends Model.HttpModel> = Service<
  ParentsResponse<PARENT, C>,
  TreeBulkDeleteServiceArgs
>;

type BulkUpdateServiceArgs<P extends PayloadObj> = [BulkUpdatePayload<P>, RequestOptions?];
type BulkUpdateService<C extends Model.HttpModel, P extends PayloadObj> = Service<
  ChildListResponse<C>,
  BulkUpdateServiceArgs<P>
>;

type ParentBulkUpdateServiceArgs<P extends PayloadObj> = [
  number,
  BulkUpdatePayload<P>,
  RequestOptions?,
];
type ParentBulkUpdateService<
  PARENT extends Model.HttpModel,
  C extends Model.HttpModel,
  P extends PayloadObj,
> = Service<ParentChildListResponse<PARENT, C>, ParentBulkUpdateServiceArgs<P>>;

type TreeBulkUpdateService<
  GP extends Model.HttpModel,
  PARENT extends Model.HttpModel,
  C extends Model.HttpModel,
  P extends PayloadObj,
> = Service<AncestryListResponse<GP, PARENT, C>, ParentBulkUpdateServiceArgs<P>>;

type BulkCreateServiceArgs<P extends PayloadObj> = [BulkCreatePayload<P>, RequestOptions?];
type BulkCreateService<C extends Model.HttpModel, P extends PayloadObj> = Service<
  ChildListResponse<C>,
  BulkCreateServiceArgs<P>
>;

type ParentBulkCreateServiceArgs<P extends PayloadObj> = [
  number,
  BulkCreatePayload<P>,
  RequestOptions?,
];
type ParentBulkCreateService<
  PARENT extends Model.HttpModel,
  C extends Model.HttpModel,
  P extends PayloadObj,
> = Service<ParentChildListResponse<PARENT, C>, ParentBulkCreateServiceArgs<P>>;

type TreeBulkCreateService<
  GP extends Model.HttpModel,
  PARENT extends Model.HttpModel,
  C extends Model.HttpModel,
  P extends PayloadObj,
> = Service<AncestryListResponse<GP, PARENT, C>, ParentBulkCreateServiceArgs<P>>;

type Service<R, ARGS extends unknown[] = unknown[]> = (...args: ARGS) => Promise<R>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type ServiceResponse<SERVICE> = SERVICE extends Service<infer R, any[]> ? Awaited<R> : never;
