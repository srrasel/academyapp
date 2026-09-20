/**
 * Map Firebase Auth errors to friendly, user-facing messages.
 */

const CODE_TO_KEY = {
  'auth/email-already-in-use': 'account.errors.emailInUse',
  'auth/invalid-email': 'account.errors.invalidEmail',
  'auth/operation-not-allowed': 'account.errors.operationNotAllowed',
  'auth/weak-password': 'account.errors.weakPassword',
  'auth/user-disabled': 'account.errors.userDisabled',
  'auth/user-not-found': 'account.errors.userNotFound',
  'auth/wrong-password': 'account.errors.wrongPassword',
  'auth/invalid-credential': 'account.errors.invalidCredential',
  'auth/invalid-login-credentials': 'account.errors.invalidCredential',
  'auth/too-many-requests': 'account.errors.tooManyRequests',
  'auth/network-request-failed': 'account.errors.network',
  'auth/popup-closed-by-user': 'account.errors.cancelled',
  'auth/cancelled-popup-request': 'account.errors.cancelled',
  'auth/account-exists-with-different-credential': 'account.errors.accountExistsDifferent',
  'auth/requires-recent-login': 'account.errors.requiresRecentLogin',
  'auth/missing-password': 'account.errors.missingPassword',
  'auth/missing-email': 'account.errors.missingEmail',
  'auth/internal-error': 'account.errors.generic',
  'auth/unknown': 'account.errors.generic',
};

function normalizeCode(error) {
  const raw = String(error?.code || error?.message || '').trim();
  if (!raw) return '';

  if (raw.startsWith('auth/')) return raw;

  const fromMessage = raw.match(/auth\/[a-z0-9-]+/i);
  if (fromMessage) return fromMessage[0].toLowerCase();

  return raw.toLowerCase();
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isEmailAlreadyInUseError(error) {
  const code = normalizeCode(error);
  if (code === 'auth/email-already-in-use') return true;
  const message = String(error?.message || '').toLowerCase();
  return message.includes('email-already') || message.includes('already in use');
}

/**
 * @param {unknown} error
 * @param {(key: string, params?: object) => string} t
 * @param {'signup' | 'login' | 'social'} [context]
 */
export function getFriendlyAuthError(error, t, context = 'login') {
  const code = normalizeCode(error);
  const key = CODE_TO_KEY[code];

  if (key) {
    return t(key);
  }

  // Fallback by context if Firebase returns a bare message without a code.
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('password') && message.includes('6')) {
    return t('account.errors.weakPassword');
  }
  if (message.includes('email-already') || message.includes('already in use')) {
    return t('account.errors.emailInUse');
  }
  if (message.includes('network')) {
    return t('account.errors.network');
  }
  if (message.includes('firebase is not configured')) {
    return t('account.errors.notConfigured');
  }

  if (context === 'signup') return t('account.errors.signupGeneric');
  if (context === 'social') return t('account.errors.socialGeneric');
  return t('account.errors.loginGeneric');
}
