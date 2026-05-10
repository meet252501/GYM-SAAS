/**
 * AI Quota Configuration
 * Defines daily message limits based on membership plan tiers
 */
const AI_QUOTA_CONFIG = {
  PLAN_LIMITS: {
    'Trial': 3,
    'Basic': 10,
    'Premium': 30,
    'Elite': Infinity,
    'admin': Infinity
  },
  DEFAULT_LIMIT: 5
};

module.exports = AI_QUOTA_CONFIG;
