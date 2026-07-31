pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    required property var localizer
    property string query: ""
    property string statusFilter: "all"

    function localText(es, en, pt, fr, de, ja, ko) {
        var locale = String(localizer.displayLocale || appController.locale || "es-mx").toLowerCase()
        if (locale.indexOf("pt") === 0) return pt || en
        if (locale.indexOf("fr") === 0) return fr || en
        if (locale.indexOf("de") === 0) return de || en
        if (locale.indexOf("ja") === 0) return ja || en
        if (locale.indexOf("ko") === 0) return ko || en
        if (locale.indexOf("es") === 0) return es
        return en
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 18
        spacing: 12

        RowLayout {
            Layout.fillWidth: true
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0
                Text {
                    text: root.localText("JUEGOS", "GAMES", "JOGOS", "JEUX", "SPIELE", "ゲーム", "게임")
                    color: localizer.text
                    font.family: "Rajdhani"
                    font.pixelSize: 28
                    font.bold: true
                }
                Text {
                    text: root.localText(
                        "Elige el juego que controlará el selector, los perfiles y sus reglas.",
                        "Choose the game used by the selector, profiles, and rules.",
                        "Escolha o jogo usado pelo seletor, perfis e regras.",
                        "Choisissez le jeu utilisé par le sélecteur, les profils et les règles.",
                        "Wähle das Spiel für Auswahl, Profile und Regeln.",
                        "セレクター、プロフィール、ルールで使用するゲームを選択します。",
                        "선택기, 프로필, 규칙에 사용할 게임을 선택하세요.")
                    color: localizer.muted
                    font.pixelSize: 11
                }
            }
            TextField {
                Layout.preferredWidth: 260
                placeholderText: root.localText("Buscar juego", "Search games", "Buscar jogo", "Rechercher un jeu", "Spiel suchen", "ゲームを検索", "게임 검색")
                color: localizer.text
                onTextChanged: root.query = text.toLowerCase()
                background: Rectangle { color: "#081725"; border.color: localizer.line }
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Repeater {
                model: [
                    { id: "all" },
                    { id: "available" },
                    { id: "planned" }
                ]
                delegate: OWButton {
                    required property var modelData
                    Layout.preferredWidth: 150
                    text: modelData.id === "all"
                        ? root.localText("TODOS", "ALL", "TODOS", "TOUS", "ALLE", "すべて", "전체")
                        : modelData.id === "available"
                          ? root.localText("DISPONIBLES", "AVAILABLE", "DISPONÍVEIS", "DISPONIBLES", "VERFÜGBAR", "利用可能", "사용 가능")
                          : root.localText("PRÓXIMAMENTE", "COMING SOON", "EM BREVE", "BIENTÔT", "DEMNÄCHST", "近日公開", "출시 예정")
                    selected: root.statusFilter === modelData.id
                    onClicked: root.statusFilter = modelData.id
                }
            }
            Item { Layout.fillWidth: true }
        }

        GridView {
            id: grid
            Layout.fillWidth: true
            Layout.fillHeight: true
            property int columns: width >= 1120 ? 3 : width >= 720 ? 2 : 1
            cellWidth: width / columns
            cellHeight: 172
            clip: true
            model: moduleManager.games
            boundsBehavior: Flickable.StopAtBounds
            ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

            delegate: Rectangle {
                required property var modelData
                property bool matchesSearch: !root.query.length
                    || String(modelData.name).toLowerCase().indexOf(root.query) >= 0
                property bool matchesStatus: root.statusFilter === "all"
                    || (root.statusFilter === "available" && modelData.available)
                    || (root.statusFilter === "planned" && !modelData.available)
                visible: matchesSearch && matchesStatus
                width: visible ? grid.cellWidth - 10 : 0
                height: visible ? grid.cellHeight - 10 : 0
                x: 5
                y: 5
                color: modelData.available ? "#0a1b2a" : "#09131e"
                border.color: moduleManager.activeGame === modelData.game_id
                    ? modelData.accent : (modelData.available ? "#31506a" : "#263744")
                border.width: moduleManager.activeGame === modelData.game_id ? 2 : 1
                opacity: modelData.available ? 1 : 0.68

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 14
                    spacing: 6
                    RowLayout {
                        Layout.fillWidth: true
                        Rectangle {
                            Layout.preferredWidth: 5
                            Layout.fillHeight: true
                            color: modelData.accent
                        }
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 0
                            Text {
                                text: String(modelData.name).toUpperCase()
                                color: localizer.text
                                font.family: "Rajdhani"
                                font.pixelSize: 18
                                font.bold: true
                            }
                            Text {
                                text: modelData.source
                                color: modelData.accent
                                font.pixelSize: 9
                                font.bold: true
                            }
                        }
                        Text {
                            text: moduleManager.activeGame === modelData.game_id
                                ? root.localText("ACTIVO", "ACTIVE", "ATIVO", "ACTIF", "AKTIV", "有効", "활성")
                                : modelData.available
                                  ? root.localText("LISTO", "READY", "PRONTO", "PRÊT", "BEREIT", "準備完了", "준비됨")
                                  : root.localText("NO DISPONIBLE", "UNAVAILABLE", "INDISPONÍVEL", "INDISPONIBLE", "NICHT VERFÜGBAR", "利用不可", "사용 불가")
                            color: modelData.available ? modelData.accent : localizer.muted
                            font.pixelSize: 9
                            font.bold: true
                        }
                    }
                    Text {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        text: modelData.description
                        color: localizer.muted
                        font.pixelSize: 10
                        wrapMode: Text.Wrap
                        maximumLineCount: 3
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 34
                        enabled: modelData.available
                        selected: moduleManager.activeGame === modelData.game_id
                        text: moduleManager.activeGame === modelData.game_id
                            ? root.localText("JUEGO ACTIVO", "ACTIVE GAME", "JOGO ATIVO", "JEU ACTIF", "AKTIVES SPIEL", "有効なゲーム", "활성 게임")
                            : modelData.available
                              ? root.localText("ACTIVAR JUEGO", "ACTIVATE GAME", "ATIVAR JOGO", "ACTIVER LE JEU", "SPIEL AKTIVIEREN", "ゲームを有効化", "게임 활성화")
                              : root.localText("NO DISPONIBLE", "UNAVAILABLE", "INDISPONÍVEL", "INDISPONIBLE", "NICHT VERFÜGBAR", "利用不可", "사용 불가")
                        activeColor: modelData.accent
                        onClicked: {
                            if (moduleManager.activate(modelData.game_id))
                                localizer.navigatePage("result")
                        }
                    }
                }
            }
        }
    }
}
