export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    priceKes: 0,
    maxItems: 30,
    maxStaff: 0,
    reportDays: 7,
    features: ['Up to 30 items', 'No staff invites', 'Last 7 days reports'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceKes: 800,
    maxItems: null,
    maxStaff: 2,
    reportDays: null,
    features: ['Unlimited items', 'Up to 2 staff', 'Full report history', 'Export (future)'],
  },
  business: {
    id: 'business',
    name: 'Business',
    priceKes: 2500,
    maxItems: null,
    maxStaff: null,
    reportDays: null,
    features: ['Unlimited items', 'Unlimited staff', 'Full report history', 'Multi-shop (future)'],
  },
};

export const PLAN_ORDER = ['free', 'starter', 'business'];

export function getPlanDisplay(planId) {
  return PLANS[planId] || PLANS.free;
}

export function formatPriceKes(priceKes, currency = 'KES') {
  if (priceKes === 0) return 'Free';
  return `KSh ${priceKes.toLocaleString()}/mo`;
}
