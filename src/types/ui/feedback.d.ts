type AlertType = "error" | "info" | "warning";

type IAlert = {
  readonly type: AlertType;
  readonly title?: string;
  readonly message?: string | Http.Error;
}