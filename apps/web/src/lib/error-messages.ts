import { type Locale } from "@/components/language-picker";

/**
 * Common error messages with internationalization support
 */
export const ERROR_MESSAGES: Record<Locale, {
  networkError: string;
  apiUnreachable: string;
  unauthorized: string;
  notFound: string;
  serverError: string;
  timeout: string;
  invalidInput: string;
  unknown: string;
}> = {
  "en-US": {
    networkError: "Network error. Please check your connection.",
    apiUnreachable: "Unable to reach the API server.",
    unauthorized: "Unauthorized. Please log in again.",
    notFound: "Resource not found.",
    serverError: "Server error. Please try again later.",
    timeout: "Request timeout. Please try again.",
    invalidInput: "Invalid input. Please check your data.",
    unknown: "An unexpected error occurred.",
  },
  "zh-CN": {
    networkError: "网络错误，请检查您的连接。",
    apiUnreachable: "无法连接到 API 服务器。",
    unauthorized: "未授权，请重新登录。",
    notFound: "资源未找到。",
    serverError: "服务器错误，请稍后重试。",
    timeout: "请求超时，请重试。",
    invalidInput: "输入无效，请检查您的数据。",
    unknown: "发生了意外错误。",
  },
};

/**
 * Map HTTP status codes to localized error messages
 */
export function getErrorMessage(statusCode: number, locale: Locale): string {
  const messages = ERROR_MESSAGES[locale];

  if (statusCode === 401 || statusCode === 403) {
    return messages.unauthorized;
  }
  if (statusCode === 404) {
    return messages.notFound;
  }
  if (statusCode === 408) {
    return messages.timeout;
  }
  if (statusCode >= 500) {
    return messages.serverError;
  }
  if (statusCode >= 400) {
    return messages.invalidInput;
  }

  return messages.unknown;
}

/**
 * Map common error types to localized messages
 */
export function mapErrorToMessage(error: unknown, locale: Locale): string {
  const messages = ERROR_MESSAGES[locale];

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return messages.timeout;
    }
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return messages.networkError;
    }
  }

  return messages.unknown;
}
