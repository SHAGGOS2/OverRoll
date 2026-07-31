import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

from source.owrp.modules.roster import (
    ApexModule,
    DeadlockModule,
    FragPunkModule,
    LastFlagModule,
    PaladinsModule,
    ValorantModule,
)
from source.owrp.modules.thefinals import TheFinalsModule


def test_extra_catalogs_generate_complete_teams():
    root = PROJECT / "data" / "assets" / "games"
    modules = (
        ValorantModule(root / "valorant"),
        LastFlagModule(root / "lastflag"),
        DeadlockModule(root / "deadlock"),
        TheFinalsModule(root / "thefinals"),
    )

    for module in modules:
        assert module.catalog()
        slots = module.generate()
        assert len(slots) == module.default_players
        assert all(slot["hero"] for slot in slots)


def test_the_finals_build_contains_weapon_specialization_and_gadgets():
    module = TheFinalsModule(PROJECT / "data" / "assets" / "games" / "thefinals")
    hero = module.generate()[0]["hero"]
    labels = [row["label"] for row in hero["details"]]

    assert labels[:2] == ["ARMA", "ESPECIALIZACION"]
    assert labels[2:] == ["ARTEFACTO 1", "ARTEFACTO 2", "ARTEFACTO 3"]
    assert hero["weapon"]["name"]
    assert hero["specialization"]["name"]
    assert len(hero["gadgets"]) == 3
    assert all("icon" in item for item in [hero["weapon"], hero["specialization"], *hero["gadgets"]])


def test_deadlock_builds_three_priority_options_for_six_players():
    module = DeadlockModule(PROJECT / "data" / "assets" / "games" / "deadlock")

    slots = module.generate()
    assert module.default_players == 6
    assert module.max_players == 6
    assert len(slots) == 6
    assert all(len(slot["options"]) == 3 for slot in slots)
    assert all(
        [option["priority"] for option in slot["options"]]
        == ["max", "high", "selected"]
        for slot in slots
    )


def test_valorant_cards_include_the_default_weapon_and_random_buy_plan():
    module = ValorantModule(PROJECT / "data" / "assets" / "games" / "valorant")
    details = module.generate()[0]["hero"]["details"]

    assert details[0] == {"label": "ARMA INICIAL", "value": "Classic"}
    assert details[1]["label"].startswith("PLAN ALEATORIO")


def test_last_flag_uses_local_official_portraits():
    module = LastFlagModule(PROJECT / "data" / "assets" / "games" / "lastflag")

    assert all(hero["portrait"].endswith(".png") for hero in module.catalog())
    assert {hero["role"] for hero in module.catalog()} == {"contestant"}


def test_new_external_catalogs_have_complete_offline_rosters():
    root = PROJECT / "data" / "assets" / "games"
    modules = (
        (PaladinsModule(root / "paladins"), 59, 5, 10),
        (FragPunkModule(root / "fragpunk"), 21, 5, 10),
        (ApexModule(root / "apex"), 28, 3, 6),
    )

    for module, expected_catalog, expected_default, expected_max in modules:
        assert len(module.catalog()) == expected_catalog
        assert module.default_players == expected_default
        assert module.max_players == expected_max
        slots = module.generate()
        assert len(slots) == expected_default
        assert all(slot["hero"] for slot in slots)


def test_new_external_catalog_roles_are_localized():
    root = PROJECT / "data" / "assets" / "games"
    paladins = PaladinsModule(root / "paladins")
    apex = ApexModule(root / "apex")

    assert paladins.localized_role_labels("pt-br")["frontline"] == "Linha de frente"
    assert apex.localized_role_labels("fr-fr")["controller"] == "Contrôle"
