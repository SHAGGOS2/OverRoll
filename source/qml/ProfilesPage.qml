pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    objectName: "profilesPage"
    required property var localizer
    property var window: localizer
    property var ui: localizer.ui

    function localText(es, en, pt, fr, de, ja, ko) {
        var locale = String(window.displayLocale || appController.locale || "es-mx").toLowerCase()
        if (locale.indexOf("pt") === 0) return pt || en
        if (locale.indexOf("fr") === 0) return fr || en
        if (locale.indexOf("de") === 0) return de || en
        if (locale.indexOf("ja") === 0) return ja || en
        if (locale.indexOf("ko") === 0) return ko || en
        if (locale.indexOf("es") === 0) return es
        return en
    }

    function profileRoleRows() {
        return appController.profileGameRoles
    }

    Loader { id: fileDialogLoader; active: source.toString().length > 0 }
    Connections {
        target: fileDialogLoader.item
        function onFileChosen(fileUrl) {
            if (fileDialogLoader.item && fileDialogLoader.item.saveMode)
                appController.exportProfiles(fileUrl)
            else
                appController.importProfiles(fileUrl)
        }
        function onClosed() { fileDialogLoader.source = "" }
    }

    function openProfileDialog(saveMode) {
        fileDialogLoader.setSource("ProfileFileDialog.qml", {
            saveMode: saveMode,
            dialogTitle: saveMode ? ui.export_profiles : ui.import_profiles
        })
    }

    Popup {
        id: profileActionsPopup
        x: Math.max(12, root.width - width - 24)
        y: 122
        width: 230
        padding: 8
        modal: false
        closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
        background: Rectangle { color: "#071521"; border.color: window.cyan }
        contentItem: ColumnLayout {
            spacing: 6
            Text {
                Layout.fillWidth: true
                text: appController.currentProfileName || ui.no_profile
                color: window.orange
                font.family: "Rajdhani"
                font.pixelSize: 13
                font.bold: true
                elide: Text.ElideRight
            }
            OWButton { Layout.fillWidth: true; text: ui.import_profiles; onClicked: { profileActionsPopup.close(); root.openProfileDialog(false) } }
            OWButton { Layout.fillWidth: true; text: ui.export_profiles; onClicked: { profileActionsPopup.close(); root.openProfileDialog(true) } }
            OWButton { Layout.fillWidth: true; text: ui.delete_profile; danger: true; onClicked: { profileActionsPopup.close(); appController.deleteProfile() } }
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 10

        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 48
            spacing: 10
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0
                Text {
                    text: ui.profiles
                    color: window.text
                    font.family: "Rajdhani"
                    font.pixelSize: 27
                    font.weight: Font.DemiBold
                }
                Text {
                    Layout.fillWidth: true
                    text: ui.classify_help
                    color: window.muted
                    font.family: "Open Sans"
                    font.pixelSize: 10
                    elide: Text.ElideRight
                }
            }
            OWButton {
                Layout.preferredWidth: 132
                Layout.preferredHeight: 36
                text: window.navigationText("stats")
                onClicked: window.navigatePage("stats")
            }
            OWButton {
                Layout.preferredWidth: 112
                Layout.preferredHeight: 36
                text: ui.profile + "..."
                onClicked: profileActionsPopup.open()
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 52
            color: window.panel
            border.color: window.line
            RowLayout {
                anchors.fill: parent
                anchors.margins: 7
                spacing: 6
                Text {
                    text: root.localText("JUEGO DEL PERFIL", "PROFILE GAME", "JOGO DO PERFIL", "JEU DU PROFIL", "PROFILSPIEL", "プロフィールのゲーム", "프로필 게임")
                    color: window.orange
                    font.family: "Rajdhani"
                    font.pixelSize: 13
                    font.bold: true
                }
                Flickable {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    contentWidth: gameRow.implicitWidth
                    contentHeight: height
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds
                    Row {
                        id: gameRow
                        spacing: 5
                        Repeater {
                            model: appController.profileGames
                            delegate: OWButton {
                                required property var modelData
                                width: 125
                                height: 36
                                text: modelData.name
                                selected: appController.profileGame === modelData.id
                                onClicked: appController.setProfileGame(modelData.id)
                            }
                        }
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: visible ? 86 : 0
            visible: appController.profileGame !== "pvzgw2"
            color: window.panel
            border.color: window.line
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 9
                spacing: 5
                RowLayout {
                    Layout.fillWidth: true
                    Text {
                        text: ui.profile_mode
                        color: window.orange
                        font.family: "Rajdhani"
                        font.pixelSize: 14
                        font.bold: true
                    }
                    DarkComboBox {
                        id: profileModeBox
                        Layout.preferredWidth: 240
                        Layout.preferredHeight: 34
                        model: window.customLocale ? window.localizedProfileModes : appController.profileModes
                        textRole: "name"
                        valueRole: "id"
                        displayText: window.profileModeName(appController.profileMode)
                        currentIndex: indexOfValue(appController.profileMode)
                        onActivated: appController.setProfileMode(currentValue)
                    }
                    Item { Layout.fillWidth: true }
                    Text {
                        text: appController.currentProfileName || ui.no_profile
                        color: window.cyan
                        font.family: "Rajdhani"
                        font.pixelSize: 12
                        font.bold: true
                    }
                }
                Text {
                    Layout.fillWidth: true
                    text: window.profileModeDescription(appController.profileMode)
                    color: window.muted
                    font.family: "Open Sans"
                    font.pixelSize: 9
                    maximumLineCount: 2
                    wrapMode: Text.Wrap
                    elide: Text.ElideRight
                }
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 10

            Rectangle {
                Layout.preferredWidth: Math.min(360, root.width * 0.29)
                Layout.minimumWidth: 310
                Layout.fillHeight: true
                color: window.panel
                border.color: window.line

                Flickable {
                    id: profileSetupScroll
                    anchors.fill: parent
                    anchors.margins: 9
                    clip: true
                    contentWidth: width
                    contentHeight: profileSetupColumn.implicitHeight
                    boundsBehavior: Flickable.StopAtBounds
                    ScrollBar.vertical: ScrollBar { policy: profileSetupScroll.contentHeight > profileSetupScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }

                    Column {
                        id: profileSetupColumn
                        width: profileSetupScroll.width - (profileSetupScroll.contentHeight > profileSetupScroll.height ? 10 : 0)
                        spacing: 8

                        Text {
                            width: parent.width
                            text: "1. " + ui.profile
                            color: window.orange
                            font.family: "Rajdhani"
                            font.pixelSize: 17
                            font.bold: true
                        }

                        DarkComboBox {
                            id: savedProfileBox
                            width: parent.width
                            height: 38
                            model: appController.profilesList
                            textRole: "name"
                            valueRole: "id"
                            displayText: appController.currentProfileName || ui.no_profile
                            currentIndex: indexOfValue(appController.currentProfileId)
                            onActivated: appController.selectProfile(currentValue)
                        }

                        OWButton {
                            width: parent.width
                            height: 38
                            text: ui.new_profile
                            selected: true
                            onClicked: appController.newProfile()
                        }

                        Rectangle { width: parent.width; height: 1; color: window.line }

                        Text {
                            width: parent.width
                            text: ui.profile_identity
                            color: window.text
                            font.family: "Rajdhani"
                            font.pixelSize: 14
                            font.bold: true
                        }
                        TextField {
                            id: profileNameField
                            width: parent.width
                            height: 38
                            text: appController.currentProfileName
                            enabled: appController.currentProfileId.length > 0
                            color: window.text
                            selectByMouse: true
                            leftPadding: 10
                            placeholderText: ui.profile_name
                            onAccepted: appController.renameCurrentProfile(text)
                            background: Rectangle { color: "#0b1e31"; border.color: profileNameField.activeFocus ? window.cyan : window.line }
                        }
                        OWButton {
                            width: parent.width
                            height: 36
                            text: ui.save_name
                            enabled: appController.currentProfileId.length > 0
                            onClicked: appController.renameCurrentProfile(profileNameField.text)
                        }

                        Rectangle { width: parent.width; height: 1; color: window.line }

                        Text {
                            width: parent.width
                            text: "2. " + ui.assign_player
                            color: window.text
                            font.family: "Rajdhani"
                            font.pixelSize: 14
                            font.bold: true
                        }
                        DarkComboBox {
                            id: assignPlayerBox
                            width: parent.width
                            height: 38
                            model: appController.profilePlayerNames
                        }
                        Row {
                            width: parent.width
                            spacing: 6
                            OWButton {
                                width: (parent.width - 6) / 2
                                height: 36
                                text: ui.assign
                                selected: true
                                enabled: appController.currentProfileId.length > 0
                                onClicked: appController.assignPlayerProfile(assignPlayerBox.currentIndex, appController.currentProfileId)
                            }
                            OWButton {
                                width: (parent.width - 6) / 2
                                height: 36
                                text: ui.remove
                                onClicked: appController.assignPlayerProfile(assignPlayerBox.currentIndex, "")
                            }
                        }

                        Rectangle { width: parent.width; height: 1; color: window.line }

                        Text {
                            width: parent.width
                            height: visible ? implicitHeight : 0
                            visible: appController.profileGame === "overwatch"
                            text: "3. " + window.ss("profile_connection")
                            color: window.text
                            font.family: "Rajdhani"
                            font.pixelSize: 14
                            font.bold: true
                        }
                        Row {
                            width: parent.width
                            height: visible ? implicitHeight : 0
                            visible: appController.profileGame === "overwatch"
                            spacing: 4
                            Repeater {
                                model: [
                                    { id: "manual", label: window.ss("manual") },
                                    { id: "synced", label: window.ss("synced") },
                                    { id: "hybrid", label: window.ss("hybrid") }
                                ]
                                delegate: OWButton {
                                    required property var modelData
                                    width: (profileSetupColumn.width - 8) / 3
                                    height: 34
                                    text: modelData.label
                                    selected: window.currentSyncConfig().mode === modelData.id
                                    onClicked: window.setConnectionMode(modelData.id)
                                }
                            }
                        }
                        Text {
                            width: parent.width
                            height: visible ? implicitHeight : 0
                            visible: appController.profileGame === "overwatch"
                            text: window.currentSyncConfig().mode === "manual" ? window.ss("manual_help")
                                  : window.currentSyncConfig().mode === "synced" ? window.ss("synced_help")
                                  : window.ss("hybrid_help")
                            color: window.muted
                            font.family: "Open Sans"
                            font.pixelSize: 9
                            wrapMode: Text.Wrap
                        }

                        TextField {
                            id: battleTagField
                            width: parent.width
                            height: visible ? 38 : 0
                            visible: appController.profileGame === "overwatch" && window.currentSyncConfig().mode !== "manual"
                            text: window.currentSyncConfig().battleTag
                            placeholderText: window.ss("battletag")
                            color: window.text
                            placeholderTextColor: "#6987a2"
                            leftPadding: 10
                            onEditingFinished: window.updateSyncConfig({ battleTag: text })
                            background: Rectangle { color: "#0b1e31"; border.color: battleTagField.activeFocus ? window.cyan : window.line }
                        }
                        Row {
                            width: parent.width
                            height: visible ? 34 : 0
                            visible: appController.profileGame === "overwatch" && window.currentSyncConfig().mode !== "manual"
                            spacing: 5
                            OWButton {
                                width: (parent.width - 5) / 2
                                height: 34
                                text: "PC"
                                selected: window.currentSyncConfig().platform === "pc"
                                onClicked: window.updateSyncConfig({ platform: "pc" })
                            }
                            OWButton {
                                width: (parent.width - 5) / 2
                                height: 34
                                text: window.ss("console")
                                selected: window.currentSyncConfig().platform === "console"
                                onClicked: window.updateSyncConfig({ platform: "console" })
                            }
                        }
                        OWButton {
                            width: parent.width
                            height: visible ? 38 : 0
                            visible: appController.profileGame === "overwatch" && window.currentSyncConfig().mode !== "manual"
                            text: window.ss("synchronize")
                            selected: true
                            onClicked: {
                                window.updateSyncConfig({ battleTag: battleTagField.text })
                                window.synchronizeCurrentProfile()
                            }
                        }
                        Text {
                            width: parent.width
                            height: visible ? implicitHeight : 0
                            visible: appController.profileGame === "overwatch" && window.currentSyncConfig().mode !== "manual"
                            text: window.syncStatus || window.ss("classification_note")
                            color: window.syncStatus.indexOf(window.ss("sync_failed")) === 0 ? "#ff6375" : window.muted
                            font.family: "Open Sans"
                            font.pixelSize: 9
                            wrapMode: Text.Wrap
                        }
                    }
                }
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: window.panel
                border.color: window.line

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 9
                    spacing: 7

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 40
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 0
                            Text {
                                text: appController.profileGame === "pvzgw2"
                                      ? root.localText("COLECCIÓN DE VARIANTES", "VARIANT COLLECTION", "COLEÇÃO DE VARIANTES", "COLLECTION DE VARIANTES", "VARIANTEN-SAMMLUNG", "バリエーションコレクション", "변형 컬렉션")
                                      : ui.classify
                                color: window.text
                                font.family: "Rajdhani"
                                font.pixelSize: 20
                                font.bold: true
                            }
                            Text { text: appController.currentProfileName || ui.no_profile; color: window.orange; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true }
                        }
                        TextField {
                            id: profileSearchField
                            Layout.preferredWidth: 270
                            Layout.preferredHeight: 36
                            placeholderText: ui.search
                            color: window.text
                            placeholderTextColor: "#6987a2"
                            leftPadding: 10
                            onTextChanged: appController.setProfileSearch(text)
                            background: Rectangle { color: "#0b1e31"; border.color: profileSearchField.activeFocus ? window.cyan : window.line }
                        }
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.preferredHeight: visible ? 34 : 0
                        visible: appController.profileGame !== "lastflag"
                                 && appController.profileGame !== "fragpunk"
                        spacing: 5
                        Repeater {
                            model: root.profileRoleRows()
                            delegate: OWButton {
                                required property var modelData
                                Layout.fillWidth: true
                                Layout.preferredHeight: 34
                                text: modelData.label
                                selected: appController.profileRole === modelData.id
                                onClicked: appController.setProfileRole(modelData.id)
                            }
                        }
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 32
                        color: "#071521"
                        border.color: window.line
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 56
                            anchors.rightMargin: 8
                            spacing: 5
                            Text { Layout.fillWidth: true; text: ui.hero; color: window.muted; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true }
                            Repeater {
                                model: appController.profileGame === "pvzgw2"
                                       ? [
                                           root.localText("La tengo", "Owned", "Possuo", "Possédée", "Im Besitz", "所持", "보유"),
                                           root.localText("Favorita", "Favorite", "Favorita", "Favorite", "Favorit", "お気に入り", "즐겨찾기"),
                                           root.localText("Bloqueada", "Blocked", "Bloqueada", "Bloquée", "Blockiert", "ブロック", "차단")
                                         ]
                                       : [window.ss("bucket_main"), window.ss("bucket_used"), window.ss("bucket_practice"), window.ss("bucket_unused")]
                                delegate: Text {
                                    required property string modelData
                                    Layout.preferredWidth: appController.profileGame === "pvzgw2" ? 104 : 94
                                    text: modelData
                                    color: window.muted
                                    font.family: "Rajdhani"
                                    font.pixelSize: 9
                                    font.bold: true
                                    horizontalAlignment: Text.AlignHCenter
                                    elide: Text.ElideRight
                                }
                            }
                            Item {
                                visible: appController.profileGame === "overwatch" && window.currentSyncConfig().mode === "hybrid"
                                Layout.preferredWidth: visible ? 72 : 0
                            }
                        }
                    }

                    ListView {
                        id: profileHeroList
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: appController.profileHeroModel
                        clip: true
                        reuseItems: true
                        cacheBuffer: 420
                        spacing: 4
                        boundsBehavior: Flickable.StopAtBounds
                        ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

                        delegate: Rectangle {
                            id: heroRow
                            required property int index
                            required property string key
                            required property string name
                            required property string game
                            required property string role
                            required property string roleName
                            required property string subrole
                            required property string portrait
                            required property string bucket
                            required property string baseKey
                            required property string baseName
                            required property bool owned
                            required property bool favorite
                            required property bool blocked
                            width: profileHeroList.width - (profileHeroList.contentHeight > profileHeroList.height ? 12 : 0)
                            height: 64
                            color: index % 2 ? "#091a2a" : "#0b1e31"
                            border.color: bucket === "main" ? "#f6a21a"
                                          : bucket === "played" ? "#44baff"
                                          : bucket === "practice" ? "#a783ff"
                                          : bucket === "avoid" ? "#ff5b69" : window.line
                            border.width: bucket.length ? 2 : 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 6
                                spacing: 5
                                Image {
                                    Layout.preferredWidth: 44
                                    Layout.preferredHeight: 44
                                    source: heroRow.portrait
                                    sourceSize.width: 52
                                    sourceSize.height: 52
                                    fillMode: Image.PreserveAspectCrop
                                    cache: true
                                    asynchronous: true
                                }
                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 0
                                    Text {
                                        Layout.fillWidth: true
                                        text: heroRow.game === "overwatch" ? window.heroName(heroRow.key, heroRow.name) : heroRow.name
                                        color: window.text
                                        font.family: "Rajdhani"
                                        font.pixelSize: 13
                                        font.bold: true
                                        elide: Text.ElideRight
                                    }
                                    Text {
                                        Layout.fillWidth: true
                                        visible: appController.profileGame !== "lastflag"
                                                 && appController.profileGame !== "fragpunk"
                                        text: (heroRow.game === "overwatch" ? window.roleName(heroRow.role, heroRow.roleName) : heroRow.roleName).toUpperCase()
                                              + (heroRow.subrole.length ? " . " + window.subroleName(heroRow.subrole, heroRow.subrole) : "")
                                        color: heroRow.role === "tank" || heroRow.role === "vanguard" ? "#42c8ff"
                                             : heroRow.role === "damage" || heroRow.role === "duelist" ? "#ff5b69"
                                             : heroRow.role === "plants" ? "#75d66b"
                                             : heroRow.role === "zombies" ? "#b283e6" : "#5ce1a2"
                                        font.family: "Rajdhani"
                                        font.pixelSize: 8
                                        font.bold: true
                                        elide: Text.ElideRight
                                    }
                                }
                                Repeater {
                                    visible: appController.profileGame !== "pvzgw2"
                                    model: [
                                        { id: "main", label: window.ss("bucket_main"), color: "#f6a21a" },
                                        { id: "played", label: window.ss("bucket_used"), color: "#44baff" },
                                        { id: "practice", label: window.ss("bucket_practice"), color: "#a783ff" },
                                        { id: "avoid", label: window.ss("bucket_unused"), color: "#ff5b69" }
                                    ]
                                    delegate: OWButton {
                                        required property var modelData
                                        visible: appController.profileGame !== "pvzgw2"
                                        Layout.preferredWidth: visible ? 94 : 0
                                        Layout.preferredHeight: 36
                                        text: modelData.label
                                        activeColor: modelData.color
                                        selected: heroRow.bucket === modelData.id
                                        enabled: appController.profileGame !== "overwatch" || window.currentSyncConfig().mode !== "synced"
                                        onClicked: window.setProfileHeroBucket(heroRow.key, heroRow.bucket === modelData.id ? "" : modelData.id)
                                    }
                                }
                                Repeater {
                                    visible: appController.profileGame === "pvzgw2"
                                    model: [
                                        { id: "owned", label: root.localText("LA TENGO", "OWNED", "POSSUO", "POSSÉDÉE", "IM BESITZ", "所持", "보유"), color: "#75d66b" },
                                        { id: "favorite", label: root.localText("FAVORITA", "FAVORITE", "FAVORITA", "FAVORITE", "FAVORIT", "お気に入り", "즐겨찾기"), color: "#f6a21a" },
                                        { id: "blocked", label: root.localText("BLOQUEADA", "BLOCKED", "BLOQUEADA", "BLOQUÉE", "BLOCKIERT", "ブロック", "차단"), color: "#ff5b69" }
                                    ]
                                    delegate: OWButton {
                                        required property var modelData
                                        visible: appController.profileGame === "pvzgw2"
                                        Layout.preferredWidth: visible ? 104 : 0
                                        Layout.preferredHeight: 36
                                        text: modelData.label
                                        activeColor: modelData.color
                                        selected: modelData.id === "owned" ? heroRow.owned
                                                : modelData.id === "favorite" ? heroRow.favorite : heroRow.blocked
                                        onClicked: appController.toggleProfileItemFlag(heroRow.key, modelData.id)
                                    }
                                }
                                OWButton {
                                    visible: appController.profileGame === "overwatch" && window.currentSyncConfig().mode === "hybrid"
                                    Layout.preferredWidth: visible ? 72 : 0
                                    Layout.preferredHeight: 36
                                    text: window.heroLocked(heroRow.key) ? window.ss("unlock") : window.ss("lock")
                                    selected: window.heroLocked(heroRow.key)
                                    onClicked: window.toggleHeroLocked(heroRow.key)
                                }
                            }
                        }
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 40
                        Text {
                            Layout.fillWidth: true
                            text: appController.profileGame === "pvzgw2"
                                  ? root.localText(
                                      "La colección limita las variantes que pueden salir. Las favoritas tienen más probabilidad; las bloqueadas nunca aparecen.",
                                      "The collection limits which variants can appear. Favorites are more likely; blocked variants never appear.",
                                      "A coleção limita as variantes disponíveis. Favoritas têm mais chance; bloqueadas nunca aparecem.",
                                      "La collection limite les variantes disponibles. Les favorites sont plus probables ; les variantes bloquées n'apparaissent jamais.",
                                      "Die Sammlung begrenzt verfügbare Varianten. Favoriten sind wahrscheinlicher; blockierte Varianten erscheinen nie.",
                                      "コレクションで出現するバリエーションを制限します。お気に入りは出やすく、ブロック済みは出現しません。",
                                      "컬렉션은 등장 가능한 변형을 제한합니다. 즐겨찾기는 더 자주, 차단 항목은 등장하지 않습니다.")
                                  : window.ss("classification_note")
                            color: window.muted
                            font.family: "Open Sans"
                            font.pixelSize: 9
                            wrapMode: Text.Wrap
                            maximumLineCount: 2
                        }
                        OWButton {
                            Layout.preferredWidth: 180
                            Layout.preferredHeight: 36
                            text: ui.clear_categories
                            danger: true
                            enabled: appController.profileGame !== "overwatch" || window.currentSyncConfig().mode !== "synced"
                            onClicked: window.clearProfileBuckets()
                        }
                    }
                }
            }
        }
    }
}
