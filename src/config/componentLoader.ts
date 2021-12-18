const componentLoader = (
  lazyComponent: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
  attemptsLeft = 3
): Promise<{ default: React.ComponentType<Record<string, unknown>> }> => {
  return new Promise((resolve, reject) => {
    lazyComponent()
      .then(resolve)
      .catch((error: Error) => {
        setTimeout(() => {
          if (attemptsLeft === 1) {
            reject(error);
            return;
          }
          componentLoader(lazyComponent, attemptsLeft - 1).then(resolve, reject);
        }, 1500);
      });
  });
};

export default componentLoader;
