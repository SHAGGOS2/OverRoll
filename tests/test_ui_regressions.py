from pathlib import Path


PROJECT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (PROJECT / relative_path).read_text(encoding="utf-8")


def test_roulette_winner_is_only_revealed_after_animation_finishes():
    roulette_files = (
        "source/qml/RivalsRoulette.qml",
        "source/qml/Tf2Roulette.qml",
        "source/qml/PvzRoulette.qml",
    )

    for relative_path in roulette_files:
        source = _read(relative_path)
        spin_body = source.split("function spin()", 1)[1].split("NumberAnimation", 1)[0]
        finished_body = source.split("onFinished:", 1)[1]

        assert "spinPreview = null" in spin_body
        assert "spinPreview = root.entries[winnerIndex]" not in spin_body
        assert "winner = root.entries[winnerIndex]" in finished_body


def test_overlay_keeps_all_cards_and_supports_small_layouts():
    main_qml = _read("source/qml/Main.qml")
    card_qml = _read("source/qml/components/OverlayHeroCard.qml")
    controller = _read("source/owrp/controller.py")

    overlay_section = main_qml.split("id: obsOverlayComponent", 1)[1].split(
        "function navigatePage", 1
    )[0]
    assert overlay_section.count("Repeater {") >= 2
    assert "GridView {" not in overlay_section
    assert "Math.max(76, gridWidth + 16)" in overlay_section
    assert "property bool mini: width < 105" in card_qml
    assert "max(60, min(300, overlay_card_size))" in controller
    assert "def resetOverlayLayout" in controller
