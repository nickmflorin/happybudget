export * from "./cells";
export * from "./columns";
export * from "./editors";
export * from "./events";
export * from "./framework";
export * from "./redux";
export * from "./rows";
export * from "./share";
export * from "./table";

export type PreviousValues<T> = [T, T] | [T];

export type RawClassName = string | string[] | undefined | { [key: string]: boolean };

export type ClassNameParamCallback<T> = (params: T) => ClassName<T>;

interface _ClassNameArray<P> {
  [n: number]: RawClassName | ClassNameParamCallback<P>;
}

export type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _ClassNameArray<P>;

/* type CreateTableDataConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
     readonly response: Http.SuccessfulTableResponse<M>;
     readonly columns: ModelColumn<R, M>[];
     readonly getModelRowChildren?: (m: M) => number[];
   }; */
