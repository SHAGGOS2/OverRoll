import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    objectName: "localDataPage"
    required property var localizer
    property var window: localizer
    property var ui: localizer.ui

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 10
        RowLayout {
            Layout.fillWidth: true
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0
                Text { text: ui.local_data; color: window.text; font.family: "Rajdhani"; font.pixelSize: 27; font.bold: true }
                Text { text: window.localizedSnapshotLabel(appController.snapshotLabel); color: window.orange; font.family: "Rajdhani"; font.pixelSize: 11; font.bold: true }
            }
            TextField {
                id: localSearch
                Layout.preferredWidth: 300
                Layout.preferredHeight: 38
                placeholderText: ui.search
                color: window.text
                placeholderTextColor: "#6f8ca5"
                leftPadding: 10
                background: Rectangle { color: "#0b1e31"; border.color: localSearch.activeFocus ? window.cyan : window.line }
            }
        }
        ListView {
            id: localList
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: appController.localHeroRows
            spacing: 4
            clip: true
            reuseItems: true
            cacheBuffer: 0
            boundsBehavior: Flickable.StopAtBounds
            ScrollBar.vertical: ScrollBar { policy: localList.contentHeight > localList.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
            delegate: Rectangle {
                required property var modelData
                property string localizedName: window.heroName(modelData.key, modelData.name)
                property bool matches: !localSearch.text.length || localizedName.toLowerCase().includes(localSearch.text.toLowerCase())
                width: localList.width - (localList.contentHeight > localList.height ? 12 : 0)
                height: matches ? 58 : 0
                visible: matches
                color: "#0a1b2b"
                border.color: window.line
                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 6
                    Image {
                        Layout.preferredWidth: 44
                        Layout.preferredHeight: 44
                        source: modelData.portrait
                        sourceSize.width: 52
                        sourceSize.height: 52
                        fillMode: Image.PreserveAspectCrop
                        cache: false
                        asynchronous: true
                    }
                    Text { Layout.preferredWidth: 220; text: localizedName; color: window.text; font.family: "Rajdhani"; font.pixelSize: 14; font.bold: true; elide: Text.ElideRight }
                    Text { Layout.preferredWidth: 150; text: window.roleName(modelData.role, modelData.role).toUpperCase(); color: window.cyan; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true }
                    Text { Layout.fillWidth: true; text: window.subroleName(modelData.subrole, modelData.subrole); color: window.muted; font.family: "Open Sans"; font.pixelSize: 11; elide: Text.ElideRight }
                    Text { text: window.gameModeLabel(modelData.stadium); color: modelData.stadium ? "#ffcc30" : "#62dca4"; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true }
                }
            }
        }
    }
}
