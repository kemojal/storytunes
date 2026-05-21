from app.services import moderation


def test_prefilter_blocks_obvious_terms():
    assert moderation._prefilter("I want to kill him") == ["kill"]
    assert moderation._prefilter("a warm song for my mom") == []


def test_blocked_term_is_disallowed():
    res = moderation.moderate_text("please make a song to kill someone")
    assert res["allowed"] is False
    assert "blocked_terms" in res["categories"]


def test_clean_text_allowed_without_classifier(monkeypatch):
    # No Gemini key configured in tests -> classifier skipped, clean text allowed.
    res = moderation.moderate_text("an anniversary song about mango smoothies in Taipei")
    assert res["allowed"] is True


def test_empty_text_allowed():
    assert moderation.moderate_text("")["allowed"] is True
