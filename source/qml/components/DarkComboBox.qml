import QtQuick
import QtQuick.Controls

ComboBox {
    id: control
    implicitHeight: 36
    leftPadding: 10
    rightPadding: 30

    contentItem: Text {
        text: control.displayText
        color: "#f5f8fc"
        font.family: "Rajdhani"
        font.pixelSize: 11
        verticalAlignment: Text.AlignVCenter
        elide: Text.ElideRight
    }

    indicator: Canvas {
        x: control.width - width - 10
        y: (control.height - height) / 2
        width: 12
        height: 8
        contextType: "2d"
        onPaint: {
            context.reset()
            context.moveTo(0, 0)
            context.lineTo(width, 0)
            context.lineTo(width / 2, height)
            context.closePath()
            context.fillStyle = control.pressed ? "#f6a21a" : "#94b2cd"
            context.fill()
        }
    }

    background: Rectangle {
        color: control.enabled ? "#0b1e31" : "#081521"
        border.color: control.activeFocus ? "#43cfff" : "#234764"
        border.width: 1
        radius: 2
    }

    popup: Popup {
        y: control.height
        width: control.width
        implicitHeight: Math.min(contentItem.implicitHeight + 2, 260)
        padding: 1
        contentItem: ListView {
            clip: true
            implicitHeight: contentHeight
            model: control.popup.visible ? control.delegateModel : null
            currentIndex: control.highlightedIndex
            ScrollIndicator.vertical: ScrollIndicator { }
        }
        background: Rectangle {
            color: "#081726"
            border.color: "#43cfff"
            border.width: 1
        }
    }

    delegate: ItemDelegate {
        required property int index
        width: control.width - 2
        height: 32
        highlighted: control.highlightedIndex === index
        contentItem: Text {
            text: control.textAt(index)
            color: highlighted ? "#07111b" : "#f5f8fc"
            font.family: "Rajdhani"
            font.pixelSize: 11
            verticalAlignment: Text.AlignVCenter
            elide: Text.ElideRight
        }
        background: Rectangle { color: highlighted ? "#f6a21a" : "#0b1e31" }
    }
}
