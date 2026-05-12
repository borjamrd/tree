// Temporary dev bypass — replace with real auth() when ready
export const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

export function devSession() {
  return { user: { id: DEV_USER_ID, name: 'Dev User', email: 'dev@local' } }
}
