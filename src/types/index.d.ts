declare module "*.ttf";
declare module "@editorjs/paragraph";
declare module "@editorjs/header";
declare module "@editorjs/table";
declare module "@editorjs/link";
declare module "@editorjs/list";
declare module "@fancyapps/ui/dist/fancybox.esm.js";
declare module "@ckeditor/ckeditor5-react" {
  import BalloonEditor from "@ckeditor/ckeditor5-build-balloon";
  import Event from "@ckeditor/ckeditor5-utils/src/eventinfo";
  import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";
  import * as React from "react";

  type CKEditorProps = {
    disabled?: boolean;
    editor: typeof BalloonEditor;
    data?: string;
    id?: string;
    config?: EditorConfig;
    onReady?: (editor: BalloonEditor) => void;
    onChange?: (event: Event, editor: BalloonEditor) => void;
    onBlur?: (event: Event, editor: BalloonEditor) => void;
    onFocus?: (event: Event, editor: BalloonEditor) => void;
    onError?: (event: Event, editor: BalloonEditor) => void;
  };
  const CKEditor: React.FunctionComponent<CKEditorProps>;
  export { CKEditor, CKEditorProps, Event as CKEditorEvent, BalloonEditor as EditorInstance };
}

declare type ID = string | number;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
declare type FnWithTypedArgs<T, ARGS extends any[]> = (...args: ARGS) => T;

declare type SingleOrArray<T> = T | T[];

declare type NonNullRef<T> = {
  readonly current: T;
};

declare type SetUndefined<T, W extends keyof T> = Omit<T, W> & Record<W, undefined>;
declare type SetOptional<T, W extends keyof T> = Omit<T, W> & Partial<Pick<T, W>>;
declare type SetRequired<T, W extends keyof T> = Omit<T, W> & Required<Pick<T, W>>;

declare type RenderPropChild<PARAMS, P extends Record<string, unknown> = Record<string, unknown>> = (
  p: PARAMS
) => import("react").ReactElement<P, string>;

/* Adopted from AntD */
declare type RecursivePartial<T> = T extends Record<string, unknown>
  ? {
      [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends Record<string, unknown>
        ? RecursivePartial<T[P]>
        : T[P];
    }
  : never;
