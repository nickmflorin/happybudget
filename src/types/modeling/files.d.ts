declare type CSVRow = (string | number | null | undefined)[];
declare type CSVData = CSVRow[];

// Image data that is received from the API.
declare type SavedImage = {
  // URL will always be present, even if the image could not be found.
  readonly url: string;
  /* Size, height, width and extension can be null if the image could not be
     found. */
  readonly size: number | null;
  readonly height: number | null;
  readonly width: number | null;
  readonly extension: string | null;
};

// Image data that is received from an upload, but not saved to the API.
declare type UploadedImage = {
  readonly file: File | Blob;
  readonly size?: number;
  readonly name: string;
  readonly fileName?: string;
  readonly url: string;
  readonly data: string | ArrayBuffer;
};

declare type UploadError = Error | string;
declare type UploadFile = import("antd/lib/upload/interface").UploadFile<Http.FileUploadResponse>;

declare type UploadImageParamsNoImage = { loading: boolean; onClear: () => void; error?: UploadError | null };
declare type UploadImageParamsWithImage = UploadImageParamsNoImage & { image: UploadedImage | SavedImage };
declare type UploadImageParams = UploadImageParamsWithImage | UploadImageParamsNoImage;

declare type IUploaderRef = {
  readonly clear: () => void;
};
