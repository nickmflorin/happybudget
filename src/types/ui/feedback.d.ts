declare type AlertType = "error" | "info" | "warning" | "success";

declare type IAlert = {
  readonly type: AlertType;
  readonly title?: string;
  readonly message?: string | Http.Error;
  readonly closable?: boolean;
}
