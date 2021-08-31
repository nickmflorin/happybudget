/// <reference path="../modeling/http.d.ts" />

type CSVRow = (string | number | null | undefined)[];
type CSVData = CSVRow[];

// Image data that is received from the API.
type SavedImage = {
  readonly url: string;
  readonly size: number;
  readonly height: number;
  readonly width: number;
  readonly extension: string;
}

// Image data that is received from an upload, but not saved to the API.
type UploadedImage = {
  readonly file: File | Blob;
  readonly size?: number;
  readonly name: string;
  readonly fileName?: string;
  readonly url: string;
  readonly data: string | ArrayBuffer;
}

type UploadError = Error | string;
type UploadFile = import("antd/lib/upload/interface").UploadFile<Http.FileUploadResponse>;

type UploadImageParamsNoImage = { loading: boolean, onClear: () => void, error?: UploadError | null };
type UploadImageParamsWithImage = UploadImageParamsNoImage & { image: UploadedImage | SavedImage }
type UploadImageParams = UploadImageParamsWithImage | UploadImageParamsNoImage;

type IUploaderRef = {
  readonly clear: () => void;
}