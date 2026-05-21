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


def _hz(s: str | None) -> str:
    return (s or "").replace("_", " ").strip()


def _recap_row(label: str, value: str) -> str:
    if not value:
        return ""
    return (
        "<tr>"
        '<td style="padding:6px 0;color:#8a8a8a;font-size:13px;width:120px;'
        f'vertical-align:top">{label}</td>'
        f'<td style="padding:6px 0;color:#2b2b2b;font-size:14px;font-weight:600">{value}</td>'
        "</tr>"
    )


def confirmation_email(
    *,
    customer_name: str | None,
    artist_name: str,
    recipient_name: str,
    relationship: str | None,
    occasion: str,
    mood: list[str] | None,
    genre: str | None,
    package_type: str | None,
    delivery_date: str | None,
    order_number: str,
) -> tuple[str, str]:
    rel = _hz(relationship)
    occ = _hz(occasion)
    moods = ", ".join(_hz(m) for m in (mood or []) if m)
    gen = _hz(genre)

    # a natural "vibe" phrase from their choices
    vibe = " ".join(p for p in [moods, gen] if p).strip()
    vibe_phrase = f"a {vibe} song" if vibe else "your song"
    for_phrase = f"your {rel}" if rel else recipient_name

    subject = f"I'm writing {recipient_name}'s {occ} song ✍️"
    html = (
        f"{_WRAP}"
        f"<p>Hi {_first(customer_name)},</p>"
        f"<p>I'm <b>{artist_name}</b>, and I'll be writing and producing "
        f"{recipient_name}'s {occ} song for you — {vibe_phrase} for {for_phrase}.</p>"
        f"<p>I've read through everything you shared about {recipient_name}, and the "
        f"little details are already pulling me in. That's exactly what makes a song "
        f"feel like it could only ever have been written for one person.</p>"
        # tailored recap card
        '<table style="width:100%;border-collapse:collapse;margin:18px 0;'
        'background:#faf7f2;border:1px solid #eee3d6;border-radius:12px;padding:6px 16px">'
        f"{_recap_row('For', f'{recipient_name}' + (f' · your {rel}' if rel else ''))}"
        f"{_recap_row('Occasion', occ)}"
        f"{_recap_row('The vibe', vibe.capitalize() if vibe else '')}"
        f"{_recap_row('Package', _hz(package_type).title())}"
        f"{_recap_row('Expected by', delivery_date or '')}"
        "</table>"
        f"<p>I'll pour all of it into something {recipient_name} will carry for a long "
        f"time, then send it your way to hear first.</p>"
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
