"""Pricing & delivery-date rules (PDD §10.5, §11). Prices in cents (USD).

Kept in code for now; PDD §28 wants them DB-backed eventually. Easy to move to
a `packages` table — `price_for` is the single read point.
"""

from datetime import date, timedelta

PACKAGE_PRICES_CENTS = {
    "starter": 4900,
    "signature": 9900,
    "premium": 19900,
}

ADDON_PRICES_CENTS = {
    "rush": 2900,
    "instrumental": 1500,
    "lyric_sheet": 900,
    "lyric_video": 3900,
    "cover_art": 1900,
    "private_gift_page": 1200,
    "extra_revision": 2500,
    "wav": 1500,
}

# Standard turnaround per package (business days), PDD §10.5.
PACKAGE_LEAD_DAYS = {
    "starter": 5,
    "signature": 7,
    "premium": 10,
}

RUSH_LEAD_DAYS = 2


def price_for(package_type: str, addons: list[str] | None = None) -> int:
    if package_type not in PACKAGE_PRICES_CENTS:
        raise ValueError(f"Unknown package: {package_type}")
    total = PACKAGE_PRICES_CENTS[package_type]
    for addon in addons or []:
        total += ADDON_PRICES_CENTS.get(addon, 0)
    return total


def expected_delivery(package_type: str, delivery_speed: str, frm: date | None = None) -> date:
    frm = frm or date.today()
    days = RUSH_LEAD_DAYS if delivery_speed == "rush" else PACKAGE_LEAD_DAYS.get(package_type, 7)
    return frm + timedelta(days=days)
