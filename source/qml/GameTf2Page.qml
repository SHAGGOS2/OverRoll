pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    objectName: "tf2GamePage"
    property var window: ApplicationWindow.window
    property string filterSlotId: ""
    property bool rouletteMode: false
    readonly property color accent: "#e8a45b"

    function blockedFor(slotId) {
        var rows = moduleManager.activeSlots
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].id === slotId) return rows[i].blocked || []
        return []
    }

    function roleLabel(role) {
        return role === "offense" ? "OFENSIVA"
             : role === "defense" ? "DEFENSA" : "APOYO"
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10

        Rectangle {
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
                    id: tf2RailScroll
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    contentWidth: width
                    contentHeight: tf2RailColumn.implicitHeight
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds
                    ScrollBar.vertical: ScrollBar {
                        policy: tf2RailScroll.contentHeight > tf2RailScroll.height
                                ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                    }

                    Column {
                        id: tf2RailColumn
                        width: tf2RailScroll.width - (tf2RailScroll.contentHeight > tf2RailScroll.height ? 10 : 0)
                        spacing: 8

                        SectionPanel {
                            width: parent.width
                            height: 106
                            title: "FORMATO"
                            subtitle: "Nueve clases oficiales; hasta 6 jugadores."
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
                            subtitle: "Nombre, perfil y grupos de clase permitidos."
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
                                        onClicked: {
                                            appController.playUiSound("tf2_click")
                                            moduleManager.adjustPlayerCount(-1)
                                        }
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
                                        onClicked: {
                                            appController.playUiSound("tf2_click")
                                            moduleManager.adjustPlayerCount(1)
                                        }
                                    }
                                }

                                ListView {
                                    id: tf2SquadList
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    model: moduleManager.activeSlotModel
                                    spacing: 5
                                    clip: true
                                    boundsBehavior: Flickable.StopAtBounds
                                    ScrollBar.vertical: ScrollBar {
                                        policy: tf2SquadList.contentHeight > tf2SquadList.height
                                                ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                                    }
                                    delegate: ModulePlayerRow {
                                        required property var modelData
                                        width: tf2SquadList.width
                                               - (tf2SquadList.contentHeight > tf2SquadList.height ? 10 : 0)
                                        playerIndex: modelData.slotIndex !== undefined ? modelData.slotIndex : 0
                                        slotData: modelData
                                        controller: appController
                                        manager: moduleManager
                                        accent: root.accent
                                        optionTitle: "CLASE"
                                        roleOptions: [
                                            {
                                                label: "OFENSIVA",
                                                tooltip: "Scout, Soldier y Pyro",
                                                color: "#e86448",
                                                iconSource: "",
                                                active: (modelData.roles || []).indexOf("offense") >= 0,
                                                action: function() { moduleManager.toggleSlotRole(modelData.id, "offense") }
                                            },
                                            {
                                                label: "DEFENSA",
                                                tooltip: "Demoman, Heavy y Engineer",
                                                color: root.accent,
                                                iconSource: "",
                                                active: (modelData.roles || []).indexOf("defense") >= 0,
                                                action: function() { moduleManager.toggleSlotRole(modelData.id, "defense") }
                                            },
                                            {
                                                label: "APOYO",
                                                tooltip: "Medic, Sniper y Spy",
                                                color: "#67b9d9",
                                                iconSource: "",
                                                active: (modelData.roles || []).indexOf("support") >= 0,
                                                action: function() { moduleManager.toggleSlotRole(modelData.id, "support") }
                                            }
                                        ]
                                    }
                                }
                            }
                        }

                        SectionPanel {
                            width: parent.width
                            height: 126
                            visible: !root.rouletteMode
                            title: "REGLAS"
                            Column {
                                anchors.fill: parent
                                spacing: 5
                                ToggleRow {
                                    width: parent.width
                                    text: "Evitar clases repetidas"
                                    checkedValue: !moduleManager.allowDuplicates
                                    activeColor: root.accent
                                    onClicked: {
                                        appController.playUiSound("tf2_click")
                                        moduleManager.setAllowDuplicates(!moduleManager.allowDuplicates)
                                    }
                                }
                            }
                        }

                        OWButton {
                            width: parent.width
                            height: 38
                            visible: !root.rouletteMode
                            text: "GENERAR IMAGEN"
                            onClicked: tf2ResultSurface.grabToImage(function(grab) {
                                appController.copyResultImage(grab.image, tf2ResultSurface.height)
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
                        appController.playUiSound("tf2_generate")
                        moduleManager.generate("all")
                    }
                }
            }
        }

        ColumnLayout {
            id: tf2ResultSurface
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: !root.rouletteMode
            spacing: 8

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0
                Text {
                    text: "TEAM FORTRESS 2"
                    color: root.accent
                    font.family: "Rajdhani"
                    font.pixelSize: 27
                    font.bold: true
                }
                Text {
                    text: "MERCENARIOS · " + moduleManager.activeSlots.length + " JUGADORES · 9 CLASES"
                    color: window.muted
                    font.pixelSize: 10
                }
            }

            GridView {
                id: tf2Slots
                Layout.fillWidth: true
                Layout.fillHeight: true
                property int columns: Math.max(1, Math.min(count, Math.floor(width / 224)))
                cellWidth: width / Math.max(1, columns)
                cellHeight: 438
                model: moduleManager.activeSlotModel
                clip: true
                reuseItems: true
                boundsBehavior: Flickable.StopAtBounds
                ScrollBar.vertical: ScrollBar {
                    policy: tf2Slots.contentHeight > tf2Slots.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                }

                delegate: Rectangle {
                    id: tf2Card
                    required property var modelData
                    property string heroKey: modelData.hero ? modelData.hero.key : ""
                    width: tf2Slots.cellWidth - 10
                    height: tf2Slots.cellHeight - 8
                    x: 5
                    y: 4
                    color: "#081725"
                    border.color: modelData.locked ? "#ffd166" : "#385b72"
                    border.width: modelData.locked ? 3 : 2

                    onHeroKeyChanged: if (heroKey.length && appController.animationsEnabled && appController.performanceMode !== "low") tf2Reveal.restart()
                    ParallelAnimation {
                        id: tf2Reveal
                        NumberAnimation { target: tf2Card; property: "opacity"; from: 0.72; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                        NumberAnimation { target: tf2Card; property: "scale"; from: 0.985; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                    }

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 10
                        spacing: 8

                        Text {
                            Layout.fillWidth: true
                            text: modelData.name
                            color: modelData.profileName ? root.accent : window.muted
                            horizontalAlignment: Text.AlignHCenter
                            elide: Text.ElideRight
                        }

                        Rectangle {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: Math.min(180, parent.width - 18)
                            Layout.preferredHeight: Layout.preferredWidth
                            color: "#0b2032"
                            border.color: root.accent
                            Image {
                                anchors.fill: parent
                                anchors.margins: 2
                                source: modelData.hero ? modelData.hero.portrait : ""
                                sourceSize.width: 256
                                sourceSize.height: 256
                                fillMode: Image.PreserveAspectCrop
                                asynchronous: true
                                cache: appController.performanceMode === "high"
                            }
                        }

                        Text {
                            Layout.fillWidth: true
                            text: modelData.hero ? String(modelData.hero.name).toUpperCase() : "SIN SELECCIÓN"
                            color: modelData.hero ? "#ffffff" : window.muted
                            font.family: "Rajdhani"
                            font.pixelSize: 22
                            font.bold: true
                            horizontalAlignment: Text.AlignHCenter
                            elide: Text.ElideRight
                        }

                        Text {
                            Layout.fillWidth: true
                            text: modelData.hero ? root.roleLabel(modelData.hero.role) : "MERCENARIO"
                            color: root.accent
                            font.family: "Rajdhani"
                            font.pixelSize: 11
                            font.bold: true
                            horizontalAlignment: Text.AlignHCenter
                        }

                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 5
                            OWButton {
                                Layout.fillWidth: true
                                text: ""
                                iconSource: appController.assetUrl("data/assets/ui/reroll.png")
                                ToolTip.visible: hovered
                                ToolTip.text: "Cambiar clase"
                                onClicked: {
                                    appController.playUiSound("tf2_reroll")
                                    moduleManager.reroll(modelData.id)
                                }
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

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 54
                            color: "#0d2639"
                            border.color: window.line
                            Text {
                                anchors.centerIn: parent
                                width: parent.width - 14
                                text: modelData.hero
                                      ? "GRUPO DE CLASE · " + root.roleLabel(modelData.hero.role)
                                      : "GENERA EL EQUIPO PARA ASIGNAR UNA CLASE"
                                color: modelData.hero ? root.accent : window.muted
                                font.family: "Rajdhani"
                                font.pixelSize: 10
                                font.bold: true
                                horizontalAlignment: Text.AlignHCenter
                                wrapMode: Text.Wrap
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
                Tf2Roulette { onExitRequested: root.rouletteMode = false }
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
        soundKind: "tf2_click"
        onCloseRequested: root.filterSlotId = ""
    }
}
