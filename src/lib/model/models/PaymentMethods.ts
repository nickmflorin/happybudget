/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum PaymentMethodNames {
  CHECK = "Check",
  CARD = "Card",
  WIRE = "Wire"
}

export const PaymentMethodModels: { [key: string]: Model.PaymentMethod } = {
  MINUTES: { id: 0, name: PaymentMethodNames.CHECK },
  HOURS: { id: 1, name: PaymentMethodNames.CARD },
  WEEKS: { id: 2, name: PaymentMethodNames.WIRE }
};

const PaymentMethods = Object.values(PaymentMethodModels);
export default PaymentMethods;
