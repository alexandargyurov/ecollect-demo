// Browser-safe widget configuration. CRA reads .env.development.local only for npm start.
export const SIPPET_API_ORIGIN = (
  process.env.REACT_APP_SIPPET_API_ORIGIN || 'https://api.sippet.ai'
).replace(/\/+$/, '');
export const SIPPET_AGENT_ID = process.env.REACT_APP_SIPPET_AGENT_ID || '72fc884d-b7da-4697-8757-d9222bb14f17';
export const SIPPET_PUBLISHABLE_KEY = process.env.REACT_APP_SIPPET_PUBLISHABLE_KEY || 'sippetai_hpWdiPjZr4ZFt5cdBMSsxRVxjs2qtuTehGRitZAFeMZ9Mgm2bloCOpe6Pe1LXBOWQ_cyhOr0';
