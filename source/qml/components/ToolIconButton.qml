import QtQuick
import QtQuick.Controls

Button {
    id: control
    property string iconKind: "menu"
    property color activeColor: "#43cfff"
    implicitHeight: 38
    implicitWidth: 52
    hoverEnabled: true

    contentItem: Canvas {
        id: iconCanvas
        width: 22
        height: 22
        renderTarget: Canvas.FramebufferObject
        antialiasing: true

        onPaint: {
            var ctx = getContext("2d")
            ctx.reset()
            ctx.strokeStyle = control.pressed ? control.activeColor : "#f4f8fc"
            ctx.fillStyle = ctx.strokeStyle
            ctx.lineWidth = 2.2
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            if (control.iconKind === "reroll") {
                ctx.beginPath()
                ctx.arc(11, 11, 6.3, -0.35, 4.75)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(8.1, 3.6)
                ctx.lineTo(13.3, 4.2)
                ctx.lineTo(10.3, 8.2)
                ctx.closePath()
                ctx.fill()
            } else if (control.iconKind === "lock") {
                ctx.strokeRect(5.5, 10, 11, 8)
                ctx.beginPath()
                ctx.arc(11, 10, 4.2, Math.PI, 0)
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(11, 14, 1.1, 0, Math.PI * 2)
                ctx.fill()
            } else {
                for (var row = 0; row < 3; ++row) {
                    var y = 6 + row * 5
                    ctx.fillRect(4, y - 1, 2.3, 2.3)
                    ctx.beginPath()
                    ctx.moveTo(9, y)
                    ctx.lineTo(18, y)
                    ctx.stroke()
                }
            }
        }

        Connections {
            target: control
            function onPressedChanged() { iconCanvas.requestPaint() }
            function onHoveredChanged() { iconCanvas.requestPaint() }
        }
    }

    background: Rectangle {
        color: control.pressed ? Qt.darker(control.activeColor, 1.3)
                               : control.hovered ? "#28547a" : "#1c4164"
        border.color: control.hovered ? control.activeColor : "#285070"
        border.width: 1
    }
}
