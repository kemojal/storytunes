from datetime import date

from app.services.pricing import (
    ADDON_PRICES_CENTS,
    PACKAGE_PRICES_CENTS,
    expected_delivery,
    price_for,
)


def test_package_base_prices():
    assert price_for("starter") == PACKAGE_PRICES_CENTS["starter"]
    assert price_for("signature") == 9900
    assert price_for("premium") == 19900


def test_addons_sum_into_price():
    base = PACKAGE_PRICES_CENTS["signature"]
    total = price_for("signature", ["rush", "wav"])
    assert total == base + ADDON_PRICES_CENTS["rush"] + ADDON_PRICES_CENTS["wav"]


def test_unknown_addon_ignored():
    assert price_for("starter", ["nope"]) == PACKAGE_PRICES_CENTS["starter"]


def test_unknown_package_raises():
    import pytest

    with pytest.raises(ValueError):
        price_for("gold")


def test_rush_is_faster_than_standard():
    frm = date(2026, 1, 1)
    std = expected_delivery("premium", "standard", frm)
    rush = expected_delivery("premium", "rush", frm)
    assert rush < std
    assert (rush - frm).days == 2
