import { UploadFile as RootUploadFile } from "antd/lib/upload/interface";

import { FileUploadResponse } from "api";

import * as model from "../model";

export type FileWithExtension<N extends string = string, E extends string = string> = `${N}.${E}`;

export type CSVRow = (string | number | null | undefined)[];
export type CSVData = CSVRow[];

export type UploadError = Error | string;
export type UploadFile = RootUploadFile<FileUploadResponse>;

export type UploadImageParamsNoImage = {
  loading: boolean;
  onClear: () => void;
  error?: UploadError | null;
};

export type UploadImageParamsWithImage = UploadImageParamsNoImage & {
  image: model.UploadedImage | model.SavedImage;
};
export type UploadImageParams = UploadImageParamsWithImage | UploadImageParamsNoImage;

export type IUploaderRef = {
  readonly clear: () => void;
};

// Image data that is received from the API.
export type SavedImage = {
  readonly url: string;
  readonly size: number;
  readonly height: number;
  readonly width: number;
  /*
	The extension will be null if the file name is corrupted and the extension cannot be determined.
	*/
  readonly extension: string | null;
};

// Image data that is received from an upload, but not saved to the API.
export type UploadedImage = {
  readonly file: File | Blob;
  readonly size?: number;
  readonly name: string;
  readonly fileName?: string;
  readonly url: string;
  readonly data: string | ArrayBuffer;
};

export const isUploadParamsWithImage = (
  params: UploadImageParams,
): params is UploadImageParamsWithImage =>
  (params as UploadImageParamsWithImage).image !== undefined;

export const isUploadedImage = (params: UploadedImage | SavedImage): params is UploadedImage =>
  (params as UploadedImage).file !== undefined;
