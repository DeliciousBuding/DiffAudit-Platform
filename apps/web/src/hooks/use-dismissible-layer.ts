"use client";

import { useEffect, type RefObject } from "react";

export type DismissibleLayerDismissReason = "escape" | "pointer-outside";
export type DismissibleLayerDismissEvent = KeyboardEvent | PointerEvent;

type UseDismissibleLayerOptions<TElement extends HTMLElement> = {
  enabled: boolean;
  rootRef: RefObject<TElement | null>;
  onDismiss: (
    reason: DismissibleLayerDismissReason,
    event: DismissibleLayerDismissEvent,
  ) => void;
  dismissOnEscape?: boolean;
  dismissOnPointerDownOutside?: boolean;
};

export function isOutsideDismissibleLayer(
  root: Pick<HTMLElement, "contains"> | null,
  target: EventTarget | null,
): boolean {
  if (!root || !target) return true;
  return !root.contains(target as Node);
}

export function useDismissibleLayer<TElement extends HTMLElement>({
  dismissOnEscape = true,
  dismissOnPointerDownOutside = true,
  enabled,
  onDismiss,
  rootRef,
}: UseDismissibleLayerOptions<TElement>) {
  useEffect(() => {
    if (!enabled) return;

    function onPointerDown(event: PointerEvent) {
      if (!dismissOnPointerDownOutside) return;
      if (isOutsideDismissibleLayer(rootRef.current, event.target)) {
        onDismiss("pointer-outside", event);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (dismissOnEscape && event.key === "Escape") {
        onDismiss("escape", event);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [
    dismissOnEscape,
    dismissOnPointerDownOutside,
    enabled,
    onDismiss,
    rootRef,
  ]);
}
