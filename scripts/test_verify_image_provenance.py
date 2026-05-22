from __future__ import annotations

import unittest

from verify_image_provenance import (
    DEFAULT_API_IMAGE,
    DEFAULT_GHCR_API_IMAGE,
    DEFAULT_GHCR_WEB_IMAGE,
    DEFAULT_WEB_IMAGE,
    REVISION_LABEL,
    SOURCE_LABEL,
    planned_images,
    revision_matches,
    verify_labels,
)


class VerifyImageProvenanceTests(unittest.TestCase):
    def test_revision_match_accepts_full_or_prefix(self) -> None:
        revision = "944263652c67caf7396f37997c2cc51e5ae8b14c"

        self.assertTrue(revision_matches(revision, revision))
        self.assertTrue(revision_matches(revision, "9442636"))
        self.assertTrue(revision_matches("9442636", revision))
        self.assertFalse(revision_matches(revision, "944263"))
        self.assertFalse(revision_matches("unknown", revision))
        self.assertFalse(revision_matches("abc1234", revision))

    def test_planned_images_prefers_explicit_refs(self) -> None:
        self.assertEqual(
            planned_images(["example/web:tag", "example/api:tag"], local_tag="ignored"),
            ["example/web:tag", "example/api:tag"],
        )

    def test_planned_images_supports_local_and_ghcr_presets(self) -> None:
        self.assertEqual(
            planned_images(None, local_tag="944263652c67"),
            [
                f"{DEFAULT_WEB_IMAGE}:944263652c67",
                f"{DEFAULT_API_IMAGE}:944263652c67",
            ],
        )
        self.assertEqual(
            planned_images(None, ghcr_tag="sha-9442636"),
            [
                f"{DEFAULT_GHCR_WEB_IMAGE}:sha-9442636",
                f"{DEFAULT_GHCR_API_IMAGE}:sha-9442636",
            ],
        )

    def test_verify_labels_requires_revision_label(self) -> None:
        result = verify_labels(
            "diffaudit-platform-web:test",
            {},
            expected_revision="944263652c67caf7396f37997c2cc51e5ae8b14c",
        )

        self.assertFalse(result.ok)
        self.assertIn("<missing>", result.message)

    def test_verify_labels_can_check_source(self) -> None:
        labels = {
            REVISION_LABEL: "944263652c67caf7396f37997c2cc51e5ae8b14c",
            SOURCE_LABEL: "https://github.com/DeliciousBuding/DiffAudit-Platform",
        }

        result = verify_labels(
            "diffaudit-platform-api:test",
            labels,
            expected_revision="9442636",
            expected_source="https://github.com/DeliciousBuding/DiffAudit-Platform",
        )

        self.assertTrue(result.ok)

    def test_verify_labels_rejects_wrong_source(self) -> None:
        result = verify_labels(
            "diffaudit-platform-api:test",
            {
                REVISION_LABEL: "944263652c67caf7396f37997c2cc51e5ae8b14c",
                SOURCE_LABEL: "https://example.invalid/repo",
            },
            expected_revision="9442636",
            expected_source="https://github.com/DeliciousBuding/DiffAudit-Platform",
        )

        self.assertFalse(result.ok)
        self.assertIn("source label mismatch", result.message)


if __name__ == "__main__":
    unittest.main()
