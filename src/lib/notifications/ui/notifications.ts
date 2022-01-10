const PresetNotifications: UIExistingNotifications = {
  budgetSubscriptionPermissionError: () => ({
    message: "Subscription Error",
    detail: "Your account is not subscribed to the correct products to view this budget.",
    closable: true,
    level: "warning"
  })
};

export default PresetNotifications;
