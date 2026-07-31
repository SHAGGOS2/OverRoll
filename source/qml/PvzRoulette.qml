pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"
import "PvzRouletteCatalog.js" as PvzRouletteCatalog

Item {
    id: root
    property var window: ApplicationWindow.window
    signal exitRequested()
    property bool variantsEnabled: true
    signal variantsToggleRequested(bool enabled)

    readonly property color plantAccent: "#71d56b"
    readonly property color zombieAccent: "#a985dd"
    readonly property color activeAccent: root.selectedSide === "plants" ? root.plantAccent : root.zombieAccent
    readonly property var classRanges: [
        { side: "plants", min: 1,  max: 6,  key: "plant-1-citron" },
        { side: "plants", min: 7,  max: 12, key: "plant-7-rose" },
        { side: "plants", min: 13, max: 18, key: "plant-13-kernel-corn" },
        { side: "plants", min: 19, max: 28, key: "plant-19-peashooter" },
        { side: "plants", min: 29, max: 40, key: "plant-29-chomper" },
        { side: "plants", min: 41, max: 50, key: "plant-41-sunflower" },
        { side: "plants", min: 51, max: 60, key: "plant-51-cactus" },
        { side: "plants", min: 61, max: 61, key: "plant-61-torchwood" },
        { side: "zombies", min: 1,  max: 7,  key: "zombie-1-imp" },
        { side: "zombies", min: 8,  max: 13, key: "zombie-8-super-brainz" },
        { side: "zombies", min: 14, max: 19, key: "zombie-14-captain-deadbeard" },
        { side: "zombies", min: 20, max: 29, key: "zombie-20-foot-soldier" },
        { side: "zombies", min: 30, max: 39, key: "zombie-30-engineer" },
        { side: "zombies", min: 40, max: 49, key: "zombie-40-scientist" },
        { side: "zombies", min: 50, max: 59, key: "zombie-50-all-star" },
        { side: "zombies", min: 60, max: 60, key: "zombie-60-hover-goat-3000" }
    ]
    readonly property var plantPalette: ["#71d56b", "#4fab61", "#9ce66d", "#3b9258", "#b5e878", "#64bd72", "#88dc91", "#3f7e4e"]
    readonly property var zombiePalette: ["#a985dd", "#8466bc", "#c39cec", "#6c55a5", "#b98be0", "#7453a8", "#d3b2f0", "#574287"]

    // Estado exclusivo de la ruleta PvZ2.
    property var localRows: []
    property var rowByKey: ({})
    property var visibleRows: []
    property int selectedCountValue: 0
    property int totalWeightValue: 0
    property string selectedSide: "plants"
    property string searchText: ""
    property var selectedCharacters: ({})
    property var characterWeights: ({})
    property var entries: []
    property var winner: null
    property var spinPreview: null
    property bool spinning: false
    property bool dirty: true
    property real wheelAngle: 0
    property real targetAngle: 0
    property int revision: 0
    property string message: "Selecciona personajes y construye la ruleta Planta."

    function rawKey(value) {
        var source = ""
        if (typeof value === "string") source = value
        else if (value) {
            if (value.key) source = String(value.key)
            else if (value.id) source = String(value.id)
            else if (value.portrait) source = String(value.portrait)
        }
        var plantIndex = source.indexOf("plant-")
        var zombieIndex = source.indexOf("zombie-")
        var start = plantIndex >= 0 ? plantIndex : zombieIndex
        if (start >= 0) source = source.substring(start)
        var queryIndex = source.indexOf("?")
        if (queryIndex >= 0) source = source.substring(0, queryIndex)
        return source.replace(/\.(png|jpg|jpeg|webp)$/i, "")
    }

    function sideFromRawKey(raw) {
        return raw.indexOf("plant-") === 0 ? "plants" : raw.indexOf("zombie-") === 0 ? "zombies" : ""
    }

    function classDefinition(raw) {
        var match = /^(plant|zombie)-(\d+)-/.exec(raw)
        if (!match) return null
        var side = match[1] === "plant" ? "plants" : "zombies"
        var number = parseInt(match[2])
        for (var i = 0; i < root.classRanges.length; ++i) {
            var definition = root.classRanges[i]
            if (definition.side === side && number >= definition.min && number <= definition.max) return definition
        }
        return null
    }

    function cloneMap(source) {
        var result = ({})
        if (!source) return result
        for (var key in source) result[key] = source[key]
        return result
    }

    function refreshCatalog() {
        var snapshot = []
        var index = ({})
        var source = PvzRouletteCatalog.rows || []
        for (var i = 0; i < source.length; ++i) {
            var row = source[i]
            if (!row) continue
            var raw = root.rawKey(row)
            var side = root.sideFromRawKey(raw)
            if (!raw.length || !side.length) continue
            var definition = root.classDefinition(raw)
            var normalized = {
                key: raw,
                name: String(row.name || raw),
                portrait: String(row.portrait || "").indexOf("../data/") === 0
                          ? appController.assetUrl(String(row.portrait).substring(3))
                          : String(row.portrait || ""),
                side: side,
                baseKey: definition ? definition.key : raw,
                isVariant: definition ? raw !== definition.key : false
            }
            snapshot.push(normalized)
            index[raw] = normalized
        }
        root.localRows = snapshot
        root.rowByKey = index
        root.rebuildVisibleRows()
        root.selectAllVisible(false)
    }

    function rebuildVisibleRows() {
        var result = []
        var query = root.searchText.trim().toLowerCase()
        for (var i = 0; i < root.localRows.length; ++i) {
            var row = root.localRows[i]
            if (row.side !== root.selectedSide) continue
            if (!root.variantsEnabled && row.isVariant) continue
            if (query.length && String(row.name).toLowerCase().indexOf(query) < 0) continue
            result.push(row)
        }
        root.visibleRows = result
    }

    function eligibleRows(includeSearch) {
        if (includeSearch) return root.visibleRows
        var result = []
        for (var i = 0; i < root.localRows.length; ++i) {
            var row = root.localRows[i]
            if (row.side !== root.selectedSide) continue
            if (!root.variantsEnabled && row.isVariant) continue
            result.push(row)
        }
        return result
    }

    function isSelected(key) {
        var dependency = root.revision
        return root.selectedCharacters && root.selectedCharacters[key] === true
    }

    function selectedRows() {
        var result = []
        for (var i = 0; i < root.localRows.length; ++i) {
            var row = root.localRows[i]
            if (row.side !== root.selectedSide) continue
            if (!root.variantsEnabled && row.isVariant) continue
            if (root.selectedCharacters && root.selectedCharacters[row.key] === true) result.push(row)
        }
        return result
    }

    function recomputeSelectionStats() {
        var count = 0
        var total = 0
        for (var i = 0; i < root.localRows.length; ++i) {
            var row = root.localRows[i]
            if (row.side !== root.selectedSide) continue
            if (!root.variantsEnabled && row.isVariant) continue
            if (root.selectedCharacters && root.selectedCharacters[row.key] === true) {
                count += 1
                var value = Number(root.characterWeights && root.characterWeights[row.key] || 1)
                total += Math.max(1, Math.min(64, Math.round(value)))
            }
        }
        root.selectedCountValue = count
        root.totalWeightValue = total
    }

    function selectedCount() { return root.selectedCountValue }

    function characterWeight(key) {
        var dependency = root.revision
        var value = Number(root.characterWeights && root.characterWeights[key] || 1)
        return Math.max(1, Math.min(64, Math.round(value)))
    }

    function totalWeight() { return root.totalWeightValue }

    function probability(key) {
        if (!root.isSelected(key) || !root.totalWeightValue) return 0
        return Math.round(root.characterWeight(key) * 1000 / root.totalWeightValue) / 10
    }

    function markDirty(text) {
        root.dirty = true
        root.entries = []
        root.winner = null
        root.spinPreview = null
        root.wheelAngle = 0
        var sideName = root.selectedSide === "plants" ? "Planta" : "Zombi"
        root.message = text || (root.selectedCount() ? "Lista para construir la ruleta " + sideName + "." : "Selecciona al menos un personaje.")
        root.revision += 1
    }

    function setSide(side) {
        if (root.spinning || (side !== "plants" && side !== "zombies")) return
        if (root.selectedSide === side) return
        root.selectedSide = side
        root.searchText = ""
        root.rebuildVisibleRows()
        root.recomputeSelectionStats()
        if (!root.selectedCountValue) root.selectAllVisible(false)
        else root.markDirty()
        appController.playUiSound(side === "plants" ? "toggle_on" : "toggle_off")
    }

    function toggleCharacter(key) {
        if (!key || root.spinning) return
        var selected = root.cloneMap(root.selectedCharacters)
        var weights = root.cloneMap(root.characterWeights)
        var wasSelected = selected[key] === true
        if (wasSelected) {
            delete selected[key]
            delete weights[key]
        } else {
            selected[key] = true
            weights[key] = root.selectedCountValue === 0 ? 2 : 1
        }
        root.selectedCharacters = selected
        root.characterWeights = weights
        root.recomputeSelectionStats()
        root.markDirty()
        appController.playUiSound(wasSelected ? "toggle_off" : "toggle_on")
    }

    function changeWeight(key, delta) {
        if (!key || root.spinning || !root.isSelected(key)) return
        var current = root.characterWeight(key)
        var next = Math.max(1, Math.min(64, current + delta))
        if (delta > 0 && root.totalWeightValue >= 64) return
        if (delta < 0 && root.totalWeightValue <= 2) return
        if (next === current) return
        var weights = root.cloneMap(root.characterWeights)
        weights[key] = next
        root.characterWeights = weights
        root.recomputeSelectionStats()
        root.markDirty()
        appController.playUiSound("roulette_weight")
    }

    function selectAllVisible(playSound) {
        if (root.spinning) return
        var rows = root.eligibleRows(false)
        var selected = root.cloneMap(root.selectedCharacters)
        var weights = root.cloneMap(root.characterWeights)
        for (var key in selected) {
            var row = root.rowByKey[key]
            if (row && row.side === root.selectedSide) {
                delete selected[key]
                delete weights[key]
            }
        }
        for (var i = 0; i < rows.length; ++i) {
            selected[rows[i].key] = true
            weights[rows[i].key] = 1
        }
        root.selectedCharacters = selected
        root.characterWeights = weights
        root.recomputeSelectionStats()
        root.markDirty((root.selectedSide === "plants" ? "Plantas" : "Zombis") + " seleccionados.")
        if (playSound !== false) appController.playUiSound("toggle_on")
    }

    function clearCurrentSide() {
        if (root.spinning) return
        var selected = root.cloneMap(root.selectedCharacters)
        var weights = root.cloneMap(root.characterWeights)
        for (var key in selected) {
            var row = root.rowByKey[key]
            if (row && row.side === root.selectedSide) {
                delete selected[key]
                delete weights[key]
            }
        }
        root.selectedCharacters = selected
        root.characterWeights = weights
        root.recomputeSelectionStats()
        root.markDirty("Selecciona al menos un personaje.")
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
            root.markDirty("Selecciona al menos un personaje.")
            return false
        }
        var built = []
        for (var i = 0; i < pool.length; ++i) {
            var copies = root.characterWeight(pool[i].key)
            for (var copy = 0; copy < copies && built.length < 64; ++copy) built.push(pool[i])
        }
        if (built.length === 1) built.push(built[0])
        root.entries = root.shuffled(built)
        root.winner = null
        root.spinPreview = null
        root.wheelAngle = 0
        root.dirty = false
        root.message = "Ruleta " + (root.selectedSide === "plants" ? "Planta" : "Zombi") + " construida. Pulsa GIRAR RULETA."
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
        root.message = "GIRANDO RULETA " + (root.selectedSide === "plants" ? "PLANTA…" : "ZOMBI…")
        root.wheelAngle = 0
        root.targetAngle = 2160 - ((winnerIndex + 0.5) * 360 / root.entries.length)
        root.spinning = true
        pvzRouletteAnimation.winnerIndex = winnerIndex
        root.revision += 1
        // Audio exclusivo de PvZ2; no usa los sonidos de la ruleta Overwatch.
        appController.playUiSound("roulette_spin")
        pvzRouletteAnimation.restart()
    }

    onVariantsEnabledChanged: {
        if (!root.localRows.length) return
        // No reconstruye ni clona todo el catálogo: conserva la selección del
        // usuario y solo cambia el conjunto visible/elegible.
        root.rebuildVisibleRows()
        root.recomputeSelectionStats()
        root.markDirty(root.variantsEnabled ? "Variantes disponibles." : "Solo personajes base.")
    }

    Component.onCompleted: root.refreshCatalog()

    NumberAnimation {
        id: pvzRouletteAnimation
        property int winnerIndex: -1
        target: root
        property: "wheelAngle"
        from: 0
        to: root.targetAngle
        duration: 2800
        easing.type: Easing.OutQuint
        onFinished: {
            if (winnerIndex >= 0 && winnerIndex < root.entries.length) {
                root.winner = root.entries[winnerIndex]
                root.message = "GANADOR · " + String(root.winner.name).toUpperCase()
            }
            root.spinning = false
            appController.playUiSound("roulette_win")
            root.revision += 1
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
                    text: "RULETA MAKER · PVZ GARDEN WARFARE 2"
                    color: root.activeAccent
                    font.family: "Rajdhani"
                    font.pixelSize: 25
                    font.bold: true
                }
                Text {
                    text: "CATÁLOGO POR BANDO · PERSONAJES BASE Y VARIANTES · ESTADO INDEPENDIENTE"
                    color: window.muted
                    font.family: "Open Sans"
                    font.pixelSize: 10
                }
            }
            OWButton {
                Layout.preferredWidth: 148
                Layout.preferredHeight: 34
                text: "VOLVER AL EQUIPO"
                onClicked: root.exitRequested()
            }
            Rectangle {
                Layout.preferredWidth: 164
                Layout.preferredHeight: 34
                color: "#0a1a2b"
                border.color: root.activeAccent
                Text {
                    anchors.centerIn: parent
                    text: root.selectedCount() + " SELECCIONADOS · " + root.totalWeight() + " CASILLAS"
                    color: root.activeAccent
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
                Layout.preferredWidth: 354
                Layout.fillHeight: true
                color: "#091828"
                border.color: window.line
                border.width: 1

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 5

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        OWButton { Layout.fillWidth: true; Layout.preferredHeight: 32; text: "PLANTAS"; selected: root.selectedSide === "plants"; activeColor: root.plantAccent; onClicked: root.setSide("plants") }
                        OWButton { Layout.fillWidth: true; Layout.preferredHeight: 32; text: "ZOMBIS"; selected: root.selectedSide === "zombies"; activeColor: root.zombieAccent; onClicked: root.setSide("zombies") }
                    }
                    ToggleRow {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 40
                        text: "Permitir variantes"
                        checkedValue: root.variantsEnabled
                        activeColor: "#f6a21a"
                        onClicked: root.variantsToggleRequested(!root.variantsEnabled)
                    }
                    Text {
                        Layout.fillWidth: true
                        text: "Cada punto de peso crea una casilla. Máximo: 64."
                        color: window.muted
                        font.family: "Open Sans"
                        font.pixelSize: 9
                        wrapMode: Text.Wrap
                    }
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 32
                        color: "#0b1e31"
                        border.color: window.line
                        Text {
                            anchors.centerIn: parent
                            text: root.totalWeight() + " CASILLAS " + (root.selectedSide === "plants" ? "PLANTA" : "ZOMBI")
                            color: window.text
                            font.family: "Rajdhani"
                            font.pixelSize: 13
                            font.bold: true
                        }
                    }
                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: "SELECCIONAR TODOS"; onClicked: root.selectAllVisible(true) }
                        OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: "LIMPIAR BANDO"; onClicked: root.clearCurrentSide() }
                    }
                    TextField {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 34
                        placeholderText: "Buscar personaje"
                        text: root.searchText
                        color: window.text
                        placeholderTextColor: "#6987a2"
                        leftPadding: 9
                        background: Rectangle { color: "#0b1e31"; border.color: parent.activeFocus ? root.activeAccent : window.line }
                        onTextChanged: { root.searchText = text; root.rebuildVisibleRows() }
                    }
                    Text {
                        Layout.fillWidth: true
                        text: root.selectedCount() + " SELECCIONADOS · " + root.totalWeight() + " CASILLAS"
                        color: root.activeAccent
                        font.family: "Rajdhani"
                        font.pixelSize: 11
                        font.bold: true
                    }
                    GridView {
                        id: pvzCharacterGrid
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        Layout.minimumHeight: 180
                        model: root.visibleRows
                        cellWidth: width
                        cellHeight: 58
                        clip: true
                        reuseItems: true
                        cacheBuffer: 0
                        boundsBehavior: Flickable.StopAtBounds
                        ScrollBar.vertical: ScrollBar { policy: pvzCharacterGrid.contentHeight > pvzCharacterGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }

                        delegate: Rectangle {
                            id: pvzCharacterDelegate
                            required property var modelData
                            property bool chosen: root.isSelected(modelData.key)
                            property int itemWeight: root.characterWeight(modelData.key)
                            property real itemProbability: root.probability(modelData.key)
                            width: pvzCharacterGrid.cellWidth - 5
                            height: pvzCharacterGrid.cellHeight - 5
                            color: chosen ? "#17364f" : "#0a1b2b"
                            border.color: chosen ? root.activeAccent : window.line
                            border.width: chosen ? 2 : 1
                            radius: 3

                            MouseArea {
                                anchors.fill: parent
                                enabled: !parent.chosen && !root.spinning
                                onClicked: root.toggleCharacter(parent.modelData.key)
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
                                    Text { Layout.fillWidth: true; text: String(modelData.name).toUpperCase(); color: window.text; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true; elide: Text.ElideRight }
                                    Text { text: modelData.isVariant ? "VARIANTE" : "PERSONAJE BASE"; color: modelData.isVariant ? "#f6a21a" : root.activeAccent; font.family: "Rajdhani"; font.pixelSize: 8; font.bold: true }
                                }
                                RowLayout {
                                    visible: pvzCharacterDelegate.chosen
                                    spacing: 3
                                    Rectangle {
                                        property bool controlEnabled: !root.spinning && pvzCharacterDelegate.itemWeight > 1 && root.totalWeight() > 2
                                        Layout.preferredWidth: 28
                                        Layout.preferredHeight: 28
                                        color: controlEnabled ? "#1c4164" : "#10283e"
                                        border.color: controlEnabled ? window.line : "#17334d"
                                        Text { anchors.centerIn: parent; text: "−"; color: parent.controlEnabled ? window.text : window.muted; font.pixelSize: 15; font.bold: true }
                                        MouseArea { anchors.fill: parent; enabled: parent.controlEnabled; onClicked: root.changeWeight(modelData.key, -1) }
                                    }
                                    Text { Layout.preferredWidth: 24; text: "x" + pvzCharacterDelegate.itemWeight; color: root.activeAccent; font.family: "Rajdhani"; font.pixelSize: 12; font.bold: true; horizontalAlignment: Text.AlignHCenter }
                                    Rectangle {
                                        property bool controlEnabled: !root.spinning && root.totalWeight() < 64
                                        Layout.preferredWidth: 28
                                        Layout.preferredHeight: 28
                                        color: controlEnabled ? "#1c4164" : "#10283e"
                                        border.color: controlEnabled ? window.line : "#17334d"
                                        Text { anchors.centerIn: parent; text: "+"; color: parent.controlEnabled ? window.text : window.muted; font.pixelSize: 15; font.bold: true }
                                        MouseArea { anchors.fill: parent; enabled: parent.controlEnabled; onClicked: root.changeWeight(modelData.key, 1) }
                                    }
                                    Text { Layout.preferredWidth: 40; text: pvzCharacterDelegate.itemProbability + "%"; color: window.muted; font.family: "Rajdhani"; font.pixelSize: 10; horizontalAlignment: Text.AlignRight }
                                    Rectangle {
                                        Layout.preferredWidth: 28
                                        Layout.preferredHeight: 28
                                        color: "#402033"
                                        border.color: "#7b3145"
                                        Text { anchors.centerIn: parent; text: "×"; color: "#ff7384"; font.pixelSize: 14; font.bold: true }
                                        MouseArea { anchors.fill: parent; enabled: !root.spinning; onClicked: root.toggleCharacter(modelData.key) }
                                    }
                                }
                                Text { visible: !pvzCharacterDelegate.chosen; text: "+"; color: window.muted; font.pixelSize: 17; font.bold: true }
                            }
                        }
                    }
                    OWButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 36
                        text: "CONSTRUIR RULETA " + (root.selectedSide === "plants" ? "PLANTA" : "ZOMBI")
                        activeColor: root.activeAccent
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
                            Text { text: "RESULTADO"; color: root.activeAccent; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true }
                            Text { text: "RULETA " + (root.selectedSide === "plants" ? "PLANTA" : "ZOMBI") + " PERSONALIZADA"; color: window.text; font.family: "Rajdhani"; font.pixelSize: 20; font.bold: true }
                        }
                        Text { text: root.selectedCount() + " SELECCIONADOS · " + root.entries.length + " CASILLAS"; color: window.muted; font.family: "Open Sans"; font.pixelSize: 10 }
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 10

                        Item {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            Layout.minimumWidth: 300

                            Item {
                                id: pvzWheel
                                width: Math.max(0, Math.min(parent.width - 20, parent.height - 116, 540))
                                height: width
                                anchors.horizontalCenter: parent.horizontalCenter
                                anchors.verticalCenter: parent.verticalCenter
                                rotation: root.wheelAngle

                                Canvas {
                                    id: pvzWheelCanvas
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
                                        var palette = root.selectedSide === "plants" ? root.plantPalette : root.zombiePalette
                                        var step = Math.PI * 2 / count
                                        for (var i = 0; i < count; ++i) {
                                            var start = -Math.PI / 2 + i * step
                                            var end = start + step
                                            ctx.beginPath()
                                            ctx.moveTo(cx, cy)
                                            ctx.arc(cx, cy, radius, start, end)
                                            ctx.closePath()
                                            ctx.fillStyle = palette[i % palette.length]
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
                                        ctx.strokeStyle = root.activeAccent
                                        ctx.lineWidth = 5
                                        ctx.stroke()
                                    }
                                    Connections {
                                        target: root
                                        function onEntriesChanged() { pvzWheelCanvas.requestPaint() }
                                        function onSelectedSideChanged() { pvzWheelCanvas.requestPaint() }
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
                                    border.color: root.activeAccent
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
                                anchors.horizontalCenter: pvzWheel.horizontalCenter
                                anchors.top: pvzWheel.top
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
                                    ctx.fillStyle = root.activeAccent
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
                                border.color: root.winner ? root.activeAccent : window.line
                                Column {
                                    anchors.centerIn: parent
                                    width: parent.width - 18
                                    spacing: 2
                                    Text { width: parent.width; text: root.message; color: root.winner ? root.activeAccent : window.text; font.family: "Rajdhani"; font.pixelSize: root.winner ? 18 : 13; font.bold: true; horizontalAlignment: Text.AlignHCenter; elide: Text.ElideRight }
                                    Text { width: parent.width; text: "El bando, las variantes, las casillas y el resultado pertenecen solo a PvZ2."; color: window.muted; font.family: "Open Sans"; font.pixelSize: 9; horizontalAlignment: Text.AlignHCenter; wrapMode: Text.Wrap }
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
                                Text { text: "CASILLAS " + (root.selectedSide === "plants" ? "PLANTA" : "ZOMBI"); color: root.activeAccent; font.family: "Rajdhani"; font.pixelSize: 13; font.bold: true }
                                Text { Layout.fillWidth: true; text: root.entries.length ? root.entries.length + " CASILLAS CONSTRUIDAS" : "AÚN NO CONSTRUIDA"; color: window.muted; font.family: "Open Sans"; font.pixelSize: 9; wrapMode: Text.Wrap }
                                ListView {
                                    id: pvzEntryList
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    model: root.entries
                                    spacing: 4
                                    clip: true
                                    reuseItems: true
                                    cacheBuffer: 0
                                    boundsBehavior: Flickable.StopAtBounds
                                    ScrollBar.vertical: ScrollBar { policy: pvzEntryList.contentHeight > pvzEntryList.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
                                    delegate: Rectangle {
                                        required property var modelData
                                        required property int index
                                        width: pvzEntryList.width - (pvzEntryList.contentHeight > pvzEntryList.height ? 10 : 0)
                                        height: 44
                                        color: root.winner && root.winner.key === modelData.key ? "#17364f" : "#0a1b2b"
                                        border.color: root.winner && root.winner.key === modelData.key ? root.activeAccent : window.line
                                        RowLayout {
                                            anchors.fill: parent
                                            anchors.margins: 4
                                            spacing: 5
                                            Text { Layout.preferredWidth: 22; text: index + 1; color: root.activeAccent; font.family: "Rajdhani"; font.pixelSize: 11; font.bold: true; horizontalAlignment: Text.AlignHCenter }
                                            Image { Layout.preferredWidth: 34; Layout.preferredHeight: 34; source: modelData.portrait; sourceSize.width: 44; sourceSize.height: 44; fillMode: Image.PreserveAspectCrop; asynchronous: false; cache: true }
                                            ColumnLayout {
                                                Layout.fillWidth: true
                                                spacing: 0
                                                Text { Layout.fillWidth: true; text: String(modelData.name).toUpperCase(); color: window.text; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true; elide: Text.ElideRight }
                                                Text { text: modelData.isVariant ? "VARIANTE" : "BASE"; color: modelData.isVariant ? "#f6a21a" : root.activeAccent; font.family: "Rajdhani"; font.pixelSize: 8; font.bold: true }
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
                        text: root.spinning ? "GIRANDO…" : "GIRAR RULETA " + (root.selectedSide === "plants" ? "PLANTA" : "ZOMBI")
                        selected: true
                        activeColor: root.activeAccent
                        enabled: !root.spinning && root.selectedCount() > 0
                        onClicked: root.spin()
                    }
                }
            }
        }
    }
}
