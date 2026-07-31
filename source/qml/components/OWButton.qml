import QtQuick
import QtQuick.Controls

Button {
    id: control
    property color accent: "#1d4368"
    property color activeColor: "#f6a21a"
    property bool selected: false
    property bool danger: false
    property bool quiet: false
    property string labelFont: "Rajdhani"
    property url iconSource: ""
    implicitHeight: 38
    implicitWidth: 112
    hoverEnabled: appController.performanceMode !== "low"

    contentItem: Item {
        Image {
            anchors.centerIn: parent
            width: 18
            height: 18
            visible: control.iconSource.toString().length > 0
            source: control.iconSource
            sourceSize.width: 22
            sourceSize.height: 22
            fillMode: Image.PreserveAspectFit
        }
        Text {
            anchors.fill: parent
            visible: control.iconSource.toString().length === 0
            text: control.text
            color: control.selected ? "#07111d" : "#f5f8fc"
            font.family: control.labelFont
            font.pixelSize: 12
            font.weight: Font.DemiBold
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
            elide: Text.ElideRight
            leftPadding: 8
            rightPadding: 8
        }
    }

    background: Rectangle {
        color: control.selected
               ? control.activeColor
               : control.down
                 ? Qt.lighter(control.accent, 1.28)
                 : control.hovered
                   ? Qt.lighter(control.accent, 1.14)
                   : control.quiet ? "#0b1d30" : control.accent
        border.width: control.activeFocus ? 1 : 0
        border.color: "#67d9ff"
        radius: 2
        Behavior on color {
            enabled: appController.performanceMode === "high"
            ColorAnimation { duration: 70 }
        }

        Rectangle {
            anchors.left: parent.left
            anchors.top: parent.top
            anchors.bottom: parent.bottom
            width: control.selected ? 4 : control.hovered ? 3 : 0
            color: control.danger ? "#ff5365" : control.activeColor
            Behavior on width {
                enabled: appController.performanceMode === "high"
                NumberAnimation { duration: 70; easing.type: Easing.OutCubic }
            }
        }
    }

    scale: down ? 0.985 : 1
    Behavior on scale {
        enabled: appController.performanceMode === "high"
        NumberAnimation { duration: 55 }
    }
}
