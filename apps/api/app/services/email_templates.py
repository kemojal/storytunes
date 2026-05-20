"""Artist-voiced transactional emails (PDD §25).

Written first-person from the assigned artist so the customer feels they're
hearing from the person making their song — warm, personal, premium.
"""

_WRAP = (
    '<div style="max-width:520px;margin:0 auto;font-family:-apple-system,Segoe UI,'
    'Roboto,Helvetica,Arial,sans-serif;color:#2b2b2b;line-height:1.6;font-size:16px">'
)
_MUTED = 'style="color:#8a8a8a;font-size:13px"'
_BTN = (
    'style="display:inline-block;background:#1f1147;color:#fff;text-decoration:none;'
    'padding:12px 22px;border-radius:10px;font-weight:600"'
)


def _first(name: str | None) -> str:
    return (name or "there").strip().split(" ")[0] or "there"


def confirmation_email(
    *,
    customer_name: str | None,
    artist_name: str,
    recipient_name: str,
    occasion: str,
    order_number: str,
) -> tuple[str, str]:
    subject = f"I've started {recipient_name}'s song ✍️ — {artist_name}"
    html = (
        f"{_WRAP}"
        f"<p>Hi {_first(customer_name)},</p>"
        f"<p>I'm <b>{artist_name}</b> — I'll be writing and producing the custom "
        f"{occasion} song for {recipient_name}.</p>"
        f"<p>I just sat with everything you shared, and I can already feel where this "
        f"one wants to go. I'll shape your story into something {recipient_name} will "
        f"carry for a long time.</p>"
        f"<p>Hang tight — I'll write the moment it's ready for you to hear.</p>"
        f"<p>Warmly,<br><b>{artist_name}</b><br>"
        f"<span {_MUTED}>for StoryTunes</span></p>"
        f"<p {_MUTED}>Order {order_number}</p>"
        "</div>"
    )
    return subject, html


def delivery_email(
    *,
    customer_name: str | None,
    artist_name: str,
    recipient_name: str,
    occasion: str,
    share_url: str,
) -> tuple[str, str]:
    subject = f"{recipient_name}'s song is ready 🎵 — a note from {artist_name}"
    html = (
        f"{_WRAP}"
        f"<p>Hi {_first(customer_name)},</p>"
        f"<p>It's {artist_name}. I just finished {recipient_name}'s {occasion} song — "
        f"and I have to say, this one came from the heart.</p>"
        f"<p>I poured everything you told me into it, line by line. I really hope it "
        f"makes {recipient_name} feel exactly what you wanted them to feel.</p>"
        f'<p style="margin:26px 0">'
        f'<a href="{share_url}" {_BTN}>Listen, download &amp; share</a></p>'
        f"<p>It was an honor to write this for you. If anything needs a touch, just ask "
        f"— I'm here.</p>"
        f"<p>With love,<br><b>{artist_name}</b><br>"
        f"<span {_MUTED}>for StoryTunes</span></p>"
        "</div>"
    )
    return subject, html
