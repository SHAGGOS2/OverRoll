import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

from source.owrp.modules.rivals import RivalsModule


def test_catalog_teamups_and_generation():
    module = RivalsModule(PROJECT / "data" / "assets" / "games" / "rivals")

    assert len(module.catalog()) == 52
    assert len(module.teamups) >= 9
    assert all(Path(row["portrait"].removeprefix("file:///")).suffix == ".png" for row in module.catalog())

    module.generate("teamups")
    assert len(module.state["slots"]) == 6
    assert all(slot["hero"] for slot in module.state["slots"])
    assert module.state["active_teamups"]


def test_profile_mode_limits_candidates():
    module = RivalsModule(PROJECT / "data" / "assets" / "games" / "rivals")
    profile_id = "profile-test"
    module.state["slots"] = module.state["slots"][:1]
    module.state["slots"][0]["profileId"] = profile_id
    module.profile_rules = {
        profile_id: {
            "mode": "main",
            "heroes": {
                "main": ["rivals-iron-man"],
                "played": [],
                "practice": [],
                "avoid": [],
            },
        }
    }

    module.generate()
    assert module.state["slots"][0]["hero"]["key"] == "rivals-iron-man"


if __name__ == "__main__":
    test_catalog_teamups_and_generation()
    test_profile_mode_limits_candidates()
    print("Rivals module test: OK")
