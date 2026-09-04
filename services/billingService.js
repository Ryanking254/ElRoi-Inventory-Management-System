import { api } from '../lib/api';

export const billingService = {
  getPlans: () => api.get('/billing/plans'),

  getSubscription: () => api.get('/billing/subscription'),

  startMpesaStk: (plan, phone) =>
    api.post('/billing/mpesa/stk', { plan, phone }),

  cardCheckout: (plan) =>
    api.post('/billing/card/checkout', { plan }),

  paypalCreate: (plan) =>
    api.post('/billing/paypal/create', { plan }),
};
