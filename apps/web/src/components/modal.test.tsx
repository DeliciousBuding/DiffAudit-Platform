import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./modal";

describe("Modal", () => {
  it("links the dialog title and localizes the close button label", () => {
    const markup = renderToStaticMarkup(
      <Modal
        open
        onClose={vi.fn()}
        title="Cancel audit job"
        closeLabel="Close dialog"
      >
        Are you sure?
      </Modal>,
    );

    const labelledBy = markup.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeTruthy();
    expect(markup).toContain(`id="${labelledBy}"`);
    expect(markup).toContain('aria-label="Close dialog"');
  });
});
