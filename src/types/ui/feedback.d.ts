type AlertType = "error" | "info" | "warning" | "success";

type IAlert = {
  readonly type: AlertType;
  readonly title?: string;
  readonly message?: string | Http.Error;
  readonly closable?: boolean;
}