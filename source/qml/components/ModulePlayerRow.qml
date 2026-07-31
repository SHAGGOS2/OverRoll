import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: row
    required property int playerIndex
    required property var slotData
    property var controller
    property var manager
    property var roleOptions: []
    property string optionTitle: "ROLES"
    property color accent: "#f6a21a"

    color: "#081522"
    border.color: slotData.profileId ? accent : "#1b3e5d"
    border.width: slotData.profileId ? 2 : 1
    radius: 2
    implicitHeight: 66

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 4
        spacing: 4

        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 28
            spacing: 4

            Rectangle {
                Layout.preferredWidth: 27
                Layout.fillHeight: true
                color: row.accent
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
                text: row.slotData.name || ("Jugador " + (row.playerIndex + 1))
                readOnly: !!row.slotData.profileId
                selectByMouse: true
                color: "#f4f8fc"
                font.family: "Rajdhani"
                font.pixelSize: 11
                leftPadding: 7
                rightPadding: 5
                background: Rectangle {
                    color: nameField.readOnly ? "#132d49" : "#0d2136"
                    border.color: nameField.activeFocus && !nameField.readOnly ? row.accent : "transparent"
                }
                onEditingFinished: row.manager.setSlotName(row.playerIndex, text)
                ToolTip.visible: hovered && readOnly
                ToolTip.text: "El perfil mantiene este nombre. Desvincúlalo para editarlo."
            }

            ComboBox {
                id: profileBox
                Layout.preferredWidth: 104
                Layout.fillHeight: true
                model: row.controller.profileChoices
                textRole: "name"
                valueRole: "id"
                currentIndex: indexOfValue(row.slotData.profileId || "")
                displayText: row.slotData.profileName || "Sin perfil"
                font.family: "Rajdhani"
                font.pixelSize: 10
                onActivated: row.manager.assignSlotProfile(row.playerIndex, currentValue)
                contentItem: Text {
                    text: profileBox.displayText
                    color: row.slotData.profileId ? row.accent : "#a4bdd3"
                    font.family: "Rajdhani"
                    font.pixelSize: 10
                    font.bold: !!row.slotData.profileId
                    leftPadding: 7
                    rightPadding: 15
                    verticalAlignment: Text.AlignVCenter
                    elide: Text.ElideRight
                }
                background: Rectangle {
                    color: "#132d49"
                    border.color: profileBox.hovered || row.slotData.profileId ? row.accent : "#294d6e"
                    radius: 1
                }
                popup.width: Math.max(190, profileBox.width)
                ToolTip.visible: hovered
                ToolTip.text: row.slotData.profileId
                              ? "Perfil activo: " + row.slotData.profileName
                              : "Asignar un perfil a este jugador"
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 4

            Text {
                Layout.preferredWidth: 43
                text: row.optionTitle
                color: "#6f91ad"
                font.family: "Rajdhani"
                font.pixelSize: 8
                font.bold: true
            }

            Repeater {
                model: row.roleOptions
                delegate: Button {
                    id: optionButton
                    required property var modelData
                    property bool optionActive: modelData.active
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    hoverEnabled: true
                    onClicked: modelData.action()
                    contentItem: RowLayout {
                        spacing: 3
                        Image {
                            visible: optionButton.modelData.iconSource && optionButton.modelData.iconSource.length
                            Layout.preferredWidth: 16
                            Layout.preferredHeight: 16
                            source: optionButton.modelData.iconSource || ""
                            fillMode: Image.PreserveAspectFit
                            opacity: optionButton.optionActive ? 1 : 0.35
                        }
                        Text {
                            Layout.fillWidth: true
                            text: optionButton.modelData.label
                            color: optionButton.optionActive ? "#07121c" : "#8ca7bd"
                            font.family: "Rajdhani"
                            font.pixelSize: 9
                            font.bold: true
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                        }
                    }
                    background: Rectangle {
                        color: optionButton.optionActive ? optionButton.modelData.color : "#10283e"
                        border.color: optionButton.hovered ? optionButton.modelData.color : "#234766"
                        radius: 1
                    }
                    ToolTip.visible: hovered
                    ToolTip.text: optionButton.modelData.tooltip || optionButton.modelData.label
                }
            }
        }
    }
}
