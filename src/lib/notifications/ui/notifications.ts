const PresetNotifications: UIExistingNotifications = {
  budgetSubscriptionPermissionError: () => ({
    message: "Subscription Error",
    detail: "Your account is not subscribed to the correct products to view this budget.",
    closable: true,
    level: "warning"
  }),
  budgetCountPermissionError: () => ({
    message: "Subscription Error",
    detail: "You are not subscribed to the correct products to create an additional budget.",
    includeLink: () => ({
      text: "Click here to subscribe.",
      to: "/billing"
    })
  })
};

export default PresetNotifications;
