import QtQuick
import QtQuick.Controls

Item {
    id: section
    property var teamModel
    property int teamNumber: 1
    property var controller
    property var localizer
    property int availableWidth: width
    property int minimumCardWidth: controller.compactCards ? 230 : 255
    property int maximumColumns: Math.max(1, Math.floor(availableWidth / minimumCardWidth))
    property int columns: Math.max(1, Math.min(grid.count > 0 ? grid.count : 1, maximumColumns))
    property int cardHeight: controller.rolesOnly ? 330 : controller.stadium ? (controller.compactCards ? 540 : 660) : (controller.compactCards ? 420 : 560)
    implicitHeight: titleBar.height + grid.height + 12

    Rectangle {
        id: titleBar
        width: parent.width
        height: 44
        color: "#081828"
        border.color: "#244764"
        border.width: 1
        Text {
            anchors.left: parent.left
            anchors.leftMargin: 14
            anchors.verticalCenter: parent.verticalCenter
            text: (section.localizer ? section.localizer.t("team") : controller.tr("team")).replace("{number}", section.teamNumber)
            color: "#f6a21a"
            font.family: "Rajdhani"
            font.pixelSize: 15
            font.bold: true
        }
    }

    GridView {
        id: grid
        anchors.top: titleBar.bottom
        anchors.topMargin: 6
        width: parent.width
        height: Math.ceil(count / section.columns) * section.cardHeight
        model: section.teamModel
        cellWidth: width / section.columns
        cellHeight: section.cardHeight
        interactive: false
        clip: false

        delegate: HeroCard {
            width: grid.cellWidth - 10
            height: grid.cellHeight - 10
            x: 5
            y: 5
            controller: section.controller
            localizer: section.localizer
            compact: section.controller.compactCards
            animations: section.controller.animationsEnabled && section.controller.performanceMode !== "low"
        }
    }
}
