pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    property var window: ApplicationWindow.window
    property string filterSlotId: ""
    property bool rouletteMode: false
    readonly property color accent: moduleManager.activeMetadata.accent || "#f6a21a"

    function localText(es, en, pt, fr, de, ja, ko) {
        var locale = String(window.displayLocale || "es-mx")
        if (locale === "pt-br") return pt
        if (locale === "fr-fr") return fr
        if (locale === "de-de") return de
        if (locale === "ja-jp") return ja
        if (locale === "ko-kr") return ko
        return locale.indexOf("es-") === 0 ? es : en
    }

    function blockedFor(slotId) {
        var rows = moduleManager.activeSlots
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].id === slotId) return rows[i].blocked || []
        return []
    }

    function roleInfo(role) {
        var rows = moduleManager.activeRoles
        for (var i = 0; i < rows.length; ++i)
            if (rows[i].id === role) return rows[i]
        return {
            id: role,
            name: role || root.localText("Héroe", "Hero", "Herói", "Héros", "Held", "ヒーロー", "영웅"),
            color: root.accent
        }
    }

    function roleOptions(slot) {
        var rows = moduleManager.activeRoles
        var result = []
        for (let i = 0; i < rows.length; ++i) {
            let role = rows[i]
            result.push({
                label: role.name.substring(0, 3).toUpperCase(),
                tooltip: role.name,
                color: role.color,
                iconSource: "",
                active: (slot.roles || []).indexOf(role.id) >= 0,
                action: function() { moduleManager.toggleSlotRole(slot.id, role.id) }
            })
        }
        return result
    }

    function optionSignature(slot) {
        var options = slot.options || []
        var keys = []
        for (var i = 0; i < options.length; ++i) keys.push(options[i].key)
        return keys.join("|")
    }

    function priorityColor(priority) {
        if (priority === "max") return "#d79cff"
        if (priority === "high") return "#f2c46d"
        return "#7f9bb4"
    }

    function finalsItems(hero) {
        if (!hero) return []
        var rows = []
        if (hero.specialization)
            rows.push({ label: root.localText("ESPECIALIZACIÓN", "SPECIALIZATION", "ESPECIALIZAÇÃO", "SPÉCIALISATION", "SPEZIALISIERUNG", "スペシャライゼーション", "전문화"), name: hero.specialization.name, icon: hero.specialization.icon })
        if (hero.weapon)
            rows.push({ label: root.localText("ARMA", "WEAPON", "ARMA", "ARME", "WAFFE", "武器", "무기"), name: hero.weapon.name, icon: hero.weapon.icon })
        var gadgets = hero.gadgets || []
        for (var i = 0; i < gadgets.length; ++i)
            rows.push({ label: root.localText("ARTEFACTO ", "GADGET ", "GADGET ", "GADGET ", "GADGET ", "ガジェット ", "가젯 ") + (i + 1), name: gadgets[i].name, icon: gadgets[i].icon })
        return rows
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10

        Rectangle {
            Layout.preferredWidth: 326
            Layout.fillHeight: true
            visible: !root.rouletteMode
            color: window.panel
            border.color: window.line

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 8

                Text {
                    text: window.ui.prepare.toUpperCase()
                    color: root.accent
                    font.family: "Rajdhani"
                    font.pixelSize: 15
                    font.bold: true
                }

                Flickable {
                    id: railScroll
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    contentWidth: width
                    contentHeight: railColumn.implicitHeight
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds
                    ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

                    Column {
                        id: railColumn
                        width: railScroll.width - (railScroll.contentHeight > railScroll.height ? 10 : 0)
                        spacing: 8

                        SectionPanel {
                            width: parent.width
                            height: 106
                            title: window.ui.format.toUpperCase()
                            subtitle: root.localText("Equipo aleatorio o ruleta independiente.", "Random team or independent roulette.", "Equipe aleatória ou roleta independente.", "Équipe aléatoire ou roulette indépendante.", "Zufallsteam oder unabhängiges Roulette.", "ランダムチームまたは独立ルーレット。", "무작위 팀 또는 독립 룰렛.")
                            RowLayout {
                                anchors.fill: parent
                                spacing: 5
                                OWButton {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    text: root.localText("EQUIPO", "TEAM", "EQUIPE", "ÉQUIPE", "TEAM", "チーム", "팀")
                                    selected: !root.rouletteMode
                                    activeColor: root.accent
                                    onClicked: root.rouletteMode = false
                                }
                                OWButton {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    text: root.localText("RULETA", "ROULETTE", "ROLETA", "ROULETTE", "ROULETTE", "ルーレット", "룰렛")
                                    selected: root.rouletteMode
                                    activeColor: root.accent
                                    onClicked: { root.filterSlotId = ""; root.rouletteMode = true }
                                }
                            }
                        }

                        ProfileModePanel {
                            width: parent.width
                            visible: !root.rouletteMode
                            accent: root.accent
                            collectionMode: moduleManager.activeGame === "pvzgw2"
                        }

                        SectionPanel {
                            width: parent.width
                            height: Math.min(520, 130 + moduleManager.activeSlots.length * 72)
                            visible: !root.rouletteMode
                            title: window.ui.squad.toUpperCase()
                            subtitle: root.localText("Nombre, perfil y roles permitidos.", "Name, profile, and allowed roles.", "Nome, perfil e funções permitidas.", "Nom, profil et rôles autorisés.", "Name, Profil und erlaubte Rollen.", "名前、プロフィール、許可ロール。", "이름, 프로필, 허용 역할.")

                            ColumnLayout {
                                anchors.fill: parent
                                spacing: 6
                                RowLayout {
                                    Layout.fillWidth: true
                                    OWButton {
                                        Layout.preferredWidth: 52
                                        text: "−"
                                        enabled: moduleManager.activeSlots.length > 1
                                        onClicked: moduleManager.adjustPlayerCount(-1)
                                    }
                                    Text {
                                        Layout.fillWidth: true
                                        text: moduleManager.activeSlots.length + " " + window.ui.players
                                        color: window.text
                                        font.family: "Rajdhani"
                                        font.bold: true
                                        horizontalAlignment: Text.AlignHCenter
                                    }
                                    OWButton {
                                        Layout.preferredWidth: 52
                                        text: "+"
                                        enabled: moduleManager.activeSlots.length < moduleManager.activeMaxPlayers
                                        onClicked: moduleManager.adjustPlayerCount(1)
                                    }
                                }
                                ListView {
                                    id: squadList
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    model: moduleManager.activeSlotModel
                                    spacing: 5
                                    clip: true
                                    reuseItems: true
                                    cacheBuffer: appController.performanceMode === "high" ? 300 : 0
                                    ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }
                                    delegate: ModulePlayerRow {
                                        required property var modelData
                                        width: squadList.width - (squadList.contentHeight > squadList.height ? 10 : 0)
                                        playerIndex: modelData.slotIndex !== undefined ? modelData.slotIndex : index
                                        slotData: modelData
                                        controller: appController
                                        manager: moduleManager
                                        accent: root.accent
                                        optionTitle: "ROLES"
                                        roleOptions: root.roleOptions(modelData)
                                    }
                                }
                            }
                        }

                        SectionPanel {
                            width: parent.width
                            height: moduleManager.activeGame === "valorant" ? 165 : 112
                            visible: !root.rouletteMode
                            title: window.ui.rules.toUpperCase()
                            Column {
                                anchors.fill: parent
                                spacing: 5
                                ToggleRow {
                                    width: parent.width
                                    text: window.ui.unique
                                    checkedValue: !moduleManager.allowDuplicates
                                    activeColor: root.accent
                                    onClicked: moduleManager.setAllowDuplicates(!moduleManager.allowDuplicates)
                                }
                                ToggleRow {
                                    width: parent.width
                                    visible: moduleManager.activeGame === "valorant"
                                    text: "Solo personaje"
                                    checkedValue: moduleManager.valorantCharacterOnly
                                    activeColor: root.accent
                                    onClicked: moduleManager.setValorantCharacterOnly(!moduleManager.valorantCharacterOnly)
                                }
                            }
                        }

                        OWButton {
                            width: parent.width
                            height: 38
                            visible: !root.rouletteMode
                            text: window.ui.copy_image.toUpperCase()
                            onClicked: resultSurface.grabToImage(function(grab) {
                                appController.copyResultImage(grab.image, resultSurface.height)
                            })
                        }
                    }
                }

                OWButton {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 54
                    visible: !root.rouletteMode
                    text: window.ui.generate.toUpperCase()
                    selected: true
                    activeColor: root.accent
                    onClicked: {
                        appController.playUiSound("click")
                        moduleManager.generate("all")
                    }
                }
            }
        }

        ColumnLayout {
            id: resultSurface
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: !root.rouletteMode
            spacing: 6

            Text {
                text: String(moduleManager.activeMetadata.name).toUpperCase()
                color: root.accent
                font.family: "Rajdhani"
                font.pixelSize: 27
                font.bold: true
            }
            Text {
                text: moduleManager.activeSlots.length + " " + window.ui.players.toUpperCase()
                      + " · " + root.localText("CATÁLOGO LOCAL", "LOCAL CATALOG", "CATÁLOGO LOCAL", "CATALOGUE LOCAL", "LOKALER KATALOG", "ローカルカタログ", "로컬 카탈로그")
                color: window.muted
                font.pixelSize: 10
            }

            GridView {
                id: cards
                Layout.fillWidth: true
                Layout.fillHeight: true
                property int columns: Math.max(1, Math.min(count, Math.floor(width / 230)))
                cellWidth: width / Math.max(1, columns)
                cellHeight: moduleManager.activeGame === "valorant"
                            ? (moduleManager.valorantCharacterOnly ? 410 : 520)
                            : moduleManager.activeGame === "thefinals" ? 510 : 430
                model: moduleManager.activeSlotModel
                clip: true
                reuseItems: true
                cacheBuffer: appController.performanceMode === "high" ? cellHeight : 0
                boundsBehavior: Flickable.StopAtBounds
                ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

                delegate: Rectangle {
                    id: rosterCard
                    required property var modelData
                    property var role: root.roleInfo(modelData.hero ? modelData.hero.role : "")
                    property bool deadlockCard: moduleManager.activeGame === "deadlock"
                    property bool finalsCard: moduleManager.activeGame === "thefinals"
                    property string heroKey: deadlockCard
                                             ? root.optionSignature(modelData)
                                             : modelData.hero ? modelData.hero.key : ""
                    width: cards.cellWidth - 9
                    height: cards.cellHeight - 8
                    x: 4
                    y: 4
                    color: "#081725"
                    border.color: modelData.hero ? role.color : window.line
                    border.width: modelData.locked ? 3 : 2

                    onHeroKeyChanged: {
                        if (heroKey.length && appController.animationsEnabled
                                && appController.performanceMode !== "low")
                            rosterReveal.restart()
                    }
                    ParallelAnimation {
                        id: rosterReveal
                        NumberAnimation { target: rosterCard; property: "opacity"; from: 0.72; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                        NumberAnimation { target: rosterCard; property: "scale"; from: 0.985; to: 1; duration: appController.performanceMode === "high" ? 145 : 90; easing.type: Easing.OutCubic }
                    }

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 9
                        spacing: 6
                        Text {
                            Layout.fillWidth: true
                            text: modelData.name
                            color: modelData.profileName ? root.accent : window.muted
                            horizontalAlignment: Text.AlignHCenter
                            elide: Text.ElideRight
                        }
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: visible ? 20 : 0
                            visible: !!modelData.profileName
                            color: "#173957"
                            Text {
                                anchors.centerIn: parent
                                width: parent.width - 8
                                text: appController.profileModeName
                                color: root.accent
                                font.family: "Rajdhani"
                                font.pixelSize: 10
                                font.bold: true
                                horizontalAlignment: Text.AlignHCenter
                                elide: Text.ElideRight
                            }
                        }
                        Rectangle {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: Math.min(170, parent.width - 18)
                            Layout.preferredHeight: visible ? Layout.preferredWidth : 0
                            visible: !rosterCard.deadlockCard
                            color: "#0b2032"
                            border.color: modelData.hero ? role.color : window.line
                            Image {
                                anchors.fill: parent
                                anchors.margins: 2
                                source: modelData.hero ? modelData.hero.portrait : ""
                                sourceSize.width: 256
                                sourceSize.height: 256
                                fillMode: Image.PreserveAspectCrop
                                asynchronous: !rosterCard.finalsCard
                                cache: appController.performanceMode === "high"
                            }
                        }
                        Text {
                            Layout.fillWidth: true
                            visible: !rosterCard.deadlockCard
                            text: modelData.hero ? String(modelData.hero.name).toUpperCase()
                                                 : root.localText("SIN SELECCIÓN", "NO SELECTION", "SEM SELEÇÃO", "AUCUNE SÉLECTION", "KEINE AUSWAHL", "未選択", "선택 없음")
                            color: modelData.hero ? window.text : window.muted
                            font.family: "Rajdhani"
                            font.pixelSize: 20
                            font.bold: true
                            horizontalAlignment: Text.AlignHCenter
                            elide: Text.ElideRight
                        }
                        Text {
                            Layout.fillWidth: true
                            visible: !rosterCard.deadlockCard
                            text: modelData.hero ? role.name.toUpperCase()
                                                 : root.localText("PERSONAJE", "CHARACTER", "PERSONAGEM", "PERSONNAGE", "CHARAKTER", "キャラクター", "캐릭터")
                            color: modelData.hero ? role.color : window.muted
                            font.family: "Rajdhani"
                            font.pixelSize: 11
                            font.bold: true
                            horizontalAlignment: Text.AlignHCenter
                        }
                        ColumnLayout {
                            Layout.fillWidth: true
                            Layout.preferredHeight: rosterCard.deadlockCard ? 267 : 0
                            visible: rosterCard.deadlockCard
                            spacing: 5

                            Repeater {
                                model: modelData.options || []
                                delegate: Rectangle {
                                    required property var modelData
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 84
                                    color: "#0d2639"
                                    border.color: root.priorityColor(modelData.priority)

                                    RowLayout {
                                        anchors.fill: parent
                                        anchors.margins: 5
                                        spacing: 7
                                        Image {
                                            Layout.preferredWidth: 70
                                            Layout.preferredHeight: 70
                                            source: modelData.portrait
                                            sourceSize.width: 96
                                            sourceSize.height: 96
                                            fillMode: Image.PreserveAspectCrop
                                            asynchronous: false
                                            cache: true
                                        }
                                        ColumnLayout {
                                            Layout.fillWidth: true
                                            spacing: 1
                                            Text {
                                                Layout.fillWidth: true
                                                text: String(modelData.name).toUpperCase()
                                                color: window.text
                                                font.family: "Rajdhani"
                                                font.pixelSize: 15
                                                font.bold: true
                                                elide: Text.ElideRight
                                            }
                                            Text {
                                                Layout.fillWidth: true
                                                text: modelData.priorityLabel
                                                color: root.priorityColor(modelData.priority)
                                                font.family: "Rajdhani"
                                                font.pixelSize: 9
                                                font.bold: true
                                                wrapMode: Text.Wrap
                                            }
                                        }
                                    }
                                }
                            }
                            Text {
                                Layout.fillWidth: true
                                visible: (modelData.options || []).length === 0
                                text: root.localText("GENERA EL EQUIPO PARA CREAR LA TERNA", "GENERATE THE TEAM TO CREATE THREE OPTIONS", "GERE A EQUIPE PARA CRIAR TRÊS OPÇÕES", "GÉNÉREZ L'ÉQUIPE POUR CRÉER TROIS OPTIONS", "ERSTELLE DAS TEAM FÜR DREI OPTIONEN", "チームを生成して3つの候補を作成", "팀을 생성해 세 가지 후보 만들기")
                                color: window.muted
                                font.family: "Rajdhani"
                                font.pixelSize: 12
                                font.bold: true
                                horizontalAlignment: Text.AlignHCenter
                                wrapMode: Text.Wrap
                            }
                        }
                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 5
                            OWButton {
                                Layout.fillWidth: true
                                text: ""
                                iconSource: appController.assetUrl("data/assets/ui/reroll.png")
                                onClicked: moduleManager.reroll(modelData.id)
                                ToolTip.visible: hovered
                                ToolTip.text: window.ui.reroll
                            }
                            OWButton {
                                Layout.fillWidth: true
                                text: ""
                                iconSource: appController.assetUrl("data/assets/ui/filter.png")
                                onClicked: root.filterSlotId = modelData.id
                                ToolTip.visible: hovered
                                ToolTip.text: window.ui.filter
                            }
                            OWButton {
                                Layout.fillWidth: true
                                text: ""
                                iconSource: appController.assetUrl(modelData.locked
                                            ? "data/assets/ui/unlock.png" : "data/assets/ui/lock.png")
                                selected: modelData.locked
                                activeColor: root.accent
                                onClicked: moduleManager.toggleLock(modelData.id)
                            }
                        }
                        GridLayout {
                            Layout.fillWidth: true
                            Layout.preferredHeight: rosterCard.finalsCard ? 174 : 0
                            visible: rosterCard.finalsCard
                            columns: 2
                            rowSpacing: 5
                            columnSpacing: 5

                            Repeater {
                                model: root.finalsItems(modelData.hero)
                                delegate: Rectangle {
                                    required property var modelData
                                    required property int index
                                    Layout.fillWidth: true
                                    Layout.columnSpan: index === 4 ? 2 : 1
                                    Layout.preferredHeight: index < 2 ? 62 : 48
                                    color: "#0d2639"
                                    border.color: window.line

                                    RowLayout {
                                        anchors.fill: parent
                                        anchors.margins: 5
                                        spacing: 5
                                        Image {
                                            Layout.preferredWidth: index < 2 ? 42 : 32
                                            Layout.preferredHeight: Layout.preferredWidth
                                            source: modelData.icon || ""
                                            sourceSize.width: 64
                                            sourceSize.height: 64
                                            fillMode: Image.PreserveAspectFit
                                            asynchronous: false
                                        }
                                        ColumnLayout {
                                            Layout.fillWidth: true
                                            spacing: 0
                                            Text {
                                                text: modelData.label
                                                color: root.accent
                                                font.pixelSize: 8
                                                font.bold: true
                                            }
                                            Text {
                                                Layout.fillWidth: true
                                                text: modelData.name
                                                color: window.text
                                                font.family: "Rajdhani"
                                                font.pixelSize: index < 2 ? 12 : 10
                                                font.bold: true
                                                elide: Text.ElideRight
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        Repeater {
                            model: modelData.hero && !rosterCard.deadlockCard && !rosterCard.finalsCard
                                   && !(moduleManager.activeGame === "valorant" && moduleManager.valorantCharacterOnly)
                                   ? (modelData.hero.details || []) : []
                            delegate: Rectangle {
                                required property var modelData
                                Layout.fillWidth: true
                                Layout.preferredHeight: 48
                                color: "#0d2639"
                                border.color: window.line
                                Column {
                                    anchors.fill: parent
                                    anchors.margins: 6
                                    Text { text: modelData.label; color: root.accent; font.pixelSize: 8; font.bold: true }
                                    Text { width: parent.width; text: modelData.value; color: window.text; font.pixelSize: 10; elide: Text.ElideRight }
                                }
                            }
                        }
                        Item { Layout.fillHeight: true }
                    }
                }
            }
        }

        Loader {
            Layout.fillWidth: true
            Layout.fillHeight: true
            active: root.rouletteMode
            visible: active
            sourceComponent: Component {
                RivalsRoulette { onExitRequested: root.rouletteMode = false }
            }
        }
    }

    GameFilterPanel {
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        width: Math.min(390, parent.width * 0.38)
        visible: !root.rouletteMode && root.filterSlotId.length > 0
        slotId: root.filterSlotId
        blocked: root.blockedFor(root.filterSlotId)
        accent: root.accent
        soundKind: "click"
        onCloseRequested: root.filterSlotId = ""
    }
}
