import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { ApiKeyRevokeModal } from "./ApiKeysClient";

describe("ApiKeyRevokeModal", () => {
  it("uses the shared dialog semantics and English revoke copy", () => {
    const markup = renderToStaticMarkup(
      <ApiKeyRevokeModal
        copy={WORKSPACE_COPY["en-US"].apiKeys}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        pendingRevokeId="key_1"
      />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("Disable this key?");
    expect(markup).toContain("Confirm disable");
  });

  it("renders localized zh-CN revoke copy", () => {
    const markup = renderToStaticMarkup(
      <ApiKeyRevokeModal
        copy={WORKSPACE_COPY["zh-CN"].apiKeys}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        pendingRevokeId="key_1"
      />,
    );

    expect(markup).toContain("停用此密钥？");
    expect(markup).toContain("确认停用");
  });
});
