pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    objectName: "rivalsGamePage"
    property var window: ApplicationWindow.window
    property string filterSlotId: ""
    property bool rouletteMode: false
    readonly property color accent: "#ffd34e"

    function blockedFor(slotId) {
        var rows = moduleManager.activeSlots
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].id === slotId) return rows[i].blocked || []
        return []
    }

    function roleLabel(role) {
        return role === "vanguard" ? "VANGUARDIA"
             : role === "duelist" ? "DUELISTA"
             : role === "strategist" ? "ESTRATEGA" : "MULTIROL"
    }

    function roleColor(role) {
        return role === "vanguard" ? "#42c8ff"
             : role === "duelist" ? "#ff5b69"
             : role === "strategist" ? "#5ce1a2" : "#ffd34e"
    }

    function roleIcon(role) {
        return appController.assetUrl("data/assets/games/rivals/ui/" + role + ".png")
    }

    function hasHero(heroKey) {
        var rows = moduleManager.activeSlots
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].hero && rows[i].hero.key === heroKey) return true
        return false
    }

    function heroByKey(heroKey) {
        var rows = moduleManager.activeCatalog
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].key === heroKey) return rows[i]
        return null
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10

        Rectangle {
            id: commandRail
            Layout.preferredWidth: 326
            Layout.fillHeight: true
            visible: !root.rouletteMode
            color: window.panel
            border.color: window.line

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 8

                Text {
                    text: "PREPARAR PARTIDA"
                    color: root.accent
                    font.family: "Rajdhani"
                    font.pixelSize: 15
                    font.bold: true
                }

                Flickable {
                    id: railScroll
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    contentWidth: width
                    contentHeight: railColumn.implicitHeight
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds
                    ScrollBar.vertical: ScrollBar {
                        policy: railScroll.contentHeight > railScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                    }

                    Column {
                        id: railColumn
                        width: railScroll.width - (railScroll.contentHeight > railScroll.height ? 10 : 0)
                        spacing: 8

                        SectionPanel {
                            width: parent.width
                            height: 106
                            title: "FORMATO"
                            subtitle: "Equipo de hasta 6 jugadores o ruleta independiente."
                            RowLayout {
                                anchors.fill: parent
                                spacing: 5
                                OWButton {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    text: "EQUIPO"
                                    selected: !root.rouletteMode
                                    activeColor: root.accent
                                    onClicked: root.rouletteMode = false
                                }
                                OWButton {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    text: "RULETA"
                                    selected: root.rouletteMode
                                    activeColor: root.accent
                                    onClicked: {
                                        root.filterSlotId = ""
                                        root.rouletteMode = true
                                    }
                                }
                            }
                        }

                        ProfileModePanel {
                            width: parent.width
                            accent: root.accent
                        }

                        SectionPanel {
                            width: parent.width
                            height: 426
                            visible: !root.rouletteMode
                            title: "ESCUADRA"
                            subtitle: "Nombre, perfil y roles permitidos por jugador."

                            ColumnLayout {
                                anchors.fill: parent
                                spacing: 6

                                RowLayout {
                                    Layout.fillWidth: true
                                    spacing: 5
                                    OWButton {
                                        Layout.preferredWidth: 52
                                        text: "−"
                                        enabled: moduleManager.activeSlots.length > 1
                                        onClicked: moduleManager.adjustPlayerCount(-1)
                                    }
                                    Text {
                                        Layout.fillWidth: true
                                        text: moduleManager.activeSlots.length + " jugadores"
                                        color: window.text
                                        font.family: "Rajdhani"
                                        font.bold: true
                                        horizontalAlignment: Text.AlignHCenter
                                    }
                                    OWButton {
                                        Layout.preferredWidth: 52
                                        text: "+"
                                        enabled: moduleManager.activeSlots.length < 6
                                        onClicked: moduleManager.adjustPlayerCount(1)
                                    }
                                }

                                ListView {
                                    id: rivalsSquadList
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    model: moduleManager.activeSlotModel
                                    spacing: 5
                                    clip: true
                                    boundsBehavior: Flickable.StopAtBounds
                                    ScrollBar.vertical: ScrollBar {
                                        policy: rivalsSquadList.contentHeight > rivalsSquadList.height
                                                ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                                    }
                                    delegate: ModulePlayerRow {
                                        required property var modelData
                                        width: rivalsSquadList.width
                                               - (rivalsSquadList.contentHeight > rivalsSquadList.height ? 10 : 0)
                                        playerIndex: modelData.slotIndex !== undefined ? modelData.slotIndex : 0
                                        slotData: modelData
                                        controller: appController
                                        manager: moduleManager
                                        accent: root.accent
                                        optionTitle: "ROLES"
                                        roleOptions: [
                                            {
                                                label: "V",
                                                tooltip: "Vanguardia",
                                                color: root.roleColor("vanguard"),
                                                iconSource: root.roleIcon("vanguard"),
                                                active: (modelData.roles || []).indexOf("vanguard") >= 0,
                                                action: function() { moduleManager.toggleSlotRole(modelData.id, "vanguard") }
                                            },
                                            {
                                                label: "D",
                                                tooltip: "Duelista",
                                                color: root.roleColor("duelist"),
                                                iconSource: root.roleIcon("duelist"),
                                                active: (modelData.roles || []).indexOf("duelist") >= 0,
                                                action: function() { moduleManager.toggleSlotRole(modelData.id, "duelist") }
                                            },
                                            {
                                                label: "E",
                                                tooltip: "Estratega",
                                                color: root.roleColor("strategist"),
                                                iconSource: root.roleIcon("strategist"),
                                                active: (modelData.roles || []).indexOf("strategist") >= 0,
                                                action: function() { moduleManager.toggleSlotRole(modelData.id, "strategist") }
                                            },
                                            {
                                                label: "M",
                                                tooltip: "Multirol",
                                                color: root.roleColor("flex"),
                                                iconSource: "",
                                                active: (modelData.roles || []).indexOf("flex") >= 0,
                                                action: function() { moduleManager.toggleSlotRole(modelData.id, "flex") }
                                            }
                                        ]
                                    }
                                }
                            }
                        }

                        SectionPanel {
                            width: parent.width
                            height: 255
                            visible: !root.rouletteMode
                            title: "REGLAS"
                            Column {
                                anchors.fill: parent
                                spacing: 5
                                ToggleRow {
                                    width: parent.width
                                    text: "Evitar héroes repetidos"
                                    checkedValue: !moduleManager.allowDuplicates
                                    activeColor: root.accent
                                    onClicked: moduleManager.setAllowDuplicates(!moduleManager.allowDuplicates)
                                }
                                ToggleRow {
                                    width: parent.width
                                    text: "Composición de roles"
                                    checkedValue: moduleManager.rivalsRoleComposition
                                    activeColor: root.accent
                                    onClicked: moduleManager.setRivalsRoleComposition(!moduleManager.rivalsRoleComposition)
                                }
                                ToggleRow {
                                    width: parent.width
                                    text: "Solo rol"
                                    checkedValue: moduleManager.rivalsRolesOnly
                                    activeColor: root.accent
                                    onClicked: moduleManager.setRivalsRolesOnly(!moduleManager.rivalsRolesOnly)
                                }
                                ToggleRow {
                                    width: parent.width
                                    text: "Usar Team-Ups"
                                    checkedValue: moduleManager.useTeamups
                                    activeColor: root.accent
                                    onClicked: moduleManager.setUseTeamups(!moduleManager.useTeamups)
                                }
                            }
                        }

                        OWButton {
                            width: parent.width
                            height: 38
                            visible: !root.rouletteMode
                            text: "GENERAR IMAGEN"
                            onClicked: rivalsResultSurface.grabToImage(function(grab) {
                                appController.copyResultImage(grab.image, rivalsResultSurface.height)
                            })
                        }
                    }
                }

                OWButton {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 54
                    visible: !root.rouletteMode
                    text: "GENERAR EQUIPO"
                    selected: true
                    activeColor: root.accent
                    onClicked: {
                        appController.playUiSound("click")
                        moduleManager.generate(moduleManager.useTeamups ? "teamups" : "all")
                    }
                }
            }
        }

        ColumnLayout {
            id: rivalsResultSurface
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: !root.rouletteMode
            spacing: 8

            RowLayout {
                Layout.fillWidth: true
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 0
                    Text {
                        text: "MARVEL RIVALS"
                        color: root.accent
                        font.family: "Rajdhani"
                        font.pixelSize: 27
                        font.bold: true
                    }
                    Text {
                        text: "CATÁLOGO LOCAL · " + moduleManager.activeSlots.length
                              + " JUGADORES · EL TEAM-UP SE ELIGE EN CADA FICHA"
                        color: window.muted
                        font.pixelSize: 10
                    }
                }
            }

            GridView {
                id: rivalsSlots
                Layout.fillWidth: true
                Layout.fillHeight: true
                property int columns: Math.max(1, Math.min(count, Math.floor(width / 224)))
                cellWidth: width / Math.max(1, columns)
                cellHeight: 474
                model: moduleManager.activeSlotModel
                clip: true
                reuseItems: true
                boundsBehavior: Flickable.StopAtBounds
                ScrollBar.vertical: ScrollBar {
                    policy: rivalsSlots.contentHeight > rivalsSlots.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                }

                delegate: Rectangle {
                    id: rivalsCard
                    required property var modelData
                    property var slotData: modelData
                    property string heroKey: modelData.hero ? modelData.hero.key : ""
                    width: rivalsSlots.cellWidth - 9
                    height: rivalsSlots.cellHeight - 8
                    x: 4
                    y: 4
                    color: "#081725"
                    border.color: modelData.locked ? root.accent
                                  : modelData.hero ? root.roleColor(modelData.hero.role) : window.line
                    border.width: modelData.locked ? 3 : 2

                    onHeroKeyChanged: if (heroKey.length && appController.animationsEnabled && appController.performanceMode !== "low") rivalsReveal.restart()
                    ParallelAnimation {
                        id: rivalsReveal
                        NumberAnimation { target: rivalsCard; property: "opacity"; from: 0.72; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                        NumberAnimation { target: rivalsCard; property: "scale"; from: 0.985; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                    }

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 9
                        spacing: 6

                        Text {
                            Layout.fillWidth: true
                            text: modelData.name
                            color: modelData.profileName ? root.accent : window.muted
                            horizontalAlignment: Text.AlignHCenter
                            elide: Text.ElideRight
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: visible ? 238 : 0
                            visible: moduleManager.rivalsRolesOnly
                            color: "#0b2032"
                            border.color: modelData.hero ? root.roleColor(modelData.hero.role) : window.line
                            ColumnLayout {
                                anchors.centerIn: parent
                                width: parent.width - 24
                                spacing: 12
                                Image {
                                    Layout.alignment: Qt.AlignHCenter
                                    Layout.preferredWidth: 118
                                    Layout.preferredHeight: 118
                                    source: modelData.hero ? root.roleIcon(modelData.hero.role) : ""
                                    fillMode: Image.PreserveAspectFit
                                }
                                Text {
                                    Layout.fillWidth: true
                                    text: modelData.hero ? root.roleLabel(modelData.hero.role).toUpperCase() : "SIN ROL"
                                    color: modelData.hero ? root.roleColor(modelData.hero.role) : window.muted
                                    font.family: "Rajdhani"
                                    font.pixelSize: 25
                                    font.bold: true
                                    horizontalAlignment: Text.AlignHCenter
                                }
                            }
                        }

                        Rectangle {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: Math.min(170, parent.width - 18)
                            Layout.preferredHeight: visible ? Layout.preferredWidth : 0
                            visible: !moduleManager.rivalsRolesOnly
                            color: "#0b2032"
                            border.color: modelData.hero ? root.roleColor(modelData.hero.role) : window.line
                            Image {
                                anchors.fill: parent
                                anchors.margins: 2
                                source: modelData.hero
                                        ? modelData.hero.portrait
                                        : ""
                                sourceSize.width: 256
                                sourceSize.height: 256
                                fillMode: Image.PreserveAspectCrop
                                asynchronous: true
                                cache: appController.performanceMode === "high"
                            }
                        }

                        Text {
                            Layout.fillWidth: true
                            visible: !moduleManager.rivalsRolesOnly
                            text: modelData.hero ? String(modelData.hero.name).toUpperCase() : "SIN SELECCIÓN"
                            color: modelData.hero ? window.text : window.muted
                            font.family: "Rajdhani"
                            font.pixelSize: 20
                            font.bold: true
                            horizontalAlignment: Text.AlignHCenter
                            elide: Text.ElideRight
                        }

                        RowLayout {
                            Layout.alignment: Qt.AlignHCenter
                            visible: !moduleManager.rivalsRolesOnly
                            spacing: 5
                            Image {
                                Layout.preferredWidth: 19
                                Layout.preferredHeight: 19
                                source: modelData.hero ? root.roleIcon(modelData.hero.role) : ""
                                fillMode: Image.PreserveAspectFit
                            }
                            Text {
                                text: modelData.hero ? root.roleLabel(modelData.hero.role) : "HÉROE"
                                color: modelData.hero ? root.roleColor(modelData.hero.role) : window.muted
                                font.family: "Rajdhani"
                                font.pixelSize: 11
                                font.bold: true
                            }
                        }

                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 5
                            OWButton {
                                Layout.fillWidth: true
                                text: ""
                                iconSource: appController.assetUrl("data/assets/ui/reroll.png")
                                ToolTip.visible: hovered
                                ToolTip.text: "Cambiar héroe"
                                onClicked: moduleManager.reroll(modelData.id)
                            }
                            OWButton {
                                Layout.fillWidth: true
                                text: ""
                                iconSource: appController.assetUrl("data/assets/ui/filter.png")
                                ToolTip.visible: hovered
                                ToolTip.text: "Filtro"
                                onClicked: root.filterSlotId = modelData.id
                            }
                            OWButton {
                                Layout.fillWidth: true
                                text: ""
                                iconSource: appController.assetUrl(modelData.locked
                                            ? "data/assets/ui/unlock.png" : "data/assets/ui/lock.png")
                                selected: modelData.locked
                                activeColor: root.accent
                                ToolTip.visible: hovered
                                ToolTip.text: modelData.locked ? "Desbloquear" : "Bloquear"
                                onClicked: moduleManager.toggleLock(modelData.id)
                            }
                        }

                        Text {
                            Layout.fillWidth: true
                            visible: !moduleManager.rivalsRolesOnly && moduleManager.useTeamups
                            text: "TEAM-UP DEL PERSONAJE"
                            color: root.accent
                            font.family: "Rajdhani"
                            font.pixelSize: 9
                            font.bold: true
                        }

                        ColumnLayout {
                            Layout.fillWidth: true
                            visible: !moduleManager.rivalsRolesOnly && moduleManager.useTeamups
                            spacing: 4
                            Repeater {
                                model: rivalsCard.slotData.hero ? (rivalsCard.slotData.hero.teamups || []) : []
                                delegate: Button {
                                    id: teamupButton
                                    required property var modelData
                                    property var anchorHero: root.heroByKey(modelData.anchor)
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 42
                                    hoverEnabled: true
                                    onClicked: moduleManager.setSlotTeamup(rivalsCard.slotData.id, modelData.key)
                                    contentItem: RowLayout {
                                        spacing: 7
                                        Image {
                                            Layout.preferredWidth: 32
                                            Layout.preferredHeight: 32
                                            source: teamupButton.anchorHero ? teamupButton.anchorHero.portrait : ""
                                            sourceSize.width: 48
                                            sourceSize.height: 48
                                            fillMode: Image.PreserveAspectCrop
                                        }
                                        ColumnLayout {
                                            Layout.fillWidth: true
                                            spacing: 0
                                            Text {
                                                Layout.fillWidth: true
                                                text: teamupButton.modelData.name
                                                color: window.text
                                                font.family: "Rajdhani"
                                                font.pixelSize: 10
                                                font.bold: true
                                                elide: Text.ElideRight
                                            }
                                            Text {
                                                text: root.hasHero(teamupButton.modelData.anchor)
                                                      ? "ACTIVO CON " + (teamupButton.anchorHero ? teamupButton.anchorHero.name.toUpperCase() : "")
                                                      : "BASE · REQUIERE " + (teamupButton.anchorHero ? teamupButton.anchorHero.name.toUpperCase() : "COMPAÑERO")
                                                color: root.hasHero(teamupButton.modelData.anchor) ? "#5ce1a2" : window.muted
                                                font.pixelSize: 8
                                                elide: Text.ElideRight
                                            }
                                        }
                                    }
                                    background: Rectangle {
                                        color: teamupButton.hovered ? "#17364f" : "#0d2639"
                                        border.color: rivalsCard.slotData.teamupKey === teamupButton.modelData.key
                                                      ? root.accent : window.line
                                        border.width: rivalsCard.slotData.teamupKey === teamupButton.modelData.key ? 2 : 1
                                    }
                                }
                            }
                        }
                        Item { Layout.fillHeight: true }
                    }
                }
            }
        }

        Loader {
            Layout.fillWidth: true
            Layout.fillHeight: true
            active: root.rouletteMode
            visible: active
            sourceComponent: Component {
                RivalsRoulette { onExitRequested: root.rouletteMode = false }
            }
        }
    }

    GameFilterPanel {
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        width: Math.min(390, parent.width * 0.38)
        visible: !root.rouletteMode && root.filterSlotId.length > 0
        slotId: root.filterSlotId
        blocked: root.blockedFor(root.filterSlotId)
        accent: root.accent
        soundKind: "click"
        onCloseRequested: root.filterSlotId = ""
    }
}
