/**
 * Module-scoped promise cache for Suspense data loading in client components.
 *
 * React 19's `use()` only accepts promises created outside the render pass
 * (or supplied by a Suspense-compatible cache). `React.cache` targets Server
 * Components and warns on client render, so page shells memoize their load
 * promises here instead. Failed loads are evicted so a later render can retry.
 */

const promiseCache = new Map<string, Promise<unknown>>();

export function stableLoad<T>(key: string, load: () => Promise<T>): Promise<T> {
  const cached = promiseCache.get(key);
  if (cached) {
    return cached as Promise<T>;
  }
  const promise = load();
  promiseCache.set(key, promise);
  promise.catch(() => {
    promiseCache.delete(key);
  });
  return promise;
}

export function clearStableLoadCache(): void {
  promiseCache.clear();
}
