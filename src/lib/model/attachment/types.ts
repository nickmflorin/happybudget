import * as types from "../types";

export type SimpleAttachment = types.ApiModel<{
  readonly name: string;
  /* The extension will be null if the file name is corrupted and the extension cannot be
     determined. */
  readonly extension: string | null;
  readonly url: string;
}>;

export type Attachment = SimpleAttachment & {
  readonly size: number;
};
