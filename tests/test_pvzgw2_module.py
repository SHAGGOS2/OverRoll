import importlib.util
import sys
import types
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[1]
MODULES = PROJECT / "source" / "owrp" / "modules"


def load_module(name):
    spec = importlib.util.spec_from_file_location(
        f"owrp.modules.{name}",
        MODULES / f"{name}.py",
    )
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


owrp = types.ModuleType("owrp")
owrp.__path__ = []
sys.modules["owrp"] = owrp
package = types.ModuleType("owrp.modules")
package.__path__ = [str(MODULES)]
sys.modules["owrp.modules"] = package

load_module("base")
load_module("selection")
pvzgw2 = load_module("pvzgw2")


def test_catalog_and_generation():
    module = pvzgw2.PvzGw2Module(PROJECT / "data" / "assets" / "other_hs" / "pvzgw2")
    catalog = module.catalog()
    assert len(catalog) == 16
    assert sum(len(entry["variants"]) for entry in catalog) >= 100

    module.generate("zombies")
    assert all(slot["side"] == "zombies" for slot in module.state["slots"])
    assert all(slot["hero"]["variant"] for slot in module.state["slots"])

    module.state["use_variants"] = False
    module.generate("plants")
    assert all(
        slot["hero"]["variant"]["name"] == "Predeterminado"
        for slot in module.state["slots"]
    )


def test_profile_collection_limits_variants():
    module = pvzgw2.PvzGw2Module(PROJECT / "data" / "assets" / "other_hs" / "pvzgw2")
    owned = module.catalog()[0]["variants"][0]["key"]
    module.state["slots"] = module.state["slots"][:1]
    module.state["slots"][0]["profileId"] = "profile-test"
    module.profile_rules = {
        "profile-test": {
            "collection": [owned],
            "collection_configured": True,
            "favorites": [owned],
            "blocked": [],
        }
    }

    module.generate("plants")
    assert module.state["slots"][0]["hero"]["variant"]["key"] == owned


def test_generate_both_balances_and_shuffles_players():
    module = pvzgw2.PvzGw2Module(PROJECT / "data" / "assets" / "other_hs" / "pvzgw2")
    module.generate("both")
    first = [slot["side"] for slot in module.state["slots"]]
    assert first.count("plants") == 2
    assert first.count("zombies") == 2

    module.generate("both")
    second = [slot["side"] for slot in module.state["slots"]]
    assert second.count("plants") == 2
    assert second.count("zombies") == 2
    assert second != first


if __name__ == "__main__":
    test_catalog_and_generation()
    test_profile_collection_limits_variants()
    test_generate_both_balances_and_shuffles_players()
    print("PVZ module test: OK")
