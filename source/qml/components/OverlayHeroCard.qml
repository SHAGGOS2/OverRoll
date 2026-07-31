import QtQuick
import QtQuick.Layouts

Rectangle {
    id: card

    required property string heroKey
    required property string heroName
    required property string roleName
    required property string portrait
    required property string largeRoleIcon
    required property color accent
    required property int perkCount
    required property string perk0Name
    required property string perk0Icon
    required property string perk1Name
    required property string perk1Icon
    required property string perk2Name
    required property string perk2Icon
    required property string perk3Name
    required property string perk3Icon
    required property bool rolesOnly
    required property int revision
    property var localizer
    readonly property bool mini: width < 105
    readonly property int innerWidth: Math.max(36, width - (mini ? 8 : 18))
    readonly property int portraitSize: mini
                                        ? Math.max(28, Math.min(innerWidth, height * 0.56))
                                        : Math.max(64, Math.min(150, innerWidth, height * 0.38))
    readonly property real scaleFactor: Math.max(0.35, Math.min(1.25, width / 200))

    function perkName(index) {
        return index === 0 ? perk0Name : index === 1 ? perk1Name : index === 2 ? perk2Name : perk3Name
    }

    function perkIcon(index) {
        return index === 0 ? perk0Icon : index === 1 ? perk1Icon : index === 2 ? perk2Icon : perk3Icon
    }

    color: "#f2071422"
    border.width: 2
    border.color: accent
    radius: 3
    clip: true

    Rectangle {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        height: 4
        color: card.accent
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: card.mini ? 4 : 9
        anchors.topMargin: card.mini ? 7 : 12
        spacing: card.mini ? 2 : 7

        Item {
            Layout.fillWidth: true
            Layout.preferredHeight: card.portraitSize

            Image {
                anchors.centerIn: parent
                width: card.portraitSize
                height: card.portraitSize
                source: card.rolesOnly ? card.largeRoleIcon : card.portrait
                fillMode: card.rolesOnly ? Image.PreserveAspectFit : Image.PreserveAspectCrop
                asynchronous: true
                cache: true
            }

            Rectangle {
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.bottom: parent.bottom
                width: card.portraitSize
                height: 4
                color: card.accent
            }
        }

        Text {
            Layout.fillWidth: true
            text: card.rolesOnly
                  ? card.roleName.toUpperCase()
                  : (card.localizer ? card.localizer.heroName(card.heroKey, card.heroName) : card.heroName).toUpperCase()
            color: "#ffffff"
            font.family: "Rajdhani"
            visible: appController.overlayShowNames
            font.pixelSize: Math.max(8, Math.round(20 * card.scaleFactor))
            font.bold: true
            horizontalAlignment: Text.AlignHCenter
            elide: Text.ElideRight
        }

        GridLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: !card.mini && appController.overlayShowDetails && !card.rolesOnly && card.perkCount > 0
            columns: card.perkCount > 2 ? 2 : Math.max(1, card.perkCount)
            columnSpacing: 5
            rowSpacing: 5

            Repeater {
                model: card.perkCount

                delegate: Rectangle {
                    required property int index
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.minimumHeight: card.perkCount > 2 ? 48 : 70
                    color: "#e20b2033"
                    border.width: 1
                    border.color: "#315675"
                    radius: 2

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 4
                        spacing: 2

                        Image {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: (card.perkCount > 2 ? 30 : 40) * card.scaleFactor
                            Layout.preferredHeight: (card.perkCount > 2 ? 30 : 40) * card.scaleFactor
                            source: card.perkIcon(index)
                            fillMode: Image.PreserveAspectFit
                            asynchronous: true
                            cache: true
                        }

                        Text {
                            Layout.fillWidth: true
                            text: card.localizer
                                  ? card.localizer.perkName(card.heroKey, card.perkName(index))
                                  : card.perkName(index)
                            color: "#f7fbff"
                            font.family: "Rajdhani"
                            font.pixelSize: Math.round((card.perkCount > 2 ? 10 : 12) * card.scaleFactor)
                            font.bold: true
                            horizontalAlignment: Text.AlignHCenter
                            wrapMode: Text.Wrap
                            maximumLineCount: 2
                            elide: Text.ElideRight
                        }
                    }
                }
            }
        }
    }

    SequentialAnimation on opacity {
        running: card.revision >= 0
        loops: 1
        NumberAnimation { from: 0.55; to: 1; duration: 120; easing.type: Easing.OutCubic }
    }
}
