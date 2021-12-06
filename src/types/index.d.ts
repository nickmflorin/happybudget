/// <reference types="@welldone-software/why-did-you-render" />
/// <reference types="node" />

declare module "*.ttf";
declare module "classnames";
declare module "@editorjs/paragraph";
declare module "@editorjs/header";
declare module "@editorjs/table";
declare module "@editorjs/link";
declare module "@editorjs/list";
declare module "@fancyapps/ui/dist/fancybox.esm.js"
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
  }
  const CKEditor: React.FunctionComponent<CKEditorProps>;
  export { CKEditor, CKEditorProps, Event as CKEditorEvent, BalloonEditor as EditorInstance };
}

type ID = string | number;

type FnWithTypedArgs<T, ARGS extends any[]> = (...args: ARGS) => T;

type NonNullable<T> = Exclude<T, null | undefined>;

type Writeable<T extends { [x: string]: any }, K extends string> = {
  [P in K]: T[P];
}

type SingleOrArray<T> = T | T[];

type FlattenIfArray<T> = T extends (infer R)[] ? R : T
type ArrayIfSingle<T> = T extends Array<any> ? T : T[];

type NonNullRef<T> = {
  readonly current: T;
}

type SetUndefined<T, W extends keyof T> = Omit<T, W> & Record<W, undefined>;
type SetOptional<T, W extends keyof T> = Omit<T, W> & Partial<Pick<T, W>>;
type SetRequired<T, W extends keyof T> = Omit<T, W> & Required<Pick<T, W>>;

type RenderPropChild<PARAMS = any> = (p: PARAMS) => import("react").ReactElement<any, any>;
