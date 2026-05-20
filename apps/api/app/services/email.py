"""Transactional email via Resend (PDD §25). Dev-safe when key is unset."""

import resend

from app.core.config import settings

resend.api_key = settings.resend_api_key or None


def send_email(to: str, subject: str, html: str) -> str | None:
    if not settings.resend_api_key:
        print(f"[email:dev] to={to} subject={subject!r}")
        return None
    res = resend.Emails.send(
        {"from": settings.email_from, "to": to, "subject": subject, "html": html}
    )
    return res.get("id") if isinstance(res, dict) else None
