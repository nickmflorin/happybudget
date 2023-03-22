const fn = async () => {
  // Set the timezone for Jest tests to be UTC.
  process.env.TZ = "UTC";
};

export default fn;
