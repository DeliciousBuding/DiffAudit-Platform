import { fetch as undiciFetch, ProxyAgent } from "undici";

type OAuthFetchInit = {
  method?: string;
  headers?: HeadersInit;
  body?: string | URLSearchParams;
};

let proxyAgent: ProxyAgent | null = null;
let proxyAgentUrl = "";

function configuredOAuthProxyUrl() {
  const value = process.env.DIFFAUDIT_OAUTH_PROXY_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function oauthProxyAgent() {
  const proxyUrl = configuredOAuthProxyUrl();
  if (!proxyUrl) return null;
  if (!proxyAgent || proxyAgentUrl !== proxyUrl) {
    proxyAgent = new ProxyAgent(proxyUrl);
    proxyAgentUrl = proxyUrl;
  }
  return proxyAgent;
}

export async function oauthFetch(input: string, init?: OAuthFetchInit): Promise<Response> {
  const agent = oauthProxyAgent();
  if (!agent) {
    return fetch(input, init);
  }
  const response = await undiciFetch(input, {
    ...init,
    dispatcher: agent,
  });
  return response as unknown as Response;
}
