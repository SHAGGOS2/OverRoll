import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Flickable {
    id: root
    required property var localizer
    property var window: localizer
    property var ui: localizer.ui

    clip: true
    contentWidth: width
    contentHeight: contentColumn.implicitHeight
    boundsBehavior: Flickable.StopAtBounds
    ScrollBar.vertical: ScrollBar {
        policy: root.contentHeight > root.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
    }

    function tx(spanish, english) {
        return String(appController.locale || "").indexOf("es-") === 0 ? spanish : english
    }

    function adjust(setting, delta) {
        if (setting === "size")
            appController.setOverlayCardSize(appController.overlayCardSize + delta * 10)
        else if (setting === "opacity")
            appController.setOverlayNumber("overlay_opacity", appController.overlayOpacity + delta * 5)
        else if (setting === "spacing")
            appController.setOverlayNumber("overlay_spacing", appController.overlaySpacing + delta * 2)
        else
            appController.setOverlayNumber("overlay_columns", appController.overlayColumns + delta)
    }

    ColumnLayout {
        id: contentColumn
        width: root.width - (root.contentHeight > root.height ? 10 : 0)
        spacing: 10

        Text {
            text: ui.obs_overlay
            color: window.orange
            font.family: "Rajdhani"
            font.pixelSize: 20
            font.bold: true
        }
        Text {
            Layout.fillWidth: true
            text: ui.obs_overlay_help
            color: window.muted
            font.family: "Open Sans"
            font.pixelSize: 10
            wrapMode: Text.Wrap
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 390
            color: "#0a1d30"
            border.color: appController.overlayEnabled ? window.cyan : window.line

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 7

                ToggleRow {
                    Layout.fillWidth: true
                    text: ui.overlay_enabled
                    checkedValue: appController.overlayEnabled
                    activeColor: window.cyan
                    onClicked: appController.setBoolSetting("overlay", !appController.overlayEnabled)
                }

                RowLayout {
                    Layout.fillWidth: true
                    Text {
                        Layout.fillWidth: true
                        text: root.tx("ORDEN DE FICHAS", "CARD ORDER")
                        color: window.text
                        font.family: "Rajdhani"
                        font.bold: true
                    }
                    OWButton {
                        Layout.preferredWidth: 130
                        text: root.tx("HORIZONTAL", "HORIZONTAL")
                        selected: appController.overlayOrientation === "horizontal"
                        onClicked: appController.setTextSetting("overlay_orientation", "horizontal")
                    }
                    OWButton {
                        Layout.preferredWidth: 130
                        text: root.tx("VERTICAL", "VERTICAL")
                        selected: appController.overlayOrientation === "vertical"
                        onClicked: appController.setTextSetting("overlay_orientation", "vertical")
                    }
                }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 6
                    Text { Layout.fillWidth: true; text: root.tx("Tamaño de ficha", "Card size") + ": " + appController.overlayCardSize + " px"; color: window.text }
                    OWButton { Layout.preferredWidth: 62; text: "-"; onClicked: root.adjust("size", -1) }
                    OWButton { Layout.preferredWidth: 62; text: "+"; onClicked: root.adjust("size", 1) }
                }
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 6
                    Text { Layout.fillWidth: true; text: root.tx("Opacidad", "Opacity") + ": " + appController.overlayOpacity + "%"; color: window.text }
                    OWButton { Layout.preferredWidth: 62; text: "-"; onClicked: root.adjust("opacity", -1) }
                    OWButton { Layout.preferredWidth: 62; text: "+"; onClicked: root.adjust("opacity", 1) }
                }
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 6
                    Text { Layout.fillWidth: true; text: root.tx("Separación", "Gap") + ": " + appController.overlaySpacing + " px"; color: window.text }
                    OWButton { Layout.preferredWidth: 62; text: "-"; onClicked: root.adjust("spacing", -1) }
                    OWButton { Layout.preferredWidth: 62; text: "+"; onClicked: root.adjust("spacing", 1) }
                }
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 6
                    Text { Layout.fillWidth: true; text: root.tx("Columnas", "Columns") + ": " + (appController.overlayColumns === 0 ? "AUTO" : appController.overlayColumns); color: window.text }
                    OWButton { Layout.preferredWidth: 62; text: "-"; onClicked: root.adjust("columns", -1) }
                    OWButton { Layout.preferredWidth: 62; text: "+"; onClicked: root.adjust("columns", 1) }
                }

                RowLayout {
                    Layout.fillWidth: true
                    ToggleRow {
                        Layout.fillWidth: true
                        text: root.tx("Mostrar nombres", "Show names")
                        checkedValue: appController.overlayShowNames
                        onClicked: appController.setBoolSetting("overlay_names", !appController.overlayShowNames)
                    }
                    ToggleRow {
                        Layout.fillWidth: true
                        text: root.tx("Mostrar detalles", "Show details")
                        checkedValue: appController.overlayShowDetails
                        onClicked: appController.setBoolSetting("overlay_details", !appController.overlayShowDetails)
                    }
                }

                RowLayout {
                    Layout.fillWidth: true
                    OWButton {
                        Layout.fillWidth: true
                        text: root.tx("REUBICAR", "RESET POSITION")
                        onClicked: window.resetOverlayPosition()
                    }
                    OWButton {
                        Layout.fillWidth: true
                        text: root.tx("RESTAURAR TODO", "RESET ALL")
                        onClicked: {
                            appController.resetOverlayLayout()
                            Qt.callLater(window.resetOverlayPosition)
                        }
                    }
                }
            }
        }

        Text {
            text: ui.twitch
            color: "#a783ff"
            font.family: "Rajdhani"
            font.pixelSize: 20
            font.bold: true
        }
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 205
            color: "#0a1d30"
            border.color: "#6545a4"
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 8
                Text {
                    Layout.fillWidth: true
                    text: root.tx("CONTROL POR CHAT · EN PREPARACIÓN", "CHAT CONTROL · IN DEVELOPMENT")
                    color: window.text
                    font.family: "Rajdhani"
                    font.pixelSize: 16
                    font.bold: true
                }
                Text {
                    Layout.fillWidth: true
                    text: root.tx("Twitch todavía no inicia sesión ni lee el chat. Puedes preparar el canal y el comando sin conectar nada.", "Twitch does not sign in or read chat yet. You can prepare the channel and command without connecting anything.")
                    color: window.muted
                    font.pixelSize: 10
                    wrapMode: Text.Wrap
                }
                RowLayout {
                    Layout.fillWidth: true
                    TextField {
                        Layout.fillWidth: true
                        text: appController.twitchChannel
                        placeholderText: ui.twitch_channel
                        color: window.text
                        background: Rectangle { color: "#071521"; border.color: window.line }
                        onEditingFinished: appController.setTextSetting("twitch_channel", text)
                    }
                    TextField {
                        Layout.fillWidth: true
                        text: appController.twitchCommand
                        placeholderText: ui.twitch_command
                        color: window.text
                        background: Rectangle { color: "#071521"; border.color: window.line }
                        onEditingFinished: appController.setTextSetting("twitch_command", text)
                    }
                }
                OWButton {
                    Layout.fillWidth: true
                    text: ui.twitch_oauth
                    enabled: false
                    activeColor: "#9146ff"
                }
            }
        }
        Item { Layout.preferredHeight: 8 }
    }
}
