import QtQuick

Rectangle {
    id: panel
    property string title: ""
    property string subtitle: ""
    default property alias content: body.data
    color: "#0a1a2b"
    border.color: "#214564"
    border.width: 1
    radius: 2

    Rectangle {
        x: 0
        y: 0
        width: 4
        height: 44
        color: "#f6a21a"
    }

    Text {
        id: heading
        anchors.left: parent.left
        anchors.leftMargin: 15
        anchors.top: parent.top
        anchors.topMargin: 11
        text: panel.title
        color: "#f7f9fc"
        font.family: "Rajdhani"
        font.pixelSize: 15
        font.weight: Font.DemiBold
    }

    Text {
        anchors.left: heading.left
        anchors.right: parent.right
        anchors.rightMargin: 12
        anchors.top: heading.bottom
        anchors.topMargin: 2
        visible: panel.subtitle.length > 0
        text: panel.subtitle
        color: "#86a9c9"
        font.family: "Open Sans"
        font.pixelSize: 10
        elide: Text.ElideRight
    }

    Item {
        id: body
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.topMargin: panel.subtitle.length > 0 ? 56 : 46
        anchors.bottom: parent.bottom
        anchors.margins: 10
    }
}
