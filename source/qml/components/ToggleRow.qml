import QtQuick
import QtQuick.Controls

Button {
    id: control
    property bool checkedValue: false
    property color activeColor: "#46c8ff"
    implicitHeight: 38
    hoverEnabled: true

    contentItem: Row {
        spacing: 10
        leftPadding: 11
        rightPadding: 9

        Rectangle {
            width: 31
            height: 18
            radius: 9
            anchors.verticalCenter: parent.verticalCenter
            color: control.checkedValue ? control.activeColor : "#18334f"
            border.color: control.checkedValue ? Qt.lighter(control.activeColor, 1.2) : "#315371"
            Behavior on color { ColorAnimation { duration: 100 } }

            Rectangle {
                width: 12
                height: 12
                radius: 6
                y: 3
                x: control.checkedValue ? 16 : 3
                color: control.checkedValue ? "#06121d" : "#8fa9bf"
                Behavior on x { NumberAnimation { duration: 120; easing.type: Easing.OutCubic } }
            }
        }

        Text {
            width: control.width - 62
            anchors.verticalCenter: parent.verticalCenter
            text: control.text
            color: "#f2f6fb"
            font.family: "Rajdhani"
            font.pixelSize: 11
            font.weight: Font.DemiBold
            elide: Text.ElideRight
        }
    }

    background: Rectangle {
        color: control.hovered ? "#15314e" : "#10263e"
        border.color: control.checkedValue ? Qt.darker(control.activeColor, 1.3) : "transparent"
        border.width: 1
        radius: 2
        Behavior on color { ColorAnimation { duration: 90 } }
    }
}
