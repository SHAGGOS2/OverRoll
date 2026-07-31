import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: row
    required property int playerIndex
    required property string playerName
    required property bool tankActive
    required property bool damageActive
    required property bool supportActive
    required property string profileId
    required property string profileName
    property var controller
    property var localizer
    color: "#081522"
    border.color: "#1b3e5d"
    border.width: 1
    implicitHeight: 40
    radius: 1

    RowLayout {
        anchors.fill: parent
        anchors.margins: 4
        spacing: 4

        Rectangle {
            Layout.preferredWidth: 27
            Layout.fillHeight: true
            color: "#f6a21a"
            Text {
                anchors.centerIn: parent
                text: String(row.playerIndex + 1).padStart(2, "0")
                color: "#09111b"
                font.family: "Rajdhani"
                font.pixelSize: 9
                font.bold: true
            }
        }

        TextField {
            id: nameField
            Layout.fillWidth: true
            Layout.fillHeight: true
            text: row.playerName
            selectByMouse: true
            readOnly: row.profileId.length > 0
            color: "#f4f8fc"
            font.family: "Rajdhani"
            font.pixelSize: 11
            leftPadding: 8
            rightPadding: 5
            background: Rectangle {
                color: row.profileId.length ? "#132d49" : "#0d2136"
                border.color: nameField.activeFocus && !nameField.readOnly ? "#47cbff" : "transparent"
            }
            onEditingFinished: row.controller.setPlayerName(row.playerIndex, text)
        }

        Repeater {
            model: [
                { role: "tank", active: row.tankActive, color: "#39c4ff" },
                { role: "damage", active: row.damageActive, color: "#ff5a6c" },
                { role: "support", active: row.supportActive, color: "#5ce1a2" }
            ]
            delegate: Button {
                id: roleButton
                required property var modelData
                Layout.preferredWidth: 30
                Layout.fillHeight: true
                hoverEnabled: true
                onClicked: row.controller.togglePlayerRole(row.playerIndex, modelData.role)
                contentItem: Image {
                    source: row.controller.roleIcon(modelData.role)
                    sourceSize.width: 19
                    sourceSize.height: 19
                    fillMode: Image.PreserveAspectFit
                    opacity: modelData.active ? 1 : 0.35
                }
                background: Rectangle {
                    color: modelData.active ? modelData.color : "#12283e"
                    opacity: roleButton.hovered ? 1 : 0.9
                    radius: 1
                }
                ToolTip.visible: hovered
                ToolTip.text: row.localizer ? row.localizer.t(modelData.role) : row.controller.tr(modelData.role)
            }
        }

        ComboBox {
            id: profileBox
            Layout.preferredWidth: 42
            Layout.fillHeight: true
            model: row.controller.profileChoices
            textRole: "name"
            valueRole: "id"
            displayText: row.profileName.length ? row.profileName.charAt(0).toUpperCase() : "☆"
            font.family: "Rajdhani"
            font.pixelSize: 10
            currentIndex: indexOfValue(row.profileId)
            onActivated: row.controller.assignPlayerProfile(row.playerIndex, currentValue)
            contentItem: Text {
                text: profileBox.displayText
                color: row.profileName.length ? "#ffb32f" : "#a4bdd3"
                font.family: "Rajdhani"
                font.pixelSize: 13
                font.bold: true
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
            background: Rectangle { color: "#132d49"; border.color: profileBox.hovered ? "#f6a21a" : "#294d6e" }
            indicator: Item { }
            popup.width: 190
        }
    }
}
