import os
import tempfile
from pathlib import Path

from PySide6.QtCore import QCoreApplication

from source.owrp.controller import AppController, ROLES


PROJECT = Path(__file__).resolve().parents[1]


def _controller() -> tuple[AppController, tempfile.TemporaryDirectory[str], str | None]:
    QCoreApplication.instance() or QCoreApplication([])
    temp = tempfile.TemporaryDirectory(dir=PROJECT)
    old_appdata = os.environ.get("APPDATA")
    os.environ["APPDATA"] = temp.name
    return AppController(PROJECT), temp, old_appdata


def _cleanup(
    controller: AppController,
    temp: tempfile.TemporaryDirectory[str],
    old_appdata: str | None,
) -> None:
    controller.audio.shutdown()
    temp.cleanup()
    if old_appdata is None:
        os.environ.pop("APPDATA", None)
    else:
        os.environ["APPDATA"] = old_appdata


def test_quick_play_uses_balanced_roles_in_custom_mode():
    controller, temp, old_appdata = _controller()
    try:
        controller._mode = "custom"
        controller._custom_count = 3
        controller._quickplay = True
        controller._roles_only = True
        for player in controller.players[:3]:
            player["roles"] = set(ROLES)

        controller.generateTeam()

        assert {pick["role"] for pick in controller.current_picks} == set(ROLES)
    finally:
        _cleanup(controller, temp, old_appdata)


def test_disabling_quick_play_allows_free_roles_in_fixed_formats():
    controller, temp, old_appdata = _controller()
    try:
        controller._mode = "122"
        controller._quickplay = False
        controller._roles_only = True
        for player in controller.players[:5]:
            player["roles"] = {"damage"}

        controller.generateTeam()

        assert len(controller.current_picks) == 5
        assert {pick["role"] for pick in controller.current_picks} == {"damage"}
    finally:
        _cleanup(controller, temp, old_appdata)


def test_composition_toggle_is_an_alias_for_quick_play():
    controller, temp, old_appdata = _controller()
    try:
        controller._quickplay = True
        controller.toggleRule("composition")
        assert controller.quickplayOnly is False
        assert controller.roleComposition is False

        controller.toggleRule("quickplay")
        assert controller.quickplayOnly is True
        assert controller.roleComposition is True
    finally:
        _cleanup(controller, temp, old_appdata)


def test_profile_tag_contains_only_the_usage_label():
    controller, temp, old_appdata = _controller()
    try:
        if not controller.currentProfileId:
            controller.newProfile()
        profile = controller.profiles[controller.currentProfileId]
        profile["heroes"]["main"] = ["ana"]
        controller.players[0]["profileId"] = profile["id"]

        assert controller._profile_tag(controller.players[0], "ana") == "Main"
        assert profile["name"] not in controller._profile_tag(controller.players[0], "ana")
    finally:
        _cleanup(controller, temp, old_appdata)


def test_pinned_pick_survives_generation_and_reroll():
    controller, temp, old_appdata = _controller()
    try:
        controller.generateTeam()
        original = controller.current_picks[0]
        original_hero = original["hero"]["key"]
        original_role = original["role"]

        controller.togglePickPinned(0)
        controller.reroll(0)
        assert controller.current_picks[0]["hero"]["key"] == original_hero

        controller.generateTeam()
        pinned = next(
            pick
            for pick in controller.current_picks
            if pick["player"]["playerIndex"] == original["player"]["playerIndex"]
        )
        assert pinned["hero"]["key"] == original_hero
        assert pinned["role"] == original_role
        assert pinned["pinned"] is True
    finally:
        _cleanup(controller, temp, old_appdata)


def test_relative_portrait_is_resolved_to_a_local_file_url():
    controller, temp, old_appdata = _controller()
    try:
        portrait = controller.heroPortrait(
            "ana",
            "../data/assets/heroes/ana.png",
        )
        assert portrait.startswith("file:")
        assert "ana.png" in portrait
    finally:
        _cleanup(controller, temp, old_appdata)


def test_roleless_profile_games_do_not_show_an_all_filter():
    controller, temp, old_appdata = _controller()
    try:
        controller._profile_game = "lastflag"
        assert controller.profileGameRoles == []
        controller._profile_game = "fragpunk"
        assert controller.profileGameRoles == []
    finally:
        _cleanup(controller, temp, old_appdata)
