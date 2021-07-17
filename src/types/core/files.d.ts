/// <reference path="./http.d.ts" />

type CSVRow = (string | number | null | undefined)[];
type CSVData = CSVRow[];

type UploadError = Error | string;
type UploadFile = import("antd/lib/upload/interface").UploadFile<Http.FileUploadResponse>;
type UploadedData = {
  readonly file: File | Blob;
  readonly size?: number;
  readonly name: string;
  readonly fileName?: string;
  readonly url: string;
}


type UploadFileParamsNoData = { loading: boolean, onClear: () => void };
type UploadFileParamsWithData = UploadFileParamsNoData & { data: UploadedData }
type UploadFileParamsWithError = UploadFileParamsNoData & { error: UploadError }

type UploadFileParamsNoError = UploadFileParamsNoData | UploadFileParamsWithData;
type UploadFileParams = UploadFileParamsNoError | UploadFileParamsWithError;

type IUploaderRef = {
  readonly clear: () => void;
}