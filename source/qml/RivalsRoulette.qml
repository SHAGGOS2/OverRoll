pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    property var window: ApplicationWindow.window
    signal exitRequested()

    readonly property color accent: moduleManager.activeMetadata.accent || "#ffd34e"
    property var classes: moduleManager.activeCatalog
    readonly property string gameName: String(moduleManager.activeMetadata.short_name
                                               || moduleManager.activeMetadata.name
                                               || "JUEGO").toUpperCase()
    readonly property var palette: ["#ffd34e", "#8b6cff", "#42c8ff", "#ff5b69", "#5ce1a2", "#df8dff", "#f5a742", "#4ad8c8"]

    // Estado aislado de la ruleta del catálogo activo.
    property var selectedClasses: ({})
    property var classWeights: ({})
    property var entries: []
    property var winner: null
    property var spinPreview: null
    property bool spinning: false
    property bool dirty: true
    property real wheelAngle: 0
    property real targetAngle: 0
    property int revision: 0
    property string searchText: ""
    property string message: localText("Selecciona personajes y construye la ruleta.", "Select characters and build the roulette.", "Selecione personagens e crie a roleta.", "Sélectionnez des personnages et créez la roulette.", "Wähle Charaktere und erstelle das Roulette.", "キャラクターを選んでルーレットを作成。", "캐릭터를 선택하고 룰렛을 만드세요.")

    function localText(es, en, pt, fr, de, ja, ko) {
        var locale = String(window.displayLocale || "es-mx")
        if (locale === "pt-br") return pt
        if (locale === "fr-fr") return fr
        if (locale === "de-de") return de
        if (locale === "ja-jp") return ja
        if (locale === "ko-kr") return ko
        return locale.indexOf("es-") === 0 ? es : en
    }

    function groupLabel(row) {
        if (!row) return ""
        var roles = moduleManager.activeRoles
        for (var i = 0; i < roles.length; ++i)
            if (roles[i].id === row.role) return String(roles[i].name).toUpperCase()
        return String(row.role || root.localText("PERSONAJE", "CHARACTER", "PERSONAGEM", "PERSONNAGE", "CHARAKTER", "キャラクター", "캐릭터")).toUpperCase()
    }

    function filteredRows(includeSearch) {
        var dependency = root.revision
        var query = includeSearch ? root.searchText.trim().toLowerCase() : ""
        var rows = []
        for (var i = 0; i < root.classes.length; ++i) {
            var row = root.classes[i]
            if (query.length && String(row.name).toLowerCase().indexOf(query) < 0) continue
            rows.push(row)
        }
        return rows
    }

    function isSelected(key) {
        var dependency = root.revision
        return root.selectedClasses && root.selectedClasses[key] === true
    }

    function selectedRows() {
        var rows = root.filteredRows(false)
        var result = []
        for (var i = 0; i < rows.length; ++i) {
            if (root.isSelected(rows[i].key)) result.push(rows[i])
        }
        return result
    }

    function selectedCount() { return root.selectedRows().length }

    function classWeight(key) {
        var dependency = root.revision
        var value = Number(root.classWeights && root.classWeights[key] || 1)
        return Math.max(1, Math.min(64, Math.round(value)))
    }

    function totalWeight() {
        var rows = root.selectedRows()
        var total = 0
        for (var i = 0; i < rows.length; ++i) total += root.classWeight(rows[i].key)
        return total
    }

    function probability(key) {
        if (!root.isSelected(key)) return 0
        var total = root.totalWeight()
        if (!total) return 0
        return Math.round(root.classWeight(key) * 1000 / total) / 10
    }

    function markDirty(text) {
        root.dirty = true
        root.entries = []
        root.winner = null
        root.spinPreview = null
        root.wheelAngle = 0
        root.message = text || (root.selectedCount()
            ? root.localText("Lista para construir.", "Ready to build.", "Pronta para criar.", "Prête à créer.", "Bereit zum Erstellen.", "作成準備完了。", "만들 준비 완료.")
            : root.localText("Selecciona al menos un personaje.", "Select at least one character.", "Selecione ao menos um personagem.", "Sélectionnez au moins un personnage.", "Wähle mindestens einen Charakter.", "キャラクターを1人以上選択。", "캐릭터를 하나 이상 선택하세요."))
        root.revision += 1
    }

    function toggleClass(key) {
        if (!key || root.spinning) return
        var selected = JSON.parse(JSON.stringify(root.selectedClasses || ({})))
        var weights = JSON.parse(JSON.stringify(root.classWeights || ({})))
        var wasSelected = selected[key] === true
        if (wasSelected) {
            delete selected[key]
            delete weights[key]
        } else {
            selected[key] = true
            weights[key] = Object.keys(selected).length === 1 ? 2 : 1
        }
        root.selectedClasses = selected
        root.classWeights = weights
        root.revision += 1
        if (root.selectedCount() === 1 && root.totalWeight() < 2) {
            var only = root.selectedRows()
            if (only.length) {
                weights[only[0].key] = 2
                root.classWeights = weights
                root.revision += 1
            }
        }
        root.markDirty()
        appController.playUiSound(wasSelected ? "toggle_off" : "toggle_on")
    }

    function changeWeight(key, delta) {
        if (!key || root.spinning || !root.isSelected(key)) return
        var total = root.totalWeight()
        var current = root.classWeight(key)
        var next = Math.max(1, Math.min(64, current + delta))
        if (delta > 0 && total >= 64) return
        if (delta < 0 && total <= 2) return
        if (next === current) return
        var weights = JSON.parse(JSON.stringify(root.classWeights || ({})))
        weights[key] = next
        root.classWeights = weights
        root.revision += 1
        root.markDirty()
        appController.playUiSound("roulette_weight")
    }

    function selectAll(playSound) {
        if (root.spinning) return
        var selected = ({})
        var weights = ({})
        for (var i = 0; i < root.classes.length; ++i) {
            selected[root.classes[i].key] = true
            weights[root.classes[i].key] = 1
        }
        root.selectedClasses = selected
        root.classWeights = weights
        root.revision += 1
        root.markDirty(root.localText("Todo el catálogo está seleccionado.", "The whole catalog is selected.", "Todo o catálogo está selecionado.", "Tout le catalogue est sélectionné.", "Der gesamte Katalog ist ausgewählt.", "カタログ全体を選択しました。", "전체 카탈로그를 선택했습니다."))
        if (playSound !== false) appController.playUiSound("toggle_on")
    }

    function clearAll() {
        if (root.spinning) return
        root.selectedClasses = ({})
        root.classWeights = ({})
        root.revision += 1
        root.markDirty(root.localText("Selecciona al menos un personaje.", "Select at least one character.", "Selecione ao menos um personagem.", "Sélectionnez au moins un personnage.", "Wähle mindestens einen Charakter.", "キャラクターを1人以上選択。", "캐릭터를 하나 이상 선택하세요."))
        appController.playUiSound("toggle_off")
    }

    function shuffled(source) {
        var result = source.slice(0)
        for (var i = result.length - 1; i > 0; --i) {
            var j = Math.floor(Math.random() * (i + 1))
            var temp = result[i]
            result[i] = result[j]
            result[j] = temp
        }
        return result
    }

    function buildRoulette(playSound) {
        if (root.spinning) return false
        var pool = root.selectedRows()
        if (!pool.length) {
            root.markDirty(root.localText("Selecciona al menos un personaje.", "Select at least one character.", "Selecione ao menos um personagem.", "Sélectionnez au moins un personnage.", "Wähle mindestens einen Charakter.", "キャラクターを1人以上選択。", "캐릭터를 하나 이상 선택하세요."))
            return false
        }
        var built = []
        for (var i = 0; i < pool.length; ++i) {
            var copies = root.classWeight(pool[i].key)
            for (var copy = 0; copy < copies && built.length < 64; ++copy) built.push(pool[i])
        }
        if (built.length === 1) built.push(built[0])
        root.entries = root.shuffled(built)
        root.winner = null
        root.spinPreview = null
        root.wheelAngle = 0
        root.dirty = false
        root.message = root.localText("Ruleta construida. Pulsa GIRAR RULETA.", "Roulette built. Press SPIN ROULETTE.", "Roleta criada. Pressione GIRAR ROLETA.", "Roulette créée. Appuyez sur TOURNER.", "Roulette erstellt. Drücke ROULETTE DREHEN.", "ルーレット完成。回すを押してください。", "룰렛 완성. 룰렛 돌리기를 누르세요.")
        root.revision += 1
        if (playSound !== false) appController.playUiSound("roulette_build")
        return true
    }

    function spin() {
        if (root.spinning) return
        if ((root.dirty || !root.entries.length) && !root.buildRoulette(false)) return
        var winnerIndex = Math.floor(Math.random() * root.entries.length)
        root.winner = null
        root.spinPreview = null
        root.message = root.localText("GIRANDO RULETA ", "SPINNING ", "GIRANDO ROLETA ", "ROULETTE ", "ROULETTE DREHT: ", "ルーレット回転中 ", "룰렛 회전 중 ") + root.gameName + "..."
        root.wheelAngle = 0
        root.targetAngle = 2160 - ((winnerIndex + 0.5) * 360 / root.entries.length)
        root.spinning = true
        tf2RouletteAnimation.winnerIndex = winnerIndex
        root.revision += 1
        appController.playUiSound("roulette_spin")
        tf2RouletteAnimation.restart()
    }

    Component.onCompleted: root.selectAll(false)

    NumberAnimation {
        id: tf2RouletteAnimation
        property int winnerIndex: -1
        target: root
        property: "wheelAngle"
        from: 0
        to: root.targetAngle
        duration: 2600
        easing.type: Easing.OutQuint
        onFinished: {
            if (winnerIndex >= 0 && winnerIndex < root.entries.length) {
                root.winner = root.entries[winnerIndex]
                root.message = root.localText("GANADOR · ", "WINNER · ", "VENCEDOR · ", "GAGNANT · ", "GEWINNER · ", "当選 · ", "당첨 · ") + String(root.winner.name).toUpperCase()
            }
            root.spinning = false
            root.revision += 1
            appController.playUiSound("roulette_win")
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 8

        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 48
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0
                Text {
                    text: root.localText("CREADOR DE RULETA · ", "ROULETTE MAKER · ", "CRIADOR DE ROLETA · ", "CRÉATEUR DE ROULETTE · ", "ROULETTE-EDITOR · ", "ルーレット作成 · ", "룰렛 제작기 · ") + String(moduleManager.activeMetadata.name).toUpperCase()
                    color: root.accent
                    font.family: "Rajdhani"
                    font.pixelSize: 25
                    font.bold: true
                }
                Text {
                    text: root.localText("CATÁLOGO LOCAL · ", "LOCAL CATALOG · ", "CATÁLOGO LOCAL · ", "CATALOGUE LOCAL · ", "LOKALER KATALOG · ", "ローカルカタログ · ", "로컬 카탈로그 · ")
                          + root.classes.length
                          + root.localText(" PERSONAJES · PROBABILIDADES INDEPENDIENTES", " CHARACTERS · INDEPENDENT PROBABILITIES", " PERSONAGENS · PROBABILIDADES INDEPENDENTES", " PERSONNAGES · PROBABILITÉS INDÉPENDANTES", " CHARAKTERE · UNABHÄNGIGE WAHRSCHEINLICHKEITEN", " キャラクター · 個別確率", " 캐릭터 · 개별 확률")
                    color: window.muted
                    font.family: "Open Sans"
                    font.pixelSize: 10
                }
            }
            OWButton {
                Layout.preferredWidth: 148
                Layout.preferredHeight: 34
                text: window.ui.back.toUpperCase()
                onClicked: root.exitRequested()
            }
            Rectangle {
                Layout.preferredWidth: 154
                Layout.preferredHeight: 34
                color: "#0a1a2b"
                border.color: root.accent
                Text {
                    anchors.centerIn: parent
                    text: root.selectedCount() + root.localText(" SELECCIONADOS · ", " SELECTED · ", " SELECIONADOS · ", " SÉLECTIONNÉS · ", " AUSGEWÄHLT · ", " 選択 · ", " 선택 · ")
                          + root.totalWeight() + root.localText(" CASILLAS", " SLOTS", " CASAS", " CASES", " FELDER", " マス", " 칸")
                    color: root.accent
                    font.family: "Rajdhani"
                    font.pixelSize: 10
                    font.bold: true
                }
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 8

            Rectangle {
                Layout.preferredWidth: 342
                Layout.fillHeight: true
                color: "#091828"
                border.color: window.line
                border.width: 1

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 6

                    Text {
                        Layout.fillWidth: true
                        text: root.localText("Cada punto de peso crea una casilla. Máximo: 64.", "Each weight point creates one slot. Maximum: 64.", "Cada ponto de peso cria uma casa. Máximo: 64.", "Chaque point de poids crée une case. Maximum : 64.", "Jeder Gewichtspunkt erstellt ein Feld. Maximum: 64.", "重み1ポイントにつき1マス。最大64。", "가중치 1점당 한 칸. 최대 64.")
                        color: window.muted
                        font.family: "Open Sans"
                        font.pixelSize: 9
                        wrapMode: Text.Wrap
                    }
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 34
                        color: "#0b1e31"
                        border.color: window.line
                        Text {
                            anchors.centerIn: parent
                            text: root.totalWeight() + root.localText(" CASILLAS TOTALES", " TOTAL SLOTS", " CASAS TOTAIS", " CASES AU TOTAL", " FELDER GESAMT", " 総マス数", " 전체 칸")
                            color: window.text
                            font.family: "Rajdhani"
                            font.pixelSize: 14
                            font.bold: true
                        }
                    }
                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: root.localText("SELECCIONAR TODOS", "SELECT ALL", "SELECIONAR TODOS", "TOUT SÉLECTIONNER", "ALLE AUSWÄHLEN", "すべて選択", "모두 선택"); onClicked: root.selectAll(true) }
                        OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: root.localText("LIMPIAR", "CLEAR", "LIMPAR", "EFFACER", "LEEREN", "クリア", "지우기"); onClicked: root.clearAll() }
                    }
                    TextField {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 34
                        placeholderText: window.ui.search
                        text: root.searchText
                        color: window.text
                        placeholderTextColor: "#6987a2"
                        leftPadding: 9
                        background: Rectangle { color: "#0b1e31"; border.color: parent.activeFocus ? root.accent : window.line }
                        onTextChanged: { root.searchText = text; root.revision += 1 }
                    }
                    Text {
                        Layout.fillWidth: true
                        text: root.selectedCount() + root.localText(" SELECCIONADOS · ", " SELECTED · ", " SELECIONADOS · ", " SÉLECTIONNÉS · ", " AUSGEWÄHLT · ", " 選択 · ", " 선택 · ")
                              + root.totalWeight() + root.localText(" CASILLAS", " SLOTS", " CASAS", " CASES", " FELDER", " マス", " 칸")
                        color: root.accent
                        font.family: "Rajdhani"
                        font.pixelSize: 11
                        font.bold: true
                    }
                    GridView {
                        id: tf2ClassGrid
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        Layout.minimumHeight: 190
                        model: root.filteredRows(true)
                        cellWidth: width
                        cellHeight: 58
                        clip: true
                        reuseItems: true
                        cacheBuffer: 0
                        boundsBehavior: Flickable.StopAtBounds
                        ScrollBar.vertical: ScrollBar { policy: tf2ClassGrid.contentHeight > tf2ClassGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }

                        delegate: Rectangle {
                            id: tf2ClassDelegate
                            required property var modelData
                            property bool chosen: root.isSelected(modelData.key)
                            property int itemWeight: root.classWeight(modelData.key)
                            property real itemProbability: root.probability(modelData.key)
                            width: tf2ClassGrid.cellWidth - 5
                            height: tf2ClassGrid.cellHeight - 5
                            color: chosen ? "#17364f" : "#0a1b2b"
                            border.color: chosen ? root.accent : window.line
                            border.width: chosen ? 2 : 1
                            radius: 3

                            MouseArea {
                                anchors.fill: parent
                                enabled: !parent.chosen && !root.spinning
                                onClicked: root.toggleClass(parent.modelData.key)
                            }
                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 4
                                spacing: 5
                                Image {
                                    Layout.preferredWidth: 40
                                    Layout.preferredHeight: 40
                                    source: modelData.portrait
                                    sourceSize.width: 52
                                    sourceSize.height: 52
                                    fillMode: Image.PreserveAspectCrop
                                    asynchronous: false
                                    cache: true
                                }
                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 0
                                    Text { Layout.fillWidth: true; text: String(modelData.name).toUpperCase(); color: window.text; font.family: "Rajdhani"; font.pixelSize: 11; font.bold: true; elide: Text.ElideRight }
                                    Text { text: root.groupLabel(modelData); color: root.accent; font.family: "Rajdhani"; font.pixelSize: 8; font.bold: true }
                                }
                                RowLayout {
                                    visible: tf2ClassDelegate.chosen
                                    spacing: 3
                                    Rectangle {
                                        property bool controlEnabled: !root.spinning && tf2ClassDelegate.itemWeight > 1 && root.totalWeight() > 2
                                        Layout.preferredWidth: 28
                                        Layout.preferredHeight: 28
                                        color: controlEnabled ? "#1c4164" : "#10283e"
                                        border.color: controlEnabled ? window.line : "#17334d"
                                        Text { anchors.centerIn: parent; text: "−"; color: parent.controlEnabled ? window.text : window.muted; font.pixelSize: 15; font.bold: true }
                                        MouseArea { anchors.fill: parent; enabled: parent.controlEnabled; onClicked: root.changeWeight(modelData.key, -1) }
                                    }
                                    Text { Layout.preferredWidth: 24; text: "x" + tf2ClassDelegate.itemWeight; color: root.accent; font.family: "Rajdhani"; font.pixelSize: 12; font.bold: true; horizontalAlignment: Text.AlignHCenter }
                                    Rectangle {
                                        property bool controlEnabled: !root.spinning && root.totalWeight() < 64
                                        Layout.preferredWidth: 28
                                        Layout.preferredHeight: 28
                                        color: controlEnabled ? "#1c4164" : "#10283e"
                                        border.color: controlEnabled ? window.line : "#17334d"
                                        Text { anchors.centerIn: parent; text: "+"; color: parent.controlEnabled ? window.text : window.muted; font.pixelSize: 15; font.bold: true }
                                        MouseArea { anchors.fill: parent; enabled: parent.controlEnabled; onClicked: root.changeWeight(modelData.key, 1) }
                                    }
                                    Text { Layout.preferredWidth: 40; text: tf2ClassDelegate.itemProbability + "%"; color: window.muted; font.family: "Rajdhani"; font.pixelSize: 10; horizontalAlignment: Text.AlignRight }
                                    Rectangle {
                                        Layout.preferredWidth: 28
                                        Layout.preferredHeight: 28
                                        color: "#402033"
                                        border.color: "#7b3145"
                                        Text { anchors.centerIn: parent; text: "×"; color: "#ff7384"; font.pixelSize: 14; font.bold: true }
                                        MouseArea { anchors.fill: parent; enabled: !root.spinning; onClicked: root.toggleClass(modelData.key) }
                                    }
                                }
                                Text { visible: !tf2ClassDelegate.chosen; text: "+"; color: window.muted; font.pixelSize: 17; font.bold: true }
                            }
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 36
                        text: root.localText("CONSTRUIR RULETA", "BUILD ROULETTE", "CRIAR ROLETA", "CRÉER LA ROULETTE", "ROULETTE ERSTELLEN", "ルーレット作成", "룰렛 만들기")
                        activeColor: root.accent
                        enabled: !root.spinning && root.selectedCount() > 0
                        onClicked: root.buildRoulette(true)
                    }
                }
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: "#081726"
                border.color: window.line
                border.width: 1

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 6

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 42
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 0
                            Text { text: window.ui.result.toUpperCase(); color: root.accent; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true }
                            Text { text: root.localText("RULETA PERSONALIZADA · ", "CUSTOM ROULETTE · ", "ROLETA PERSONALIZADA · ", "ROULETTE PERSONNALISÉE · ", "BENUTZERDEFINIERTES ROULETTE · ", "カスタムルーレット · ", "사용자 룰렛 · ") + String(moduleManager.activeMetadata.short_name || moduleManager.activeMetadata.name).toUpperCase(); color: window.text; font.family: "Rajdhani"; font.pixelSize: 20; font.bold: true }
                        }
                        Text { text: root.selectedCount() + root.localText(" SELECCIONADOS · ", " SELECTED · ", " SELECIONADOS · ", " SÉLECTIONNÉS · ", " AUSGEWÄHLT · ", " 選択 · ", " 선택 · ") + root.entries.length + root.localText(" CASILLAS", " SLOTS", " CASAS", " CASES", " FELDER", " マス", " 칸"); color: window.muted; font.family: "Open Sans"; font.pixelSize: 10 }
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 10

                        Item {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            Layout.minimumWidth: 310

                            Item {
                                id: tf2Wheel
                                width: Math.max(0, Math.min(parent.width - 20, parent.height - 116, 540))
                                height: width
                                anchors.horizontalCenter: parent.horizontalCenter
                                anchors.verticalCenter: parent.verticalCenter
                                rotation: root.wheelAngle

                                Canvas {
                                    id: tf2WheelCanvas
                                    anchors.fill: parent
                                    antialiasing: true
                                    onPaint: {
                                        var ctx = getContext("2d")
                                        ctx.clearRect(0, 0, width, height)
                                        var rows = root.entries
                                        var count = rows.length
                                        var cx = width / 2
                                        var cy = height / 2
                                        var radius = Math.max(0, Math.min(width, height) / 2 - 7)
                                        if (!count || radius <= 0) {
                                            ctx.beginPath()
                                            ctx.arc(cx, cy, radius, 0, Math.PI * 2)
                                            ctx.fillStyle = "#0e2237"
                                            ctx.fill()
                                            ctx.strokeStyle = "#234764"
                                            ctx.lineWidth = 4
                                            ctx.stroke()
                                            return
                                        }
                                        var step = Math.PI * 2 / count
                                        for (var i = 0; i < count; ++i) {
                                            var start = -Math.PI / 2 + i * step
                                            var end = start + step
                                            ctx.beginPath()
                                            ctx.moveTo(cx, cy)
                                            ctx.arc(cx, cy, radius, start, end)
                                            ctx.closePath()
                                            ctx.fillStyle = root.palette[i % root.palette.length]
                                            ctx.fill()
                                            ctx.strokeStyle = "#071522"
                                            ctx.lineWidth = count > 36 ? 1 : 2
                                            ctx.stroke()
                                            if (count <= 32) {
                                                var center = start + step / 2
                                                ctx.save()
                                                ctx.translate(cx, cy)
                                                ctx.rotate(center)
                                                ctx.textAlign = "right"
                                                ctx.textBaseline = "middle"
                                                ctx.fillStyle = "#ffffff"
                                                ctx.font = "bold " + (count <= 12 ? 14 : count <= 20 ? 11 : 9) + "px Rajdhani"
                                                var label = String(rows[i].name)
                                                var maxChars = count <= 12 ? 16 : count <= 20 ? 12 : 8
                                                if (label.length > maxChars) label = label.slice(0, maxChars - 1) + "…"
                                                ctx.fillText(label, radius - 18, 0)
                                                ctx.restore()
                                            }
                                        }
                                        ctx.beginPath()
                                        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
                                        ctx.strokeStyle = root.accent
                                        ctx.lineWidth = 5
                                        ctx.stroke()
                                    }
                                    Connections {
                                        target: root
                                        function onEntriesChanged() { tf2WheelCanvas.requestPaint() }
                                    }
                                }

                                Rectangle {
                                    anchors.centerIn: parent
                                    width: Math.min(150, parent.width * 0.28)
                                    height: width
                                    radius: 3
                                    rotation: -root.wheelAngle
                                    z: 4
                                    clip: true
                                    color: "#091828"
                                    border.color: root.accent
                                    border.width: 3
                                    Image {
                                        anchors.fill: parent
                                        anchors.margins: 5
                                        source: root.spinning ? ""
                                                            : root.winner ? root.winner.portrait : ""
                                        visible: source.toString().length > 0
                                        fillMode: Image.PreserveAspectCrop
                                        asynchronous: false
                                        cache: true
                                    }
                                    Text {
                                        anchors.centerIn: parent
                                        width: parent.width - 16
                                        text: root.spinning ? "…"
                                              : root.winner ? String(root.winner.name).toUpperCase()
                                              : root.entries.length ? "GIRAR" : "?"
                                        visible: !root.winner || root.spinning
                                        color: window.text
                                        font.family: "Rajdhani"
                                        font.pixelSize: Math.max(14, parent.width * 0.13)
                                        font.bold: true
                                        horizontalAlignment: Text.AlignHCenter
                                        wrapMode: Text.Wrap
                                    }
                                }
                            }

                            Canvas {
                                width: 48
                                height: 52
                                anchors.horizontalCenter: tf2Wheel.horizontalCenter
                                anchors.top: tf2Wheel.top
                                anchors.topMargin: -18
                                z: 10
                                onPaint: {
                                    var ctx = getContext("2d")
                                    ctx.clearRect(0, 0, width, height)
                                    ctx.beginPath()
                                    ctx.moveTo(width / 2, height)
                                    ctx.lineTo(4, 4)
                                    ctx.lineTo(width - 4, 4)
                                    ctx.closePath()
                                    ctx.fillStyle = root.accent
                                    ctx.fill()
                                    ctx.strokeStyle = "#fff2cf"
                                    ctx.lineWidth = 2
                                    ctx.stroke()
                                }
                            }

                            Rectangle {
                                anchors.horizontalCenter: parent.horizontalCenter
                                anchors.bottom: parent.bottom
                                width: Math.max(0, Math.min(parent.width - 12, 620))
                                height: 68
                                radius: 4
                                color: "#0e2237"
                                border.color: root.winner ? root.accent : window.line
                                Column {
                                    anchors.centerIn: parent
                                    width: parent.width - 18
                                    spacing: 2
                                    Text { width: parent.width; text: root.message; color: root.winner ? root.accent : window.text; font.family: "Rajdhani"; font.pixelSize: root.winner ? 18 : 13; font.bold: true; horizontalAlignment: Text.AlignHCenter; elide: Text.ElideRight }
                                    Text { width: parent.width; text: root.localText("Cada casilla conserva su peso; esta ruleta no altera la escuadra de ", "Each slot keeps its weight; this roulette does not change the ", "Cada casa mantém seu peso; esta roleta não altera a equipe de ", "Chaque case conserve son poids ; cette roulette ne modifie pas l'équipe de ", "Jedes Feld behält sein Gewicht; dieses Roulette ändert das Team von ", "各マスの重みは保持され、このルーレットはチームを変更しません: ", "각 칸의 가중치는 유지되며 이 룰렛은 팀을 변경하지 않습니다: ") + root.gameName + "."; color: window.muted; font.family: "Open Sans"; font.pixelSize: 9; horizontalAlignment: Text.AlignHCenter; wrapMode: Text.Wrap }
                                }
                            }
                        }

                        Rectangle {
                            Layout.preferredWidth: 238
                            Layout.fillHeight: true
                            color: "#091828"
                            border.color: window.line
                            border.width: 1
                            radius: 3
                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 7
                                spacing: 5
                                Text { text: root.localText("CASILLAS DE LA RULETA", "ROULETTE SLOTS", "CASAS DA ROLETA", "CASES DE LA ROULETTE", "ROULETTE-FELDER", "ルーレットのマス", "룰렛 칸"); color: root.accent; font.family: "Rajdhani"; font.pixelSize: 13; font.bold: true }
                                Text { Layout.fillWidth: true; text: root.entries.length ? root.entries.length + root.localText(" CASILLAS CONSTRUIDAS", " SLOTS BUILT", " CASAS CRIADAS", " CASES CRÉÉES", " FELDER ERSTELLT", " マス作成済み", " 칸 생성됨") : root.localText("AÚN NO CONSTRUIDA", "NOT BUILT YET", "AINDA NÃO CRIADA", "PAS ENCORE CRÉÉE", "NOCH NICHT ERSTELLT", "未作成", "아직 만들지 않음"); color: window.muted; font.family: "Open Sans"; font.pixelSize: 9; wrapMode: Text.Wrap }
                                ListView {
                                    id: tf2EntryList
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    model: root.entries
                                    spacing: 4
                                    clip: true
                                    reuseItems: true
                                    cacheBuffer: 0
                                    boundsBehavior: Flickable.StopAtBounds
                                    ScrollBar.vertical: ScrollBar { policy: tf2EntryList.contentHeight > tf2EntryList.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
                                    delegate: Rectangle {
                                        required property var modelData
                                        required property int index
                                        width: tf2EntryList.width - (tf2EntryList.contentHeight > tf2EntryList.height ? 10 : 0)
                                        height: 44
                                        color: root.winner && root.winner.key === modelData.key ? "#17364f" : "#0a1b2b"
                                        border.color: root.winner && root.winner.key === modelData.key ? root.accent : window.line
                                        RowLayout {
                                            anchors.fill: parent
                                            anchors.margins: 4
                                            spacing: 5
                                            Text { Layout.preferredWidth: 22; text: index + 1; color: root.accent; font.family: "Rajdhani"; font.pixelSize: 11; font.bold: true; horizontalAlignment: Text.AlignHCenter }
                                            Image { Layout.preferredWidth: 34; Layout.preferredHeight: 34; source: modelData.portrait; sourceSize.width: 44; sourceSize.height: 44; fillMode: Image.PreserveAspectCrop; asynchronous: false; cache: true }
                                            ColumnLayout {
                                                Layout.fillWidth: true
                                                spacing: 0
                                                Text { Layout.fillWidth: true; text: String(modelData.name).toUpperCase(); color: window.text; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true; elide: Text.ElideRight }
                                                Text { text: root.groupLabel(modelData); color: root.accent; font.family: "Rajdhani"; font.pixelSize: 8; font.bold: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 48
                        text: root.spinning
                              ? root.localText("GIRANDO...", "SPINNING...", "GIRANDO...", "EN ROTATION...", "DREHT...", "回転中...", "회전 중...")
                              : root.localText("GIRAR RULETA", "SPIN ROULETTE", "GIRAR ROLETA", "TOURNER", "ROULETTE DREHEN", "ルーレットを回す", "룰렛 돌리기")
                        selected: true
                        activeColor: root.accent
                        enabled: !root.spinning && root.selectedCount() > 0
                        onClicked: root.spin()
                    }
                }
            }
        }
    }
}
