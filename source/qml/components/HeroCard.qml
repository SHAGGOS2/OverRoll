import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: card
    required property int pickIndex
    required property string playerName
    required property string profileTag
    required property string heroKey
    required property string heroName
    required property string role
    required property string roleName
    required property string subroleName
    required property string portrait
    required property string roleIcon
    required property string largeRoleIcon
    required property string subroleIcon
    required property color accent
    required property int perkCount
    required property string perk0Name
    required property string perk0Description
    required property string perk0Icon
    required property string perk1Name
    required property string perk1Description
    required property string perk1Icon
    required property string perk2Name
    required property string perk2Description
    required property string perk2Icon
    required property string perk3Name
    required property string perk3Description
    required property string perk3Icon
    required property bool rolesOnly
    required property bool pinned
    required property int revision
    property var controller
    property var localizer
    property bool compact: true
    property bool animations: true
    property bool filterOpen: false
    property var filterRows: []
    property int previousRevision: -1
    property string displayedPortrait: ""
    property string incomingPortrait: ""
    function perkName(index) {
        return index === 0 ? perk0Name : index === 1 ? perk1Name : index === 2 ? perk2Name : perk3Name
    }
    function perkDescription(index) {
        return index === 0 ? perk0Description : index === 1 ? perk1Description : index === 2 ? perk2Description : perk3Description
    }
    function perkIcon(index) {
        return index === 0 ? perk0Icon : index === 1 ? perk1Icon : index === 2 ? perk2Icon : perk3Icon
    }
    function localizedLabel(spanish, english, portuguese, french, german, japanese, korean) {
        var locale = String(card.controller ? card.controller.locale : "")
        if (locale.indexOf("es-") === 0) return spanish
        if (locale.indexOf("pt-") === 0) return portuguese
        if (locale.indexOf("fr-") === 0) return french
        if (locale.indexOf("de-") === 0) return german
        if (locale.indexOf("ja-") === 0) return japanese
        if (locale.indexOf("ko-") === 0) return korean
        return english
    }
    clip: true
    color: "#071421"
    border.width: 2
    border.color: accent
    radius: 2

    Rectangle {
        anchors.left: parent.left
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        width: 5
        color: card.accent
    }

    Item {
        id: revealContent
        anchors.fill: parent
        anchors.leftMargin: 5
        opacity: 1
        scale: 1

        StackLayout {
            anchors.fill: parent
            currentIndex: card.filterOpen ? 1 : 0

            Item {
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 10
                    spacing: 6

                    Text {
                        Layout.fillWidth: true
                        text: card.playerName
                        color: "#aac5dc"
                        font.family: "Rajdhani"
                        font.pixelSize: 11
                        horizontalAlignment: Text.AlignHCenter
                        elide: Text.ElideRight
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: card.profileTag.length ? 20 : 0
                        visible: card.profileTag.length > 0
                        color: "#173451"
                        Text {
                            anchors.fill: parent
                            anchors.margins: 2
                            text: card.localizer ? card.localizer.localizeProfileTag(card.profileTag) : card.profileTag
                            color: "#ffb72f"
                            font.family: "Rajdhani"
                            font.pixelSize: 9
                            font.weight: Font.DemiBold
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                            elide: Text.ElideRight
                        }
                    }

                    Item {
                        Layout.fillWidth: true
                        Layout.preferredHeight: card.rolesOnly ? 176 : 128

                        Image {
                            id: roleOnlyImage
                            anchors.centerIn: parent
                            width: 142
                            height: 142
                            visible: card.rolesOnly
                            source: card.largeRoleIcon
                            sourceSize.width: 180
                            sourceSize.height: 180
                            fillMode: Image.PreserveAspectFit
                            cache: true
                            asynchronous: false
                        }

                        Rectangle {
                            anchors.centerIn: parent
                            width: 124
                            height: 124
                            visible: !card.rolesOnly
                            color: "#0b1e31"
                            border.color: "#f6a21a"
                            border.width: 1
                            clip: true

                            Image {
                                id: previousPortrait
                                anchors.fill: parent
                                source: card.displayedPortrait
                                sourceSize.width: 160
                                sourceSize.height: 160
                                fillMode: Image.PreserveAspectCrop
                                cache: true
                                asynchronous: false
                            }

                            Image {
                                id: nextPortrait
                                anchors.fill: parent
                                source: card.incomingPortrait
                                sourceSize.width: 160
                                sourceSize.height: 160
                                fillMode: Image.PreserveAspectCrop
                                cache: true
                                asynchronous: false
                                opacity: 0
                                onStatusChanged: {
                                    if (status !== Image.Ready || card.incomingPortrait.length === 0) return
                                    if (card.animations) portraitFade.restart()
                                    else {
                                        card.displayedPortrait = card.incomingPortrait
                                        card.incomingPortrait = ""
                                    }
                                }
                            }

                            Rectangle {
                                anchors.left: parent.left
                                anchors.right: parent.right
                                anchors.bottom: parent.bottom
                                height: 4
                                color: card.accent
                            }
                        }
                    }

                    Text {
                        Layout.fillWidth: true
                        text: (card.localizer ? card.localizer.heroName(card.heroKey, card.heroName) : card.heroName).toUpperCase()
                        color: "#f6f8fb"
                        font.family: "Rajdhani"
                        font.pixelSize: card.rolesOnly ? 24 : 20
                        font.weight: Font.DemiBold
                        horizontalAlignment: Text.AlignHCenter
                        elide: Text.ElideRight
                    }

                    RowLayout {
                        Layout.alignment: Qt.AlignHCenter
                        spacing: 6
                        Image {
                            Layout.preferredWidth: 20
                            Layout.preferredHeight: 20
                            source: card.roleIcon
                            sourceSize.width: 24
                            sourceSize.height: 24
                            fillMode: Image.PreserveAspectFit
                        }
                        Text {
                            text: (card.localizer ? card.localizer.roleName(card.role, card.roleName) : card.roleName).toUpperCase()
                            color: card.accent
                            font.family: "Rajdhani"
                            font.pixelSize: 10
                            font.bold: true
                        }
                        Image {
                            Layout.preferredWidth: card.subroleIcon.length ? 20 : 0
                            Layout.preferredHeight: 20
                            visible: card.subroleIcon.length > 0
                            source: card.subroleIcon
                            sourceSize.width: 24
                            sourceSize.height: 24
                            fillMode: Image.PreserveAspectFit
                        }
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.preferredHeight: card.rolesOnly ? 0 : 38
                        Layout.minimumHeight: card.rolesOnly ? 0 : 38
                        Layout.maximumHeight: card.rolesOnly ? 0 : 38
                        visible: !card.rolesOnly
                        spacing: 5
                        ToolIconButton {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            iconKind: "reroll"
                            activeColor: card.accent
                            enabled: !card.pinned
                            opacity: enabled ? 1 : 0.45
                            onClicked: card.controller.reroll(card.pickIndex)
                            ToolTip.visible: hovered
                            ToolTip.text: card.localizer ? card.localizer.t("reroll") : card.controller.tr("reroll")
                        }
                        ToolIconButton {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            iconKind: "menu"
                            activeColor: card.accent
                            onClicked: {
                                card.controller.playUiSound("filter")
                                card.filterOpen = true
                                card.filterRows = card.controller.filterHeroes(card.pickIndex, "")
                            }
                            ToolTip.visible: hovered
                            ToolTip.text: card.localizer ? card.localizer.t("filter") : card.controller.tr("filter")
                        }
                        ToolIconButton {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            iconKind: "lock"
                            activeColor: card.pinned ? "#f6a21a" : card.accent
                            onClicked: card.controller.togglePickPinned(card.pickIndex)
                            ToolTip.visible: hovered
                            ToolTip.text: card.pinned
                                ? card.localizedLabel("Desfijar héroe", "Unpin hero", "Desafixar herói", "Détacher le héros", "Held lösen", "固定解除", "영웅 고정 해제")
                                : card.localizedLabel("Fijar héroe", "Pin hero", "Fixar herói", "Épingler le héros", "Held fixieren", "ヒーローを固定", "영웅 고정")
                        }
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        visible: !card.rolesOnly
                        color: "#06101b"
                        border.color: "#173753"
                        clip: true

                        Flickable {
                            id: perkScroll
                            anchors.fill: parent
                            anchors.margins: 5
                            contentWidth: width
                            contentHeight: Math.max(height, perkLayout.implicitHeight)
                            boundsBehavior: Flickable.StopAtBounds
                            clip: true
                            ScrollBar.vertical: ScrollBar { policy: perkScroll.contentHeight > perkScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }

                            GridLayout {
                                id: perkLayout
                                width: perkScroll.width - (perkScroll.contentHeight > perkScroll.height ? 10 : 0)
                                columns: 2
                                columnSpacing: 4
                                rowSpacing: 4

                                Repeater {
                                    model: card.perkCount
                                    delegate: Rectangle {
                                        required property int index
                                        Layout.preferredWidth: (perkLayout.width - perkLayout.columnSpacing) / 2
                                        Layout.preferredHeight: card.compact
                                                                ? (card.perkCount > 2 ? 118 : Math.max(112, perkScroll.height - 2))
                                                                : (card.perkCount > 2 ? 210 : Math.max(180, perkScroll.height - 2))
                                        color: "#0c2033"
                                        border.color: "#264966"
                                        radius: 1

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 7
                                            spacing: 4
                                            Image {
                                                Layout.alignment: Qt.AlignHCenter
                                                Layout.preferredWidth: card.compact ? 52 : 38
                                                Layout.preferredHeight: card.compact ? 52 : 38
                                                source: card.perkIcon(index)
                                                sourceSize.width: 64
                                                sourceSize.height: 64
                                                fillMode: Image.PreserveAspectFit
                                                cache: true
                                                asynchronous: false
                                            }
                                            Text {
                                                Layout.fillWidth: true
                                                text: card.localizer ? card.localizer.perkName(card.heroKey, card.perkName(index)) : card.perkName(index)
                                                color: "#f5f7fa"
                                                font.family: "Rajdhani"
                                                font.pixelSize: card.compact ? 12 : 11
                                                font.weight: Font.DemiBold
                                                horizontalAlignment: Text.AlignHCenter
                                                wrapMode: Text.Wrap
                                                maximumLineCount: 2
                                                elide: Text.ElideRight
                                            }
                                            Text {
                                                Layout.fillWidth: true
                                                Layout.fillHeight: true
                                                visible: !card.compact
                                                text: card.localizer ? card.localizer.perkDescription(card.heroKey, card.perkDescription(index)) : card.perkDescription(index)
                                                color: "#b6cce0"
                                                font.family: "Open Sans"
                                                font.pixelSize: 9
                                                wrapMode: Text.Wrap
                                                maximumLineCount: 10
                                                elide: Text.ElideRight
                                            }
                                            Item { Layout.fillHeight: card.compact }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Item {
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 10
                    spacing: 7
                    RowLayout {
                        Layout.fillWidth: true
                        Text {
                            Layout.fillWidth: true
                            text: (card.localizer ? card.localizer.t("filter") : card.controller.tr("filter")).toUpperCase() + " · " + card.playerName
                            color: "#f6a21a"
                            font.family: "Rajdhani"
                            font.pixelSize: 13
                            font.bold: true
                            elide: Text.ElideRight
                        }
                        OWButton {
                            Layout.preferredWidth: 40
                            text: "×"
                            onClicked: card.filterOpen = false
                        }
                    }
                    TextField {
                        id: filterSearch
                        Layout.fillWidth: true
                        Layout.preferredHeight: 36
                        placeholderText: card.localizer ? card.localizer.t("search") : card.controller.tr("search")
                        color: "#f4f7fb"
                        placeholderTextColor: "#6f8ca5"
                        leftPadding: 10
                        background: Rectangle { color: "#0c2033"; border.color: filterSearch.activeFocus ? "#48ccff" : "#244a69" }
                        onTextChanged: filterDebounce.restart()
                    }
                    Timer {
                        id: filterDebounce
                        interval: 90
                        onTriggered: card.filterRows = card.controller.filterHeroes(card.pickIndex, filterSearch.text)
                    }
                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        Repeater {
                            model: ["tank", "damage", "support"]
                            delegate: OWButton {
                                required property string modelData
                                Layout.fillWidth: true
                                text: (card.localizer ? card.localizer.t(modelData) : card.controller.tr(modelData)).toUpperCase()
                                activeColor: modelData === "tank" ? "#39c4ff" : modelData === "damage" ? "#ff5a6c" : "#5ce1a2"
                                onClicked: {
                                    card.controller.toggleFilterRole(card.pickIndex, modelData)
                                    card.filterRows = card.controller.filterHeroes(card.pickIndex, filterSearch.text)
                                }
                            }
                        }
                    }
                    Text {
                        Layout.fillWidth: true
                        property int blocked: card.filterRows.filter(function(item) { return !item.allowed }).length
                        text: (card.localizer ? card.localizer.t("visible") : card.controller.tr("visible")).replace("{visible}", card.filterRows.length).replace("{blocked}", blocked)
                        color: "#90aec8"
                        font.family: "Open Sans"
                        font.pixelSize: 10
                    }
                    ListView {
                        id: filterList
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: card.filterRows
                        clip: true
                        reuseItems: true
                        cacheBuffer: 0
                        spacing: 3
                        boundsBehavior: Flickable.StopAtBounds
                        ScrollBar.vertical: ScrollBar { policy: ScrollBar.AlwaysOn }
                        delegate: Rectangle {
                            required property var modelData
                            width: filterList.width - 12
                            height: 42
                            color: modelData.profileLocked ? "#151b27" : modelData.allowed ? "#14304b" : "#2a1923"
                            border.color: modelData.allowed ? "#28577a" : "#8f3344"
                            opacity: modelData.profileLocked ? 0.55 : 1
                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 4
                                Image { Layout.preferredWidth: 32; Layout.preferredHeight: 32; source: modelData.portrait; sourceSize.width: 40; sourceSize.height: 40; fillMode: Image.PreserveAspectCrop; cache: true; asynchronous: false }
                                Text { Layout.fillWidth: true; text: card.localizer ? card.localizer.heroName(modelData.key, modelData.name) : modelData.name; color: "#f5f7fa"; font.family: "Rajdhani"; font.pixelSize: 11; elide: Text.ElideRight }
                                Text { text: card.localizer ? card.localizer.filterState(modelData.profileLocked, modelData.allowed) : (modelData.profileLocked ? "PERFIL" : modelData.allowed ? "ON" : "OFF"); color: modelData.allowed ? "#63e5aa" : "#ff6574"; font.family: "Rajdhani"; font.pixelSize: 9; font.bold: true }
                            }
                            MouseArea {
                                anchors.fill: parent
                                enabled: !modelData.profileLocked
                                onClicked: {
                                    card.controller.toggleHeroBan(card.pickIndex, modelData.key)
                                    card.filterRows = card.controller.filterHeroes(card.pickIndex, filterSearch.text)
                                }
                            }
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        text: (card.localizer ? card.localizer.t("reset_filters") : card.controller.tr("reset_filters")).toUpperCase()
                        onClicked: {
                            card.controller.resetFilters(card.pickIndex)
                            card.filterRows = card.controller.filterHeroes(card.pickIndex, filterSearch.text)
                        }
                    }
                }
            }
        }
    }

    Rectangle {
        id: sweep
        y: 0
        x: -width
        width: 38
        height: parent.height
        color: card.accent
        opacity: 0
    }

    SequentialAnimation {
        id: reveal
        PropertyAction { target: sweep; property: "x"; value: -sweep.width }
        PropertyAction { target: sweep; property: "opacity"; value: 0.10 }
        NumberAnimation { target: sweep; property: "x"; to: card.width; duration: 125; easing.type: Easing.OutQuad }
        PropertyAction { target: sweep; property: "opacity"; value: 0 }
    }

    ParallelAnimation {
        id: portraitFade
        NumberAnimation { target: nextPortrait; property: "opacity"; from: 0; to: 1; duration: 110; easing.type: Easing.OutCubic }
        NumberAnimation { target: previousPortrait; property: "opacity"; from: 1; to: 0.25; duration: 110; easing.type: Easing.OutCubic }
        onFinished: {
            card.displayedPortrait = card.incomingPortrait
            card.incomingPortrait = ""
            previousPortrait.opacity = 1
            nextPortrait.opacity = 0
        }
    }

    Component.onCompleted: {
        previousRevision = revision
        displayedPortrait = portrait
    }
    onPortraitChanged: {
        if (previousRevision < 0 || displayedPortrait.length === 0) {
            displayedPortrait = portrait
        } else if (portrait !== displayedPortrait) {
            portraitFade.stop()
            previousPortrait.opacity = 1
            nextPortrait.opacity = 0
            incomingPortrait = portrait
        }
    }
    onRevisionChanged: {
        if (previousRevision >= 0 && animations) {
            reveal.stop()
            sweep.opacity = 0
            reveal.start()
        }
        previousRevision = revision
    }
}
