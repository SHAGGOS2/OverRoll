pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    objectName: "pvzGamePage"
    property var window: ApplicationWindow.window
    property string filterSlotId: ""
    property string filterSide: ""
    property bool rouletteMode: false
    readonly property color plantColor: "#75d66b"
    readonly property color zombieColor: "#a985dd"

    function blockedFor(slotId) {
        var rows = moduleManager.activeSlots
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].id === slotId) return rows[i].blocked || []
        return []
    }

    function sideCount(side) {
        var count = 0
        var rows = moduleManager.activeSlots
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].side === side) count++
        return count
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
                    color: root.plantColor
                    font.family: "Rajdhani"
                    font.pixelSize: 15
                    font.bold: true
                }

                Flickable {
                    id: pvzRailScroll
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    contentWidth: width
                    contentHeight: pvzRailColumn.implicitHeight
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds
                    ScrollBar.vertical: ScrollBar {
                        policy: pvzRailScroll.contentHeight > pvzRailScroll.height
                                ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                    }

                    Column {
                        id: pvzRailColumn
                        width: pvzRailScroll.width - (pvzRailScroll.contentHeight > pvzRailScroll.height ? 10 : 0)
                        spacing: 8

                        SectionPanel {
                            width: parent.width
                            height: 106
                            title: "FORMATO"
                            subtitle: "Escuadra de una facción o ruleta independiente."
                            RowLayout {
                                anchors.fill: parent
                                spacing: 5
                                OWButton {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    text: "EQUIPO"
                                    selected: !root.rouletteMode
                                    activeColor: root.plantColor
                                    onClicked: root.rouletteMode = false
                                }
                                OWButton {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    text: "RULETA"
                                    selected: root.rouletteMode
                                    activeColor: root.plantColor
                                    onClicked: {
                                        root.filterSlotId = ""
                                        root.rouletteMode = true
                                    }
                                }
                            }
                        }

                        ProfileModePanel {
                            width: parent.width
                            accent: root.plantColor
                            collectionMode: true
                        }

                        SectionPanel {
                            width: parent.width
                            height: 442
                            visible: !root.rouletteMode
                            title: "ESCUADRA"
                            subtitle: "Nombre, perfil y bando por jugador."
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
                                            appController.playUiSound("pvz_click")
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
                                        enabled: moduleManager.activeSlots.length < 8
                                        onClicked: {
                                            appController.playUiSound("pvz_click")
                                            moduleManager.adjustPlayerCount(1)
                                        }
                                    }
                                }

                                Text {
                                    Layout.fillWidth: true
                                    text: root.sideCount("plants") + " plantas · "
                                          + root.sideCount("zombies") + " zombis"
                                    color: window.muted
                                    font.pixelSize: 9
                                    horizontalAlignment: Text.AlignHCenter
                                }

                                ListView {
                                    id: pvzSquadList
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    model: moduleManager.activeSlotModel
                                    spacing: 5
                                    clip: true
                                    boundsBehavior: Flickable.StopAtBounds
                                    ScrollBar.vertical: ScrollBar {
                                        policy: pvzSquadList.contentHeight > pvzSquadList.height
                                                ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                                    }
                                    delegate: ModulePlayerRow {
                                        required property var modelData
                                        width: pvzSquadList.width
                                               - (pvzSquadList.contentHeight > pvzSquadList.height ? 10 : 0)
                                        playerIndex: modelData.slotIndex !== undefined ? modelData.slotIndex : 0
                                        slotData: modelData
                                        controller: appController
                                        manager: moduleManager
                                        accent: modelData.side === "plants" ? root.plantColor : root.zombieColor
                                        optionTitle: "BANDO"
                                        roleOptions: [
                                            {
                                                label: "PLANTAS",
                                                tooltip: "Este jugador recibirá una planta",
                                                color: root.plantColor,
                                                iconSource: "",
                                                active: modelData.side === "plants",
                                                action: function() { moduleManager.setSlotSide(modelData.id, "plants") }
                                            },
                                            {
                                                label: "ZOMBIS",
                                                tooltip: "Este jugador recibirá un zombi",
                                                color: root.zombieColor,
                                                iconSource: "",
                                                active: modelData.side === "zombies",
                                                action: function() { moduleManager.setSlotSide(modelData.id, "zombies") }
                                            }
                                        ]
                                    }
                                }
                            }
                        }

                        SectionPanel {
                            width: parent.width
                            height: 250
                            visible: !root.rouletteMode
                            title: "REGLAS"
                            Column {
                                anchors.fill: parent
                                spacing: 5
                                ToggleRow {
                                    width: parent.width
                                    text: "Evitar personajes repetidos"
                                    checkedValue: !moduleManager.allowDuplicates
                                    activeColor: root.plantColor
                                    onClicked: moduleManager.setAllowDuplicates(!moduleManager.allowDuplicates)
                                }
                                ToggleRow {
                                    width: parent.width
                                    text: "Usar variantes"
                                    checkedValue: moduleManager.useVariants
                                    activeColor: root.plantColor
                                    onClicked: moduleManager.setUseVariants(!moduleManager.useVariants)
                                }
                                ToggleRow {
                                    width: parent.width
                                    text: "Incluir personajes DLC"
                                    checkedValue: moduleManager.includeDlc
                                    activeColor: root.plantColor
                                    onClicked: moduleManager.setIncludeDlc(!moduleManager.includeDlc)
                                }
                                ToggleRow {
                                    width: parent.width
                                    text: "Permitir cambio de bando"
                                    checkedValue: moduleManager.sideSwitchEnabled
                                    activeColor: root.zombieColor
                                    onClicked: moduleManager.setSideSwitchEnabled(!moduleManager.sideSwitchEnabled)
                                }
                            }
                        }

                        OWButton {
                            width: parent.width
                            height: 38
                            visible: !root.rouletteMode
                            text: "GENERAR IMAGEN"
                            onClicked: pvzResultSurface.grabToImage(function(grab) {
                                appController.copyResultImage(grab.image, pvzResultSurface.height)
                            })
                        }
                    }
                }

                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 94
                    Layout.minimumHeight: 94
                    Layout.maximumHeight: 94
                    visible: !root.rouletteMode
                    spacing: 6
                    RowLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 6
                        OWButton {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            text: "GENERAR PLANTAS"
                            selected: true
                            activeColor: root.plantColor
                            onClicked: {
                                appController.playUiSound("pvz_generate")
                                moduleManager.generate("plants")
                            }
                        }
                        OWButton {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            text: "GENERAR ZOMBIS"
                            selected: true
                            activeColor: root.zombieColor
                            onClicked: {
                                appController.playUiSound("pvz_generate")
                                moduleManager.generate("zombies")
                            }
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        text: "GENERAR AMBOS"
                        activeColor: "#f6a21a"
                        onClicked: {
                            appController.playUiSound("pvz_generate")
                            moduleManager.generate("both")
                        }
                    }
                }
            }
        }

        Rectangle {
            id: pvzResultSurface
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: !root.rouletteMode
            color: "#071521"
            border.color: window.line

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 8

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 0
                    Text {
                        text: "PVZ GARDEN WARFARE 2"
                        color: root.sideCount("zombies") > root.sideCount("plants")
                               ? root.zombieColor : root.plantColor
                        font.family: "Rajdhani"
                        font.pixelSize: 27
                        font.bold: true
                    }
                    Text {
                        text: "RESULTADO · " + moduleManager.activeSlots.length + " JUGADORES · "
                              + root.sideCount("plants") + " PLANTAS · "
                              + root.sideCount("zombies") + " ZOMBIS"
                        color: window.muted
                        font.pixelSize: 10
                    }
                }

                GridView {
                    id: pvzResultGrid
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    property int columns: Math.max(1, Math.min(4, Math.floor(width / 270)))
                    property int rows: Math.max(1, Math.ceil(count / columns))
                    cellWidth: width / columns
                    cellHeight: Math.max(360, height / Math.min(rows, 2))
                    model: moduleManager.activeSlotModel
                    clip: true
                    reuseItems: true
                    boundsBehavior: Flickable.StopAtBounds
                    ScrollBar.vertical: ScrollBar {
                        policy: pvzResultGrid.contentHeight > pvzResultGrid.height
                                ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                    }

                    delegate: Rectangle {
                        id: pvzCard
                        required property var modelData
                        property string heroKey: modelData.hero ? modelData.hero.key : ""
                        property color sideColor: modelData.side === "plants"
                                                  ? root.plantColor : root.zombieColor
                        width: pvzResultGrid.cellWidth - 10
                        height: pvzResultGrid.cellHeight - 10
                        x: 5
                        y: 5
                        color: "#081725"
                        border.color: modelData.locked ? "#ffd166" : sideColor
                        border.width: modelData.locked ? 3 : 2

                        onHeroKeyChanged: if (heroKey.length && appController.animationsEnabled && appController.performanceMode !== "low") pvzReveal.restart()
                        ParallelAnimation {
                            id: pvzReveal
                            NumberAnimation { target: pvzCard; property: "opacity"; from: 0.72; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                            NumberAnimation { target: pvzCard; property: "scale"; from: 0.985; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                        }

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 9
                            spacing: 6

                            RowLayout {
                                Layout.fillWidth: true
                                Text {
                                    Layout.fillWidth: true
                                    text: modelData.name
                                    color: modelData.profileName ? pvzCard.sideColor : window.muted
                                    elide: Text.ElideRight
                                }
                                OWButton {
                                    Layout.preferredWidth: 34
                                    Layout.preferredHeight: 28
                                    text: ""
                                    iconSource: appController.assetUrl("data/assets/ui/reroll.png")
                                    ToolTip.visible: hovered
                                    ToolTip.text: "Cambiar personaje"
                                    onClicked: {
                                        appController.playUiSound("pvz_reroll")
                                        moduleManager.reroll(modelData.id)
                                    }
                                }
                                OWButton {
                                    Layout.preferredWidth: 34
                                    Layout.preferredHeight: 28
                                    text: ""
                                    iconSource: appController.assetUrl("data/assets/ui/filter.png")
                                    ToolTip.visible: hovered
                                    ToolTip.text: "Filtro"
                                    onClicked: {
                                        root.filterSlotId = modelData.id
                                        root.filterSide = modelData.side
                                    }
                                }
                                OWButton {
                                    Layout.preferredWidth: 34
                                    Layout.preferredHeight: 28
                                    text: ""
                                    iconSource: appController.assetUrl(modelData.locked
                                                ? "data/assets/ui/unlock.png" : "data/assets/ui/lock.png")
                                    selected: modelData.locked
                                    ToolTip.visible: hovered
                                    ToolTip.text: modelData.locked ? "Desbloquear" : "Bloquear"
                                    onClicked: moduleManager.toggleLock(modelData.id)
                                }
                            }

                            Image {
                                Layout.alignment: Qt.AlignHCenter
                                Layout.preferredWidth: Math.min(150, parent.width - 20)
                                Layout.preferredHeight: Layout.preferredWidth
                                source: modelData.hero
                                        ? modelData.hero.portrait
                                        : ""
                                sourceSize.width: 256
                                sourceSize.height: 256
                                fillMode: Image.PreserveAspectCrop
                                asynchronous: true
                                cache: appController.performanceMode === "high"
                            }

                            Text {
                                Layout.fillWidth: true
                                text: modelData.hero ? String(modelData.hero.name).toUpperCase() : "SIN SELECCIÓN"
                                color: modelData.hero ? "#ffffff" : window.muted
                                font.family: "Rajdhani"
                                font.pixelSize: 20
                                font.bold: true
                                horizontalAlignment: Text.AlignHCenter
                                elide: Text.ElideRight
                            }

                            Text {
                                Layout.fillWidth: true
                                text: modelData.side === "plants" ? "PLANTA" : "ZOMBI"
                                color: pvzCard.sideColor
                                font.family: "Rajdhani"
                                font.pixelSize: 10
                                font.bold: true
                                horizontalAlignment: Text.AlignHCenter
                            }

                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 86
                                visible: !!modelData.hero
                                color: "#0d2639"
                                border.color: pvzCard.sideColor
                                RowLayout {
                                    anchors.fill: parent
                                    anchors.margins: 7
                                    spacing: 8
                                    Image {
                                        Layout.preferredWidth: 64
                                        Layout.preferredHeight: 64
                                        source: modelData.hero && modelData.hero.variant
                                                ? modelData.hero.variant.portrait
                                                : ""
                                        sourceSize.width: 96
                                        sourceSize.height: 96
                                        fillMode: Image.PreserveAspectCrop
                                    }
                                    ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 1
                                        Text {
                                            text: "VARIANTE"
                                            color: pvzCard.sideColor
                                            font.pixelSize: 8
                                            font.bold: true
                                        }
                                        Text {
                                            Layout.fillWidth: true
                                            text: modelData.hero && modelData.hero.variant
                                                  ? modelData.hero.variant.name : "Predeterminado"
                                            color: window.text
                                            font.family: "Rajdhani"
                                            font.pixelSize: 13
                                            font.bold: true
                                            wrapMode: Text.Wrap
                                        }
                                    }
                                }
                            }
                            Item { Layout.fillHeight: true }
                        }
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
                PvzRoulette { onExitRequested: root.rouletteMode = false }
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
        side: root.filterSide
        accent: root.filterSide === "zombies" ? root.zombieColor : root.plantColor
        soundKind: "pvz_click"
        onCloseRequested: root.filterSlotId = ""
    }
}
