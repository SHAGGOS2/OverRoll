pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"
import "VoiceCredits.js" as VoiceCredits

Rectangle {
    id: root
    required property var localizer
    property var window: localizer
    property string voiceCreditsLocale: "latam"
    signal voiceLocaleSelected(string locale)

    implicitHeight: 465
    color: "#071521"
    border.color: window.line

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 8

        RowLayout {
            Layout.fillWidth: true
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0
                Text {
                    text: appController.locale === "en-us" ? "VOICE CAST" : "VOCES"
                    color: root.window.orange
                    font.family: "Rajdhani"
                    font.pixelSize: 18
                    font.bold: true
                }
                Text {
                    Layout.fillWidth: true
                    text: appController.locale === "en-us"
                          ? "Actors credited for the included English and Latin American voice packs."
                          : "Actores acreditados de los paquetes de voz en inglés y español latino incluidos."
                    color: root.window.muted
                    font.family: "Open Sans"
                    font.pixelSize: 9
                    elide: Text.ElideRight
                }
            }
            OWButton {
                Layout.preferredWidth: 170
                text: "Español latino"
                selected: root.voiceCreditsLocale === "latam"
                onClicked: {
                    root.voiceLocaleSelected("latam")
                    appController.playUiSound("stats_tab")
                }
            }
            OWButton {
                Layout.preferredWidth: 130
                text: "English"
                selected: root.voiceCreditsLocale === "en"
                onClicked: {
                    root.voiceLocaleSelected("en")
                    appController.playUiSound("stats_tab")
                }
            }
        }

        GridView {
            id: voiceCreditsGrid
            Layout.fillWidth: true
            Layout.fillHeight: true
            property int columns: width >= 920 ? 3 : width >= 560 ? 2 : 1
            cellWidth: width / columns
            cellHeight: 57
            model: VoiceCredits.rows
            clip: true
            reuseItems: true
            boundsBehavior: Flickable.StopAtBounds
            ScrollBar.vertical: ScrollBar {
                policy: voiceCreditsGrid.contentHeight > voiceCreditsGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
            }
            delegate: Rectangle {
                required property var modelData
                width: voiceCreditsGrid.cellWidth - 7
                height: voiceCreditsGrid.cellHeight - 6
                x: 3
                y: 3
                color: "#0a1d30"
                border.color: root.window.line
                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 8
                    Text {
                        Layout.preferredWidth: 112
                        text: modelData.hero
                        color: root.window.text
                        font.family: "Rajdhani"
                        font.pixelSize: 12
                        font.bold: true
                        elide: Text.ElideRight
                    }
                    Rectangle { Layout.preferredWidth: 1; Layout.fillHeight: true; color: root.window.line }
                    Text {
                        Layout.fillWidth: true
                        text: root.voiceCreditsLocale === "en" ? modelData.en : modelData.latam
                        color: root.voiceCreditsLocale === "en" ? root.window.cyan : "#d7c5ff"
                        font.family: "Open Sans"
                        font.pixelSize: 9
                        wrapMode: Text.Wrap
                        maximumLineCount: 2
                        elide: Text.ElideRight
                    }
                }
            }
        }

        Text {
            Layout.fillWidth: true
            text: appController.locale === "en-us"
                  ? "Cast reference: Overwatch Wiki. Multiple names indicate recasts or special productions."
                  : "Referencia del reparto: Overwatch Wiki. Varios nombres indican reemplazos o producciones especiales."
            color: voiceSourceMouse.containsMouse ? root.window.cyan : root.window.muted
            font.family: "Open Sans"
            font.pixelSize: 9
            font.underline: voiceSourceMouse.containsMouse
            MouseArea {
                id: voiceSourceMouse
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: Qt.openUrlExternally("https://overwatch.fandom.com/wiki/Latin_American_Spanish")
            }
        }
    }
}
