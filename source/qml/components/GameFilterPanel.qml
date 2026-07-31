pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    required property string slotId
    required property var blocked
    property string side: ""
    property color accent: "#f6a21a"
    property string soundKind: "click"
    property string roleFilter: ""
    signal closeRequested()

    color: "#071521"
    border.color: accent
    border.width: 2
    z: 100

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 7

        RowLayout {
            Layout.fillWidth: true
            Text {
                Layout.fillWidth: true
                text: "FILTRO DE PERSONAJES"
                color: "#ffffff"
                font.family: "Rajdhani"
                font.pixelSize: 18
                font.bold: true
            }
            Button {
                text: "×"
                onClicked: root.closeRequested()
                background: Rectangle { color: parent.hovered ? "#284765" : "#16324d" }
                contentItem: Text { text: parent.text; color: "#ffffff"; horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter }
            }
        }
        Text {
            Layout.fillWidth: true
            text: root.blocked.length + " bloqueados · pulsa una fila para permitir o bloquear"
            color: "#91aec8"
            font.pixelSize: 10
            wrapMode: Text.Wrap
        }
        Button {
            Layout.fillWidth: true
            Layout.preferredHeight: 34
            text: "RESTABLECER FILTRO"
            onClicked: {
                appController.playUiSound(root.soundKind)
                moduleManager.clearBlocked(root.slotId)
            }
            background: Rectangle { color: parent.hovered ? "#294d6b" : "#173856"; border.color: "#315e7f" }
            contentItem: Text { text: parent.text; color: "#ffffff"; font.bold: true; horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter }
        }
        RowLayout {
            Layout.fillWidth: true
            visible: moduleManager.activeRoles.length > 1 && moduleManager.activeRoles.length <= 6
            spacing: 4
            Repeater {
                model: [{ id: "", name: "TODOS", color: root.accent }].concat(moduleManager.activeRoles)
                delegate: Button {
                    required property var modelData
                    Layout.fillWidth: true
                    Layout.preferredHeight: 32
                    text: modelData.name.toUpperCase()
                    onClicked: root.roleFilter = modelData.id
                    background: Rectangle {
                        color: root.roleFilter === parent.modelData.id ? parent.modelData.color : "#173856"
                        border.color: "#315e7f"
                    }
                    contentItem: Text {
                        text: parent.text
                        color: root.roleFilter === parent.modelData.id ? "#071521" : "#ffffff"
                        font.pixelSize: 9
                        font.bold: true
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                }
            }
        }
        ListView {
            id: catalogList
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: moduleManager.activeCatalog
            clip: true
            reuseItems: true
            cacheBuffer: 500
            spacing: 3
            ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

            delegate: Rectangle {
                required property var modelData
                property bool sideMatch: !root.side.length || modelData.side === root.side
                property bool roleMatch: !root.roleFilter.length || modelData.role === root.roleFilter
                property bool isBlocked: root.blocked.indexOf(modelData.key) >= 0
                visible: sideMatch && roleMatch
                width: visible ? catalogList.width - 12 : 0
                height: visible ? 46 : 0
                color: isBlocked ? "#311725" : "#0d2b42"
                border.color: isBlocked ? "#ff5b69" : "#315e7f"

                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 4
                    Image {
                        Layout.preferredWidth: 36
                        Layout.preferredHeight: 36
                        source: modelData.portrait
                        fillMode: Image.PreserveAspectCrop
                        asynchronous: true
                    }
                    Text {
                        Layout.fillWidth: true
                        text: modelData.name
                        color: "#ffffff"
                        font.family: "Rajdhani"
                        font.bold: true
                        elide: Text.ElideRight
                    }
                    Text {
                        text: isBlocked ? "BLOQUEADO" : "PERMITIDO"
                        color: isBlocked ? "#ff7483" : "#63e0a4"
                        font.pixelSize: 9
                        font.bold: true
                    }
                }
                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        appController.playUiSound(root.soundKind)
                        moduleManager.toggleBlocked(root.slotId, modelData.key)
                    }
                }
            }
        }
    }
}
