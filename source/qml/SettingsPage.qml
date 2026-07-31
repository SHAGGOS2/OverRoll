pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    objectName: "settingsPage"
    required property var localizer
    property var window: localizer
    property var ui: localizer.ui
    property string section: "appearance"
    property string dataSection: "general"
    property string voiceCreditsLocale: appController.locale === "en-us" ? "en" : "latam"
    property bool overlayAdvanced: false
    property var creditGroups: [
        {
            title: root.catalogText("DIRECCIÓN", "DIRECTION", "DIREÇÃO", "DIRECTION", "LEITUNG", "ディレクション", "디렉션"),
            body: root.catalogText("Dirección de producto, diseño y pruebas: SHAGGOS. Desarrollo e implementación: OpenAI Codex.", "Product direction, design, and testing: SHAGGOS. Development and implementation: OpenAI Codex."),
            color: "#f6a21a"
        },
        {
            title: "OVERWATCH",
            body: root.catalogText("Snapshot local actualizable con OverFast; arte, voces y marcas pertenecen a Blizzard Entertainment.", "Local snapshot updateable with OverFast; art, voices, and trademarks belong to Blizzard Entertainment."),
            color: "#43cfff"
        },
        {
            title: "MARVEL RIVALS",
            body: root.catalogText("Catálogo local y Team-Ups referenciados con Marvel Rivals Wiki; material de Marvel y NetEase Games.", "Local catalog and Team-Ups referenced with Marvel Rivals Wiki; material from Marvel and NetEase Games."),
            color: "#ffcc42"
        },
        {
            title: "TEAM FORTRESS 2",
            body: root.catalogText("Catálogo local con material de Valve.", "Local catalog using material from Valve."),
            color: "#e8a45b"
        },
        {
            title: "PLANTS VS. ZOMBIES: GARDEN WARFARE 2",
            body: root.catalogText("Catálogo local con material de Electronic Arts y PopCap Games.", "Local catalog using material from Electronic Arts and PopCap Games."),
            color: "#75d66b"
        },
        {
            title: "VALORANT",
            body: root.catalogText("Fuentes: Riot VAL-CONTENT y Valorant-API.", "Sources: Riot VAL-CONTENT and Valorant-API."),
            color: "#ff5b69"
        },
        {
            title: "LAST FLAG",
            body: root.catalogText("Catálogo basado en el sitio oficial de concursantes de Last Flag.", "Catalog based on the official Last Flag contestants site."),
            color: "#6ec8ff"
        },
        {
            title: "DEADLOCK",
            body: root.catalogText("Catálogo local basado en material de Valve.", "Local catalog based on material from Valve."),
            color: "#d6b26d"
        },
        {
            title: "THE FINALS",
            body: root.catalogText("Catálogo basado en material de Embark Studios y THE FINALS Wiki.", "Catalog based on material from Embark Studios and THE FINALS Wiki."),
            color: "#ffe04b"
        },
        {
            title: "PALADINS",
            body: root.catalogText("Fuentes: API oficial de Hi-Rez y caché local de Paladins Wiki.", "Sources: official Hi-Rez API and local Paladins Wiki cache."),
            color: "#43aee8"
        },
        {
            title: "FRAGPUNK",
            body: root.catalogText("Catálogo basado en el sitio oficial de FragPunk.", "Catalog based on the official FragPunk site."),
            color: "#ef4d7b"
        },
        {
            title: "APEX LEGENDS",
            body: root.catalogText("Catálogo basado en el centro oficial de personajes de Electronic Arts.", "Catalog based on Electronic Arts' official character hub."),
            color: "#e06b5f"
        },
        {
            title: root.catalogText("SONIDO", "AUDIO", "ÁUDIO", "AUDIO", "AUDIO", "オーディオ", "오디오"),
            body: root.catalogText("Efectos de los juegos y sonidos de interfaz de Kenney (CC0). Voces acreditadas en Idioma y datos.", "Game effects and Kenney interface sounds (CC0). Voice credits are listed under Language and data."),
            color: "#a783ff"
        }
    ]

    function catalogText(spanish, english, portuguese, french, german, japanese, korean) {
        var locale = String(appController.locale || "")
        if (locale.indexOf("es-") === 0) return spanish
        if (locale.indexOf("pt-") === 0) return portuguese || english
        if (locale.indexOf("fr-") === 0) return french || english
        if (locale.indexOf("de-") === 0) return german || english
        if (locale.indexOf("ja-") === 0) return japanese || english
        if (locale.indexOf("ko-") === 0) return korean || english
        return english
    }

    function adjustOverlay(setting, delta) {
        if (setting === "size")
            appController.setOverlayCardSize(appController.overlayCardSize + delta * 10)
        else if (setting === "opacity")
            appController.setOverlayNumber("overlay_opacity", appController.overlayOpacity + delta * 5)
        else if (setting === "spacing")
            appController.setOverlayNumber("overlay_spacing", appController.overlaySpacing + delta * 2)
        else if (setting === "columns")
            appController.setOverlayNumber("overlay_columns", appController.overlayColumns + delta)
    }

    function catalogDescription(gameId) {
        if (gameId === "overwatch") return catalogText(
            "Catálogo principal con el roster local de Overwatch, roles, retratos y actualización manual desde la API.",
            "Main catalog with the local Overwatch roster, roles, portraits, and manual API updates.")
        if (gameId === "tf2") return catalogText(
            "Catálogo offline con las nueve clases, dividido en Ofensiva, Defensa y Apoyo. No necesita API.",
            "Offline catalog with all nine classes, grouped as Offense, Defense, and Support. No API is required.")
        if (gameId === "pvzgw2") return catalogText(
            "Catálogo offline con 121 personajes y variantes de Garden Warfare 2, dividido entre Plantas y Zombis.",
            "Offline catalog with 121 Garden Warfare 2 characters and variants, split between Plants and Zombies.")
        if (gameId === "rivals") return catalogText(
            "Roster local de Marvel Rivals con roles, retratos, perfiles y prioridad para Team-Ups. Funciona sin depender de una API al jugar.",
            "Local Marvel Rivals roster with roles, portraits, profiles, and Team-Up priority. Gameplay does not depend on an API.")
        if (gameId === "paladins") return catalogText(
            "Roster local de 59 campeones con los cuatro roles, filtros, perfiles y ruleta.",
            "Local roster of 59 champions with all four roles, filters, profiles, and roulette.")
        if (gameId === "fragpunk") return catalogText(
            "Roster local de 21 Lancers obtenido del sitio oficial, con filtros, perfiles y ruleta.",
            "Local roster of 21 Lancers sourced from the official site, with filters, profiles, and roulette.")
        if (gameId === "apex") return catalogText(
            "Roster local de 28 leyendas y sus cinco clases, basado en el centro oficial de personajes de EA.",
            "Local roster of 28 legends and their five classes, based on EA's official character hub.")
        return catalogText(
            "Todavía no está disponible en esta versión de OverRoll.",
            "This catalog is not available in this version of OverRoll.")
    }

    function catalogIntro() {
        return catalogText(
            "El juego activo controla el selector, sus reglas y resultados. Cada catálogo funciona como un módulo separado y conserva su estado.",
            "The active game controls the selector, rules, and results. Every catalog is an independent module and keeps its own state.")
    }

    property var heroShooterSources: [
        {
            name: "OVERWATCH",
            gameId: "overwatch",
            available: true,
            source: ui.api_local,
            status: root.catalogText("DISPONIBLE", "AVAILABLE"),
            description: root.catalogDescription("overwatch"),
            color: "#f6a21a"
        },
        {
            name: "TEAM FORTRESS 2",
            gameId: "tf2",
            available: true,
            source: ui.api_local,
            status: root.catalogText("DISPONIBLE", "AVAILABLE"),
            description: root.catalogDescription("tf2"),
            color: "#f0a060"
        },
        {
            name: "PVZ GARDEN WARFARE 2",
            gameId: "pvzgw2",
            available: true,
            source: ui.api_local,
            status: root.catalogText("DISPONIBLE", "AVAILABLE"),
            description: root.catalogDescription("pvzgw2"),
            color: "#68d56e"
        },
        {
            name: "MARVEL RIVALS",
            gameId: "rivals",
            available: true,
            source: ui.api_local,
            status: root.catalogText("DISPONIBLE", "AVAILABLE"),
            description: root.catalogDescription("rivals"),
            color: "#ffcc42"
        },
        {
            name: "VALORANT",
            gameId: "valorant",
            available: false,
            source: ui.api_official,
            status: root.catalogText("NO DISPONIBLE", "NOT AVAILABLE"),
            description: root.catalogDescription("valorant"),
            color: "#ff5b69"
        },
        {
            name: "APEX LEGENDS",
            gameId: "apex",
            available: true,
            source: ui.api_official,
            status: root.catalogText("DISPONIBLE", "AVAILABLE"),
            description: root.catalogDescription("apex"),
            color: "#e06b5f"
        },
        {
            name: "PALADINS",
            gameId: "paladins",
            available: true,
            source: ui.api_official,
            status: root.catalogText("DISPONIBLE", "AVAILABLE"),
            description: root.catalogDescription("paladins"),
            color: "#43aee8"
        },
        {
            name: "FRAGPUNK",
            gameId: "fragpunk",
            available: true,
            source: ui.api_official,
            status: root.catalogText("DISPONIBLE", "AVAILABLE"),
            description: root.catalogDescription("fragpunk"),
            color: "#ef4d7b"
        }
    ]

    function sectionHelp() {
        if (section === "appearance") return ui.appearance_help
        if (section === "data") return ui.data_help
        if (section === "connections") return ui.connections_help
        if (section === "otherHs") return ui.other_hs_help
        if (section === "secrets") return root.catalogText(
            "Administra los secretos desbloqueados y sus efectos visuales.",
            "Manage unlocked secrets and their visual effects.",
            "Gerencie segredos desbloqueados e seus efeitos visuais.",
            "Gérez les secrets débloqués et leurs effets visuels.",
            "Verwalte freigeschaltete Geheimnisse und ihre visuellen Effekte.",
            "解除したシークレットと表示効果を管理します。",
            "해제한 비밀 요소와 시각 효과를 관리합니다.")
        return ui.credits_help
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 10

        ColumnLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 52
            spacing: 0
            Text {
                text: ui.settings
                color: window.text
                font.family: "Rajdhani"
                font.pixelSize: 28
                font.bold: true
            }
            Text {
                Layout.fillWidth: true
                text: ui.settings_subtitle
                color: window.muted
                font.family: "Open Sans"
                font.pixelSize: 10
                elide: Text.ElideRight
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 10

            Rectangle {
                Layout.preferredWidth: 240
                Layout.fillHeight: true
                color: window.panel
                border.color: window.line
                border.width: 1

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 8

                    Text {
                        text: ui.settings
                        color: window.orange
                        font.family: "Rajdhani"
                        font.pixelSize: 13
                        font.bold: true
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 46
                        text: ui.appearance
                        selected: root.section === "appearance"
                        onClicked: {
                            root.section = "appearance"
                            appController.playUiSound("nav_click")
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 46
                        text: ui.data_section
                        selected: root.section === "data"
                        onClicked: {
                            root.section = "data"
                            appController.playUiSound("nav_click")
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 46
                        text: ui.connections
                        selected: root.section === "connections"
                        onClicked: {
                            root.section = "connections"
                            appController.playUiSound("nav_click")
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 46
                        text: ui.other_hs
                        selected: root.section === "otherHs"
                        onClicked: {
                            root.section = "otherHs"
                            appController.playUiSound("nav_click")
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 46
                        visible: appController.secretsUnlocked
                        text: root.catalogText("SECRETOS", "SECRETS", "SEGREDOS", "SECRETS", "GEHEIMNISSE", "シークレット", "비밀")
                        selected: root.section === "secrets"
                        onClicked: {
                            root.section = "secrets"
                            appController.playUiSound("nav_click")
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 46
                        text: ui.credits
                        selected: root.section === "credits"
                        onClicked: {
                            root.section = "credits"
                            appController.playUiSound("nav_click")
                        }
                    }
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 112
                        color: "#071521"
                        border.color: window.line
                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 11
                            spacing: 5
                            Text {
                                text: root.section === "appearance" ? ui.appearance
                                    : root.section === "data" ? ui.data_section
                                    : root.section === "connections" ? ui.connections
                                    : root.section === "otherHs" ? ui.other_hs
                                    : root.section === "secrets"
                                      ? root.catalogText("SECRETOS", "SECRETS", "SEGREDOS", "SECRETS", "GEHEIMNISSE", "シークレット", "비밀")
                                      : ui.credits
                                color: window.orange
                                font.family: "Rajdhani"
                                font.pixelSize: 13
                                font.bold: true
                            }
                            Text {
                                Layout.fillWidth: true
                                Layout.fillHeight: true
                                text: root.sectionHelp()
                                color: window.muted
                                font.family: "Open Sans"
                                font.pixelSize: 10
                                wrapMode: Text.Wrap
                                verticalAlignment: Text.AlignTop
                            }
                        }
                    }
                    Item { Layout.fillHeight: true }
                }
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: window.panel
                border.color: window.line
                border.width: 1

                Item {
                    anchors.fill: parent
                    anchors.margins: 12

                    Loader {
                        anchors.fill: parent
                        active: root.section === "appearance"
                        asynchronous: false
                        sourceComponent: Component {
                            Flickable {
                                id: appearanceScroll
                                anchors.fill: parent
                                clip: true
                                contentWidth: width
                                contentHeight: appearanceColumn.implicitHeight
                                boundsBehavior: Flickable.StopAtBounds
                                ScrollBar.vertical: ScrollBar {
                                    policy: appearanceScroll.contentHeight > appearanceScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                                }

                                Column {
                                    id: appearanceColumn
                                    width: appearanceScroll.width - (appearanceScroll.contentHeight > appearanceScroll.height ? 10 : 0)
                                    spacing: 10

                            Text {
                                text: ui.audio_group
                                color: window.orange
                                font.family: "Rajdhani"
                                font.pixelSize: 19
                                font.bold: true
                            }
                            Rectangle {
                                width: parent.width
                                height: 370
                                color: "#0a1d30"
                                border.color: window.line
                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 12
                                    spacing: 8
                                    ToggleRow { Layout.fillWidth: true; text: ui.sound; checkedValue: appController.soundEnabled; onClicked: appController.setBoolSetting("sounds", !appController.soundEnabled) }
                                    ToggleRow { Layout.fillWidth: true; text: ui.voices; checkedValue: appController.heroVoices; activeColor: "#a783ff"; onClicked: appController.setBoolSetting("voices", !appController.heroVoices) }
                                    ToggleRow { Layout.fillWidth: true; text: ui.hover_sounds; checkedValue: appController.hoverSounds; activeColor: window.cyan; onClicked: appController.setBoolSetting("hover", !appController.hoverSounds) }
                                    ToggleRow { Layout.fillWidth: true; text: ui.stats_sounds; checkedValue: appController.statsSounds; activeColor: window.cyan; onClicked: appController.setBoolSetting("stats", !appController.statsSounds) }
                                    Rectangle { Layout.fillWidth: true; Layout.preferredHeight: 1; color: window.line }
                                    RowLayout {
                                        Layout.fillWidth: true
                                        Text { Layout.fillWidth: true; text: ui.volume; color: window.text; font.family: "Rajdhani"; font.pixelSize: 16; font.bold: true }
                                        Text { text: appController.volume + "%"; color: window.orange; font.family: "Rajdhani"; font.pixelSize: 14; font.bold: true }
                                    }
                                    Slider {
                                        Layout.fillWidth: true
                                        from: 0
                                        to: 100
                                        value: appController.volume
                                        onMoved: appController.setVolume(Math.round(value))
                                    }
                                    RowLayout {
                                        Layout.fillWidth: true
                                        spacing: 5
                                        Repeater {
                                            model: [25, 50, 75, 100]
                                            delegate: OWButton {
                                                required property int modelData
                                                Layout.fillWidth: true
                                                Layout.preferredHeight: 32
                                                text: modelData + "%"
                                                selected: appController.volume === modelData
                                                onClicked: {
                                                    appController.setVolume(modelData)
                                                    appController.playUiSound("click")
                                                }
                                            }
                                        }
                                        OWButton {
                                            Layout.fillWidth: true
                                            Layout.preferredHeight: 32
                                            text: ui.preview_sound
                                            onClicked: appController.playUiSound("nav_click")
                                        }
                                    }
                                }
                            }

                            Text {
                                text: ui.visual_group
                                color: window.orange
                                font.family: "Rajdhani"
                                font.pixelSize: 19
                                font.bold: true
                            }
                            Rectangle {
                                width: parent.width
                                height: 374
                                color: "#0a1d30"
                                border.color: window.line
                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 12
                                    spacing: 8
                                    Text {
                                        text: "RENDIMIENTO"
                                        color: window.orange
                                        font.family: "Rajdhani"
                                        font.pixelSize: 14
                                        font.bold: true
                                    }
                                    Text {
                                        Layout.fillWidth: true
                                        text: appController.performanceMode === "low"
                                              ? "Bajo: sin hover ni transiciones, sin precarga de fichas y con caché visual mínima. Recomendado para equipos modestos."
                                              : appController.performanceMode === "high"
                                                ? "Alto: precarga imágenes y fichas, conserva caché visual y usa transiciones completas."
                                                : "Medio: transiciones breves, sin precarga extensa y con caché visual reducida."
                                        color: window.muted
                                        font.pixelSize: 10
                                        wrapMode: Text.Wrap
                                    }
                                    RowLayout {
                                        Layout.fillWidth: true
                                        spacing: 5
                                        Repeater {
                                            model: [
                                                { id: "low", name: "BAJO" },
                                                { id: "medium", name: "MEDIO" },
                                                { id: "high", name: "ALTO" }
                                            ]
                                            delegate: OWButton {
                                                required property var modelData
                                                Layout.fillWidth: true
                                                text: modelData.name
                                                selected: appController.performanceMode === modelData.id
                                                onClicked: appController.setTextSetting("performance_mode", modelData.id)
                                            }
                                        }
                                    }
                                    ToggleRow { Layout.fillWidth: true; text: ui.animations; checkedValue: appController.animationsEnabled; onClicked: appController.setBoolSetting("animations", !appController.animationsEnabled) }
                                    ToggleRow { Layout.fillWidth: true; text: ui.compact; checkedValue: appController.compactCards; activeColor: "#f6a21a"; onClicked: appController.setBoolSetting("compact", !appController.compactCards) }
                                    Rectangle { Layout.fillWidth: true; Layout.preferredHeight: 1; color: window.line }
                                    Text {
                                        text: root.catalogText("ANCHO DE LA BARRA LATERAL", "LEFT SIDEBAR WIDTH")
                                        color: window.orange
                                        font.family: "Rajdhani"
                                        font.pixelSize: 14
                                        font.bold: true
                                    }
                                    Text {
                                        Layout.fillWidth: true
                                        text: root.catalogText(
                                                  "Aumenta el espacio de nombres, reglas y controles. La ruleta conserva un ancho minimo comodo.",
                                                  "Give names, rules, and controls more room. Roulette keeps a comfortable minimum width.")
                                        color: window.muted
                                        font.family: "Open Sans"
                                        font.pixelSize: 10
                                        wrapMode: Text.Wrap
                                    }
                                    RowLayout {
                                        Layout.fillWidth: true
                                        spacing: 5
                                        Repeater {
                                            model: [
                                                { value: 326, name: root.catalogText("NORMAL", "NORMAL") },
                                                { value: 390, name: root.catalogText("GRANDE", "LARGE") },
                                                { value: 460, name: root.catalogText("MUY GRANDE", "EXTRA LARGE") }
                                            ]
                                            delegate: OWButton {
                                                required property var modelData
                                                Layout.fillWidth: true
                                                Layout.preferredHeight: 34
                                                text: modelData.name
                                                selected: appController.sidebarWidth === modelData.value
                                                onClicked: appController.setSidebarWidth(modelData.value)
                                            }
                                        }
                                    }
                                }
                            }
                                }
                            }
                        }
                    }

                    Loader {
                        anchors.fill: parent
                        active: root.section === "data"
                        asynchronous: false
                        sourceComponent: Component {
                            ColumnLayout {
                                anchors.fill: parent
                                spacing: 10
                        RowLayout {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 42
                            spacing: 6
                            OWButton {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 40
                                text: ui.data_general
                                selected: root.dataSection === "general"
                                onClicked: { root.dataSection = "general"; appController.playUiSound("nav_click") }
                            }
                            OWButton {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 40
                                text: ui.voice_credits
                                selected: root.dataSection === "voices"
                                onClicked: { root.dataSection = "voices"; appController.playUiSound("nav_click") }
                            }
                        }

                        StackLayout {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            currentIndex: root.dataSection === "general" ? 0 : 1

                            Flickable {
                                id: dataScroll
                                clip: true
                                contentWidth: width
                                contentHeight: dataColumn.implicitHeight
                                boundsBehavior: Flickable.StopAtBounds
                                ScrollBar.vertical: ScrollBar { policy: dataScroll.contentHeight > dataScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
                                Column {
                                    id: dataColumn
                                    width: dataScroll.width - (dataScroll.contentHeight > dataScroll.height ? 10 : 0)
                                    spacing: 10
                                    Rectangle {
                                        width: parent.width
                                        height: 132
                                        color: "#0a1d30"
                                        border.color: window.line
                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 12
                                            spacing: 8
                                            Text { text: ui.language; color: window.text; font.family: "Rajdhani"; font.pixelSize: 16; font.bold: true }
                                            DarkComboBox {
                                                id: localeBox
                                                Layout.fillWidth: true
                                                Layout.preferredHeight: 42
                                                model: window.localeChoices
                                                textRole: "name"
                                                valueRole: "id"
                                                currentIndex: indexOfValue(window.displayLocale)
                                                displayText: currentIndex >= 0 ? textAt(currentIndex) : window.displayLocale
                                                Component.onCompleted: currentIndex = indexOfValue(window.displayLocale)
                                                onActivated: window.setDisplayLocale(currentValue)
                                                contentItem: Text { text: localeBox.displayText; color: window.text; leftPadding: 10; verticalAlignment: Text.AlignVCenter; font.family: "Rajdhani"; font.pixelSize: 12 }
                                                background: Rectangle { color: "#0b1e31"; border.color: window.line }
                                            }
                                        }
                                    }
                                    Rectangle {
                                        width: parent.width
                                        height: 226
                                        color: "#0a1d30"
                                        border.color: window.line
                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 12
                                            spacing: 9
                                            Text { text: ui.update_api; color: window.text; font.family: "Rajdhani"; font.pixelSize: 16; font.bold: true }
                                            Text { Layout.fillWidth: true; text: ui.api_data_help; color: window.muted; font.family: "Open Sans"; font.pixelSize: 10; wrapMode: Text.Wrap }
                                            RowLayout {
                                                Layout.fillWidth: true
                                                spacing: 8
                                                OWButton { Layout.fillWidth: true; Layout.preferredHeight: 42; text: appController.apiRunning ? ui.api_running : ui.update_api; enabled: !appController.apiRunning; selected: appController.apiRunning; onClicked: appController.updateFromApi() }
                                                OWButton { visible: appController.apiRunning; Layout.preferredWidth: visible ? 190 : 0; Layout.preferredHeight: 42; text: appController.apiCancelling ? ui.api_cancelling : ui.cancel_api; enabled: !appController.apiCancelling; activeColor: "#ff5064"; onClicked: appController.cancelApiUpdate() }
                                            }
                                            ProgressBar { Layout.fillWidth: true; from: 0; to: 1; value: appController.apiProgress; indeterminate: appController.apiRunning && appController.apiProgress < 0.03 }
                                            Text { Layout.fillWidth: true; text: window.localizedBackendText(appController.apiStatus); color: window.muted; font.family: "Open Sans"; font.pixelSize: 10; wrapMode: Text.Wrap; maximumLineCount: 2; elide: Text.ElideRight }
                                        }
                                    }
                                }
                            }

                            VoiceCreditsPanel {
                                Layout.fillWidth: true
                                Layout.fillHeight: true
                                localizer: root.window
                                voiceCreditsLocale: root.voiceCreditsLocale
                                onVoiceLocaleSelected: function(locale) { root.voiceCreditsLocale = locale }
                            }
                            }
                        }
                    }

                    Loader {
                        anchors.fill: parent
                        active: false
                        asynchronous: false
                        sourceComponent: Component {
                            Flickable {
                                anchors.fill: parent
                                clip: true
                                contentWidth: width
                                contentHeight: connectionsColumn.implicitHeight
                                boundsBehavior: Flickable.StopAtBounds
                                ScrollBar.vertical: ScrollBar {
                                    policy: contentHeight > height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                                }

                                ColumnLayout {
                                    id: connectionsColumn
                                    width: parent.width - (parent.contentHeight > parent.height ? 10 : 0)
                                    spacing: 12

                        Text { text: ui.obs_overlay; color: window.orange; font.family: "Rajdhani"; font.pixelSize: 19; font.bold: true }
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: root.overlayAdvanced ? 526 : 394
                            color: "#0a1d30"
                            border.color: appController.overlayEnabled ? window.cyan : window.line
                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 14
                                spacing: 8
                                Text { Layout.fillWidth: true; text: ui.obs_overlay_help; color: window.text; font.family: "Open Sans"; font.pixelSize: 11; wrapMode: Text.Wrap }
                                ToggleRow { Layout.fillWidth: true; text: ui.overlay_enabled; checkedValue: appController.overlayEnabled; activeColor: window.cyan; onClicked: appController.setBoolSetting("overlay", !appController.overlayEnabled) }
                                RowLayout {
                                    Layout.fillWidth: true
                                    Text {
                                        Layout.fillWidth: true
                                        text: root.catalogText("ORDEN DE FICHAS", "CARD ORDER")
                                        color: window.text
                                        font.family: "Rajdhani"
                                        font.bold: true
                                    }
                                    OWButton {
                                        Layout.preferredWidth: 132
                                        Layout.preferredHeight: 34
                                        text: root.catalogText("HORIZONTAL", "HORIZONTAL")
                                        selected: appController.overlayOrientation === "horizontal"
                                        onClicked: appController.setTextSetting("overlay_orientation", "horizontal")
                                    }
                                    OWButton {
                                        Layout.preferredWidth: 132
                                        Layout.preferredHeight: 34
                                        text: root.catalogText("VERTICAL", "VERTICAL")
                                        selected: appController.overlayOrientation === "vertical"
                                        onClicked: appController.setTextSetting("overlay_orientation", "vertical")
                                    }
                                }
                                GridLayout {
                                    Layout.fillWidth: true
                                    columns: 2
                                    columnSpacing: 8
                                    rowSpacing: 8
                                    Repeater {
                                        model: root.overlayAdvanced ? [
                                            { id: "size", label: root.catalogText("TAMAÑO", "SIZE"), value: appController.overlayCardSize + " px" },
                                            { id: "opacity", label: root.catalogText("OPACIDAD", "OPACITY"), value: appController.overlayOpacity + "%" },
                                            { id: "spacing", label: root.catalogText("SEPARACIÓN", "GAP"), value: appController.overlaySpacing + " px" },
                                            { id: "columns", label: root.catalogText("COLUMNAS", "COLUMNS"), value: appController.overlayColumns === 0 ? "AUTO" : appController.overlayColumns }
                                        ] : [
                                            { id: "size", label: root.catalogText("TAMAÑO DE FICHA", "CARD SIZE"), value: appController.overlayCardSize + " px" }
                                        ]
                                        delegate: Rectangle {
                                            required property var modelData
                                            Layout.fillWidth: true
                                            Layout.preferredHeight: 82
                                            color: "#071521"
                                            border.color: window.line
                                            ColumnLayout {
                                                anchors.fill: parent
                                                anchors.margins: 8
                                                spacing: 4
                                                RowLayout {
                                                    Layout.fillWidth: true
                                                    Text { Layout.fillWidth: true; text: modelData.label; color: window.muted; font.family: "Rajdhani"; font.bold: true }
                                                    Text { text: modelData.value; color: window.orange; font.family: "Rajdhani"; font.bold: true }
                                                }
                                                RowLayout {
                                                    Layout.fillWidth: true
                                                    spacing: 5
                                                    OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: "−"; onClicked: root.adjustOverlay(modelData.id, -1) }
                                                    OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: "+"; onClicked: root.adjustOverlay(modelData.id, 1) }
                                                }
                                            }
                                        }
                                    }
                                }
                                RowLayout {
                                    Layout.fillWidth: true
                                    visible: root.overlayAdvanced
                                    ToggleRow { Layout.fillWidth: true; text: "Mostrar nombres"; checkedValue: appController.overlayShowNames; onClicked: appController.setBoolSetting("overlay_names", !appController.overlayShowNames) }
                                    ToggleRow { Layout.fillWidth: true; text: "Mostrar detalles"; checkedValue: appController.overlayShowDetails; onClicked: appController.setBoolSetting("overlay_details", !appController.overlayShowDetails) }
                                }
                                RowLayout {
                                    Layout.fillWidth: true
                                    spacing: 6
                                    OWButton {
                                        Layout.fillWidth: true
                                        Layout.preferredHeight: 34
                                        text: root.catalogText("REUBICAR", "RESET POSITION")
                                        onClicked: window.resetOverlayPosition()
                                    }
                                    OWButton {
                                        Layout.fillWidth: true
                                        Layout.preferredHeight: 34
                                        text: root.catalogText("TAMAÑO NORMAL", "RESET SIZE")
                                        onClicked: appController.setOverlayCardSize(160)
                                    }
                                    OWButton {
                                        Layout.fillWidth: true
                                        Layout.preferredHeight: 34
                                        text: root.overlayAdvanced
                                              ? root.catalogText("MENOS OPCIONES", "FEWER OPTIONS")
                                              : root.catalogText("MÁS OPCIONES", "MORE OPTIONS")
                                        selected: root.overlayAdvanced
                                        onClicked: root.overlayAdvanced = !root.overlayAdvanced
                                    }
                                }
                                OWButton {
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 34
                                    visible: root.overlayAdvanced
                                    text: root.catalogText("RESTAURAR TODO EL OVERLAY", "RESET ALL OVERLAY SETTINGS")
                                    onClicked: {
                                        appController.resetOverlayLayout()
                                        Qt.callLater(window.resetOverlayPosition)
                                    }
                                }
                                Text { Layout.fillWidth: true; text: ui.overlay_hint; color: window.muted; font.family: "Open Sans"; font.pixelSize: 10; wrapMode: Text.Wrap }
                            }
                        }

                        Text { text: ui.twitch; color: "#a783ff"; font.family: "Rajdhani"; font.pixelSize: 19; font.bold: true }
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 350
                            color: "#0a1d30"
                            border.color: "#6545a4"
                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 14
                                spacing: 8
                                RowLayout {
                                    Layout.fillWidth: true
                                    Text {
                                        Layout.fillWidth: true
                                        text: root.catalogText("CONTROL POR CHAT", "CHAT CONTROL")
                                        color: window.text
                                        font.family: "Rajdhani"
                                        font.pixelSize: 16
                                        font.bold: true
                                    }
                                    Rectangle {
                                        Layout.preferredWidth: 132
                                        Layout.preferredHeight: 26
                                        color: "#302248"
                                        border.color: "#9146ff"
                                        Text {
                                            anchors.centerIn: parent
                                            text: root.catalogText("NO CONECTADO", "NOT CONNECTED")
                                            color: "#c9adff"
                                            font.family: "Rajdhani"
                                            font.pixelSize: 10
                                            font.bold: true
                                        }
                                    }
                                }
                                Text {
                                    Layout.fillWidth: true
                                    text: root.catalogText(
                                        "Vista previa de la integración. OverRoll no inicia sesión, no lee el chat y no guarda contraseñas. El canal y el comando solo quedan preparados localmente.",
                                        "Integration preview. OverRoll does not sign in, read chat, or store passwords. Channel and command are only prepared locally.")
                                    color: window.muted
                                    font.family: "Open Sans"
                                    font.pixelSize: 10
                                    wrapMode: Text.Wrap
                                }
                                RowLayout {
                                    Layout.fillWidth: true
                                    spacing: 8
                                    TextField {
                                        Layout.fillWidth: true; Layout.preferredHeight: 38
                                        text: appController.twitchChannel
                                        placeholderText: ui.twitch_channel
                                        color: window.text
                                        background: Rectangle { color: "#071521"; border.color: window.line }
                                        onEditingFinished: appController.setTextSetting("twitch_channel", text)
                                    }
                                    TextField {
                                        Layout.fillWidth: true; Layout.preferredHeight: 38
                                        text: appController.twitchCommand
                                        placeholderText: ui.twitch_command
                                        color: window.text
                                        background: Rectangle { color: "#071521"; border.color: window.line }
                                        onEditingFinished: appController.setTextSetting("twitch_command", text)
                                    }
                                }
                                Rectangle {
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 70
                                    color: "#071521"
                                    border.color: window.line
                                    ColumnLayout {
                                        anchors.fill: parent
                                        anchors.margins: 9
                                        Text {
                                            Layout.fillWidth: true
                                            text: root.catalogText(
                                                "CUANDO ESTÉ DISPONIBLE: conectar con OAuth oficial > confirmar canal > activar comando > desconectar al cerrar OverRoll.",
                                                "WHEN AVAILABLE: connect with official OAuth > confirm channel > enable command > disconnect when OverRoll closes.")
                                            color: window.text
                                            font.family: "Rajdhani"
                                            font.pixelSize: 11
                                            font.bold: true
                                            wrapMode: Text.Wrap
                                        }
                                    }
                                }
                                OWButton { Layout.fillWidth: true; Layout.preferredHeight: 42; text: ui.twitch_oauth; enabled: false; activeColor: "#9146ff" }
                            }
                        }
                                    Item { Layout.preferredHeight: 8 }
                                }
                            }
                        }
                    }

                    Loader {
                        anchors.fill: parent
                        active: root.section === "connections"
                        asynchronous: false
                        sourceComponent: Component {
                            SettingsConnections { localizer: root.window }
                        }
                    }

                    Loader {
                        anchors.fill: parent
                        active: root.section === "otherHs"
                        asynchronous: false
                        sourceComponent: Component {
                            ColumnLayout {
                                anchors.fill: parent
                                spacing: 10

                        Text {
                            text: ui.other_hs_title
                            color: window.orange
                            font.family: "Rajdhani"
                            font.pixelSize: 21
                            font.bold: true
                        }
                        Text {
                            Layout.fillWidth: true
                            text: root.catalogIntro()
                            color: window.muted
                            font.family: "Open Sans"
                            font.pixelSize: 10
                            wrapMode: Text.Wrap
                        }

                        GridView {
                            id: otherHsGrid
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            property int columns: width >= 900 ? 2 : 1
                            model: moduleManager.games
                            cellWidth: width / columns
                            cellHeight: 190
                            clip: true
                            boundsBehavior: Flickable.StopAtBounds
                            ScrollBar.vertical: ScrollBar {
                                policy: otherHsGrid.contentHeight > otherHsGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                            }

                            delegate: Rectangle {
                                required property var modelData
                                property bool catalogAvailable: modelData.available === true
                                property bool catalogActive: moduleManager.activeGame === modelData.game_id
                                width: otherHsGrid.cellWidth - 8
                                height: otherHsGrid.cellHeight - 8
                                x: 4
                                y: 4
                                color: catalogAvailable ? "#0a1d30" : "#0b1520"
                                border.color: catalogAvailable ? modelData.accent : "#344452"
                                border.width: 1
                                radius: 3

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 12
                                    spacing: 5

                                    RowLayout {
                                        Layout.fillWidth: true
                                        Text {
                                            Layout.fillWidth: true
                                            text: modelData.name
                                            color: catalogAvailable ? window.text : "#748593"
                                            font.family: "Rajdhani"
                                            font.pixelSize: 17
                                            font.bold: true
                                            elide: Text.ElideRight
                                        }
                                        Rectangle {
                                            Layout.preferredWidth: statusText.implicitWidth + 16
                                            Layout.preferredHeight: 24
                                            color: catalogAvailable ? modelData.accent : "#53616d"
                                            radius: 2
                                            Text {
                                                id: statusText
                                                anchors.centerIn: parent
                                                text: modelData.status
                                                color: "#07111c"
                                                font.family: "Rajdhani"
                                                font.pixelSize: 9
                                                font.bold: true
                                            }
                                        }
                                    }
                                    Text {
                                        text: modelData.source
                                        color: catalogAvailable ? modelData.accent : "#657684"
                                        font.family: "Rajdhani"
                                        font.pixelSize: 10
                                        font.bold: true
                                    }
                                    Text {
                                        Layout.fillWidth: true
                                        Layout.fillHeight: true
                                        text: modelData.description
                                        color: catalogAvailable ? window.muted : "#657684"
                                        font.family: "Open Sans"
                                        font.pixelSize: 10
                                        wrapMode: Text.Wrap
                                        maximumLineCount: 5
                                        elide: Text.ElideRight
                                    }
                                    OWButton {
                                        Layout.fillWidth: true
                                        Layout.preferredHeight: 30
                                        text: catalogAvailable
                                              ? (catalogActive
                                                 ? root.catalogText("CATÁLOGO ACTIVO", "ACTIVE CATALOG")
                                                 : root.catalogText("USAR CATÁLOGO", "USE CATALOG"))
                                              : root.catalogText("NO DISPONIBLE", "NOT AVAILABLE")
                                        selected: catalogActive
                                        enabled: catalogAvailable && !catalogActive
                                        activeColor: catalogAvailable ? modelData.accent : "#53616d"
                                        onClicked: {
                                            if (moduleManager.activate(modelData.game_id))
                                                window.navigatePage("result")
                                        }
                                    }
                                }
                            }
                            }
                        }
                    }

                    Loader {
                        anchors.fill: parent
                        active: root.section === "secrets"
                        asynchronous: false
                        sourceComponent: Component {
                            Flickable {
                                id: secretsScroll
                                anchors.fill: parent
                                clip: true
                                contentWidth: width
                                contentHeight: secretsColumn.implicitHeight
                                boundsBehavior: Flickable.StopAtBounds
                                ScrollBar.vertical: ScrollBar {
                                    policy: secretsScroll.contentHeight > secretsScroll.height
                                            ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                                }

                                Column {
                                    id: secretsColumn
                                    width: secretsScroll.width - (secretsScroll.contentHeight > secretsScroll.height ? 10 : 0)
                                    spacing: 12

                                    Text {
                                        width: parent.width
                                        text: root.catalogText("SECRETOS", "SECRETS", "SEGREDOS", "SECRETS", "GEHEIMNISSE", "シークレット", "비밀")
                                        color: window.orange
                                        font.family: "Rajdhani"
                                        font.pixelSize: 20
                                        font.bold: true
                                    }

                                    Rectangle {
                                        width: parent.width
                                        height: 190
                                        visible: appController.secretDps78Unlocked
                                        color: "#0a1d30"
                                        border.color: appController.secretDps78Unlocked ? "#ff5b69" : window.line
                                        border.width: 1

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 14
                                            spacing: 9
                                            Text {
                                                text: "DPS78"
                                                color: appController.secretDps78Unlocked ? "#ff5b69" : window.muted
                                                font.family: "Rajdhani"
                                                font.pixelSize: 22
                                                font.bold: true
                                            }
                                            Text {
                                                Layout.fillWidth: true
                                                text: appController.secretDps78Unlocked
                                                      ? root.catalogText(
                                                            "Desbloqueado. Sustituye temporalmente los retratos de héroes de Daño de Overwatch.",
                                                            "Unlocked. Temporarily replaces Overwatch Damage hero portraits.")
                                                      : root.catalogText(
                                                            "Bloqueado. Escribe DPS78 en cualquier pantalla para revelarlo.",
                                                            "Locked. Type DPS78 on any screen to reveal it.")
                                                color: window.text
                                                font.family: "Open Sans"
                                                font.pixelSize: 11
                                                wrapMode: Text.Wrap
                                            }
                                            ToggleRow {
                                                Layout.fillWidth: true
                                                enabled: appController.secretDps78Unlocked
                                                text: root.catalogText("RETRATOS DPS78", "DPS78 PORTRAITS")
                                                checkedValue: appController.secretDps78Enabled
                                                activeColor: "#ff5b69"
                                                onClicked: appController.setSecretDps78Enabled(!appController.secretDps78Enabled)
                                            }
                                        }
                                    }

                                    Rectangle {
                                        width: parent.width
                                        height: 190
                                        visible: appController.secretFroggerUnlocked
                                        color: "#0a1d30"
                                        border.color: "#66e3b4"
                                        border.width: 1

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 14
                                            spacing: 9
                                            Text {
                                                text: "FROGGER"
                                                color: "#66e3b4"
                                                font.family: "Rajdhani"
                                                font.pixelSize: 22
                                                font.bold: true
                                            }
                                            Text {
                                                Layout.fillWidth: true
                                                text: root.catalogText(
                                                    "Desbloqueado. Sustituye temporalmente solo el retrato de Lucio.",
                                                    "Unlocked. Temporarily replaces only Lucio's portrait.")
                                                color: window.text
                                                font.family: "Open Sans"
                                                font.pixelSize: 11
                                                wrapMode: Text.Wrap
                                            }
                                            ToggleRow {
                                                Layout.fillWidth: true
                                                text: root.catalogText("RETRATO FROGGER", "FROGGER PORTRAIT")
                                                checkedValue: appController.secretFroggerEnabled
                                                activeColor: "#66e3b4"
                                                onClicked: appController.setSecretFroggerEnabled(!appController.secretFroggerEnabled)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Loader {
                        anchors.fill: parent
                        active: root.section === "credits"
                        asynchronous: false
                        sourceComponent: Component {
                            Flickable {
                                id: creditsScroll
                                anchors.fill: parent
                                clip: true
                                contentWidth: width
                                contentHeight: creditsColumn.implicitHeight
                                boundsBehavior: Flickable.StopAtBounds
                                ScrollBar.vertical: ScrollBar { policy: creditsScroll.contentHeight > creditsScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
                                Column {
                                    id: creditsColumn
                                    width: creditsScroll.width - (creditsScroll.contentHeight > creditsScroll.height ? 10 : 0)
                                    spacing: 12
                            Text { text: ui.credits; color: window.orange; font.family: "Rajdhani"; font.pixelSize: 19; font.bold: true }
                            Text {
                                width: parent.width
                                text: root.catalogText(
                                    "Fuentes y autoría, separadas por tema para que puedas encontrar lo importante sin leer una pared de texto.",
                                    "Sources and authorship, grouped by topic so you can find what matters without reading a wall of text.")
                                color: window.muted
                                font.family: "Open Sans"
                                font.pixelSize: 11
                                wrapMode: Text.Wrap
                            }
                            GridLayout {
                                width: parent.width
                                columns: width >= 760 ? 2 : 1
                                columnSpacing: 8
                                rowSpacing: 8
                                Repeater {
                                    model: root.creditGroups
                                    delegate: Rectangle {
                                        required property var modelData
                                        Layout.fillWidth: true
                                        Layout.preferredHeight: 88
                                        color: "#0a1d30"
                                        border.color: modelData.color
                                        border.width: 1
                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 10
                                            spacing: 4
                                            Text {
                                                Layout.fillWidth: true
                                                text: modelData.title
                                                color: modelData.color
                                                font.family: "Rajdhani"
                                                font.pixelSize: 13
                                                font.bold: true
                                                elide: Text.ElideRight
                                            }
                                            Text {
                                                Layout.fillWidth: true
                                                Layout.fillHeight: true
                                                text: modelData.body
                                                color: window.text
                                                font.family: "Open Sans"
                                                font.pixelSize: 10
                                                wrapMode: Text.Wrap
                                                maximumLineCount: 3
                                                elide: Text.ElideRight
                                            }
                                        }
                                    }
                                }
                            }
                            RowLayout {
                                width: parent.width
                                spacing: 10
                                Rectangle {
                                    Layout.preferredWidth: 190
                                    Layout.preferredHeight: 106
                                    color: "#0b1e31"
                                    border.color: window.line
                                    clip: true
                                    AnimatedImage {
                                        anchors.centerIn: parent
                                        width: 176
                                        height: 96
                                        source: root.section === "credits"
                                                ? appController.assetUrl("data/assets/hammond_credits.gif")
                                                : ""
                                        sourceSize.width: 176
                                        sourceSize.height: 96
                                        fillMode: Image.PreserveAspectFit
                                        playing: root.section === "credits" && root.visible
                                        cache: false
                                        asynchronous: true
                                    }
                                }
                                ColumnLayout {
                                    Layout.fillWidth: true
                                    Text {
                                        Layout.fillWidth: true
                                        text: ui.credits_legal
                                        color: window.muted
                                        font.family: "Open Sans"
                                        font.pixelSize: 10
                                        wrapMode: Text.Wrap
                                    }
                                    Text {
                                        Layout.fillWidth: true
                                        text: window.creditsJoke()
                                        color: compactSharkMouse.containsMouse ? window.cyan : window.orange
                                        font.family: "Rajdhani"
                                        font.bold: true
                                        font.underline: compactSharkMouse.containsMouse
                                        MouseArea {
                                            id: compactSharkMouse
                                            anchors.fill: parent
                                            hoverEnabled: true
                                            cursorShape: Qt.PointingHandCursor
                                            onClicked: Qt.openUrlExternally(window.creditsUrl())
                                        }
                                    }
                                }
                            }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
}
}
