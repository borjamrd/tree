// Temporary dev bypass — replace with real auth() when ready
export const DEV_USER_ID = 'dev-user-00000000-0000-0000-0000-000000000000'

export function devSession() {
  return { user: { id: DEV_USER_ID, name: 'Dev User', email: 'dev@local' } }
}
