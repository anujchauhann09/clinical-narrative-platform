const FRIENDLY_BY_STATUS = {
  500: 'Something went wrong on our end. Please try again in a moment.',
  502: 'Our server is briefly unavailable. Please try again.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The server took too long to respond. Please try again.',
};

const FALLBACK_5XX = 'Something went wrong on our end. Please try again in a moment.';
const FALLBACK_GENERIC = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = "We couldn't reach the server. Please check your connection and try again.";
const TIMEOUT_MESSAGE = 'The request took too long. Please try again.';

const isTimeout = (axiosError) =>
  axiosError?.code === 'ECONNABORTED' ||
  axiosError?.code === 'ETIMEDOUT' ||
  /timeout/i.test(axiosError?.message ?? '');

const isNetworkError = (axiosError) => {
  if (!axiosError) return false;
  if (axiosError.response) return false;
  return (
    axiosError.code === 'ERR_NETWORK' ||
    axiosError.code === 'ENOTFOUND' ||
    axiosError.code === 'ECONNREFUSED' ||
    /network/i.test(axiosError.message ?? '')
  );
};

export const toFriendlyMessage = ({ status, serverMessage, axiosError } = {}) => {
  if (isTimeout(axiosError)) return TIMEOUT_MESSAGE;
  if (isNetworkError(axiosError)) return NETWORK_MESSAGE;

  if (status && status >= 500) {
    return FRIENDLY_BY_STATUS[status] ?? FALLBACK_5XX;
  }

  if (serverMessage && typeof serverMessage === 'string') return serverMessage;

  return FALLBACK_GENERIC;
};
