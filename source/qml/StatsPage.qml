import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"
import "StatsLocalization.js" as StatsL10n

Item {
    id: root
    objectName: "statsPage"

    required property var localizer
    property string displayLocale: localizer.displayLocale
    // Route requests through the local helper so packaged builds do not depend
    // on Qt's TLS stack or browser-style cross-origin behavior.
    property string apiRoot: localizer.helperRoot + "/overfast"

    property string selectedPlayerId: ""
    property var selectedSearchPlayer: ({})
    property var searchResults: []
    property var summaryData: ({})
    property var statsSummary: ({})
    property var careerRows: []
    property var rawData: ({})
    property string rawPreview: ""
    property bool rawTruncated: false
    property string statusText: ""
    property bool busy: false
    property int activeRequests: 0
    property int playerLoadRemaining: 0
    property string selectedTab: "overview"
    property string statsGamemode: "all"
    property string statsPlatform: "all"
    property string careerGamemode: "quickplay"
    property string careerPlatform: "pc"
    property string careerHero: "all-heroes"
    property string rawEndpoint: "summary"
    property var heroRows: makeHeroRows(statsSummary)
    property var roleRows: makeRoleRows(statsSummary)
    property var heroOptions: makeHeroOptions(statsSummary)
    property var rankRows: makeRankRows(summaryData)

    OWButton {
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.topMargin: 10
        anchors.rightMargin: 12
        width: 132
        height: 36
        z: 20
        text: localizer.navigationText("profiles")
        onClicked: localizer.navigatePage("profiles")
    }

    function s(key) {
        return StatsL10n.t(displayLocale, key)
    }

    function normalizePlayerId(value) {
        var cleaned = String(value || "").trim()
        return cleaned.replace("#", "-")
    }

    function encodePlayerPath(value) {
        return encodeURIComponent(value).replace(/%257C/gi, "%7C")
    }

    function request(path, callback) {
        activeRequests += 1
        busy = activeRequests > 0
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== XMLHttpRequest.DONE) return
            activeRequests = Math.max(0, activeRequests - 1)
            busy = activeRequests > 0
            var parsed = null
            try {
                parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null
            } catch (error) {
                parsed = null
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(parsed, null, xhr.status)
            } else {
                var message = parsed && parsed.error ? parsed.error : (xhr.status ? "HTTP " + xhr.status : "Network error")
                if (parsed && parsed.retry_after) message += " (retry: " + parsed.retry_after + "s)"
                callback(null, message, xhr.status)
            }
        }
        xhr.open("GET", apiRoot + path)
        xhr.setRequestHeader("X-OverRoll-Token", localizer.helperTokenValue)
        xhr.send()
    }

    function searchPlayers() {
        var query = normalizePlayerId(playerSearch.text)
        if (!query) {
            statusText = s("invalid_id")
            return
        }
        appController.playUiSound("stats_search")
        statusText = s("searching")
        searchResults = []
        request("/players?name=" + encodeURIComponent(query) + "&limit=20", function(data, error) {
            if (error) {
                statusText = s("request_failed") + ": " + error
                return
            }
            searchResults = data && data.results ? data.results : []
            if (!searchResults.length) {
                statusText = s("no_results")
                return
            }
            statusText = searchResults.length + " " + s("search_results")
            for (var i = 0; i < searchResults.length; ++i) {
                if (String(searchResults[i].player_id).toLowerCase() === query.toLowerCase()) {
                    loadPlayer(searchResults[i])
                    break
                }
            }
        })
    }

    function directLoad() {
        var query = normalizePlayerId(playerSearch.text)
        if (!query) {
            statusText = s("invalid_id")
            return
        }
        loadPlayer({ player_id: query, name: query, avatar: "", title: "", is_public: true })
    }

    function statsQuery() {
        var params = []
        if (statsGamemode !== "all") params.push("gamemode=" + encodeURIComponent(statsGamemode))
        if (statsPlatform !== "all") params.push("platform=" + encodeURIComponent(statsPlatform))
        return params.length ? "?" + params.join("&") : ""
    }

    function loadPlayer(player) {
        if (!player || !player.player_id) return
        appController.playUiSound("stats_open")
        selectedSearchPlayer = player
        selectedPlayerId = String(player.player_id)
        summaryData = ({})
        statsSummary = ({})
        careerRows = []
        rawPreview = ""
        rawData = ({})
        rawTruncated = false
        selectedTab = "overview"
        statusText = s("loading")
        playerLoadRemaining = 2

        var encoded = encodePlayerPath(selectedPlayerId)
        request("/players/" + encoded + "/summary", function(data, error) {
            if (data) summaryData = data
            else if (error) statusText = s("request_failed") + ": " + error
            finishPlayerLoad()
        })
        request("/players/" + encoded + "/stats/summary" + statsQuery(), function(data, error) {
            if (data) statsSummary = data
            else if (error) statusText = s("request_failed") + ": " + error
            finishPlayerLoad()
        })
    }

    function finishPlayerLoad() {
        playerLoadRemaining = Math.max(0, playerLoadRemaining - 1)
        if (playerLoadRemaining === 0 && selectedPlayerId) {
            if (statsSummary && statsSummary.general) statusText = s("loaded")
            else statusText = s("profile_private")
        }
    }

    function reloadStats() {
        if (!selectedPlayerId) return
        appController.playUiSound("stats_refresh")
        statusText = s("loading")
        request("/players/" + encodePlayerPath(selectedPlayerId) + "/stats/summary" + statsQuery(), function(data, error) {
            if (data) {
                statsSummary = data
                statusText = data.general ? s("loaded") : s("profile_private")
            } else {
                statusText = s("request_failed") + ": " + error
            }
        })
    }

    function loadCareerLabels() {
        if (!selectedPlayerId) return
        appController.playUiSound("stats_refresh")
        statusText = s("loading")
        var path = "/players/" + encodePlayerPath(selectedPlayerId) + "/stats?gamemode=" + encodeURIComponent(careerGamemode)
        if (careerPlatform) path += "&platform=" + encodeURIComponent(careerPlatform)
        if (careerHero) path += "&hero=" + encodeURIComponent(careerHero)
        request(path, function(data, error) {
            if (data) {
                careerRows = flattenCareer(data)
                statusText = careerRows.length ? s("loaded") : s("no_stats")
            } else {
                careerRows = []
                statusText = s("request_failed") + ": " + error
            }
        })
    }

    function endpointPath() {
        if (!selectedPlayerId) return ""
        var base = "/players/" + encodePlayerPath(selectedPlayerId)
        if (rawEndpoint === "summary") return base + "/summary"
        if (rawEndpoint === "stats-summary") return base + "/stats/summary" + statsQuery()
        if (rawEndpoint === "career") {
            var careerPath = base + "/stats/career?gamemode=" + encodeURIComponent(careerGamemode)
            if (careerPlatform) careerPath += "&platform=" + encodeURIComponent(careerPlatform)
            if (careerHero) careerPath += "&hero=" + encodeURIComponent(careerHero)
            return careerPath
        }
        if (rawEndpoint === "labels") {
            var labelsPath = base + "/stats?gamemode=" + encodeURIComponent(careerGamemode)
            if (careerPlatform) labelsPath += "&platform=" + encodeURIComponent(careerPlatform)
            if (careerHero) labelsPath += "&hero=" + encodeURIComponent(careerHero)
            return labelsPath
        }
        return base + statsQuery()
    }

    function runRawEndpoint() {
        var path = endpointPath()
        if (!path) {
            statusText = s("select_player")
            return
        }
        statusText = s("loading")
        rawPreview = ""
        rawTruncated = false
        request(path, function(data, error) {
            if (data !== null && data !== undefined) {
                rawData = data
                var text = JSON.stringify(data, null, 2)
                var maxLength = 300000
                if (text.length > maxLength) {
                    rawPreview = text.substring(0, maxLength) + "\n\n… " + s("response_truncated")
                    rawTruncated = true
                } else {
                    rawPreview = text
                }
                statusText = s("loaded")
            } else {
                rawPreview = ""
                statusText = s("request_failed") + ": " + error
            }
        })
    }

    function prettyHeroKey(key) {
        if (!key) return ""
        if (key === "dva") return "D.Va"
        if (key === "lucio") return "Lúcio"
        if (key === "soldier-76") return "Soldier: 76"
        if (key === "torbjorn") return "Torbjörn"
        var words = String(key).split("-")
        for (var i = 0; i < words.length; ++i)
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)
        return words.join(" ")
    }

    function localizedHero(key) {
        return localizer.heroName(key, prettyHeroKey(key))
    }

    function heroPortrait(key) {
        return "../data/assets/heroes/" + key + ".png"
    }

    function makeHeroRows(summary) {
        var rows = []
        var heroes = summary && summary.heroes ? summary.heroes : null
        var totalTime = summary && summary.general ? Number(summary.general.time_played || 0) : 0
        if (!heroes) return rows
        for (var key in heroes) {
            var stats = heroes[key]
            if (!stats || Number(stats.time_played || 0) <= 0) continue
            rows.push({
                key: key,
                name: localizedHero(key),
                time_played: Number(stats.time_played || 0),
                games_played: Number(stats.games_played || 0),
                games_won: Number(stats.games_won || 0),
                games_lost: Number(stats.games_lost || 0),
                winrate: Number(stats.winrate || 0),
                kda: Number(stats.kda || 0),
                eliminations: stats.total ? Number(stats.total.eliminations || 0) : 0,
                assists: stats.total ? Number(stats.total.assists || 0) : 0,
                deaths: stats.total ? Number(stats.total.deaths || 0) : 0,
                damage: stats.total ? Number(stats.total.damage || 0) : 0,
                healing: stats.total ? Number(stats.total.healing || 0) : 0,
                usage: totalTime > 0 ? Number(stats.time_played || 0) * 100 / totalTime : 0
            })
        }
        rows.sort(function(a, b) { return b.time_played - a.time_played })
        return rows
    }

    function makeRoleRows(summary) {
        var rows = []
        var roles = summary && summary.roles ? summary.roles : null
        var totalTime = summary && summary.general ? Number(summary.general.time_played || 0) : 0
        if (!roles) return rows
        var order = ["tank", "damage", "support"]
        for (var i = 0; i < order.length; ++i) {
            var key = order[i]
            var stats = roles[key]
            if (!stats) continue
            rows.push({
                key: key,
                name: key === "tank" ? s("tank") : key === "damage" ? s("damage") : s("support"),
                time_played: Number(stats.time_played || 0),
                games_played: Number(stats.games_played || 0),
                games_won: Number(stats.games_won || 0),
                winrate: Number(stats.winrate || 0),
                kda: Number(stats.kda || 0),
                usage: totalTime > 0 ? Number(stats.time_played || 0) * 100 / totalTime : 0,
                eliminations: stats.total ? Number(stats.total.eliminations || 0) : 0,
                assists: stats.total ? Number(stats.total.assists || 0) : 0,
                damage: stats.total ? Number(stats.total.damage || 0) : 0,
                healing: stats.total ? Number(stats.total.healing || 0) : 0
            })
        }
        return rows
    }

    function makeHeroOptions(summary) {
        var options = [{ value: "all-heroes", label: s("all_heroes") }]
        var rows = makeHeroRows(summary)
        for (var i = 0; i < rows.length; ++i)
            options.push({ value: rows[i].key, label: rows[i].name })
        return options
    }

    function makeRankRows(summary) {
        var rows = []
        var comp = summary && summary.competitive ? summary.competitive : null
        if (!comp) return rows
        var platforms = ["pc", "console"]
        var roles = ["tank", "damage", "support", "open"]
        for (var p = 0; p < platforms.length; ++p) {
            var platformKey = platforms[p]
            var platform = comp[platformKey]
            if (!platform) continue
            for (var r = 0; r < roles.length; ++r) {
                var roleKey = roles[r]
                var rank = platform[roleKey]
                if (!rank) continue
                rows.push({
                    platform: platformKey,
                    season: platform.season || "",
                    role: roleKey,
                    division: rank.division || "",
                    tier: rank.tier || "",
                    rank_icon: rank.rank_icon || "",
                    tier_icon: rank.tier_icon || ""
                })
            }
        }
        return rows
    }

    function overviewMetrics() {
        var g = statsSummary && statsSummary.general ? statsSummary.general : null
        if (!g) return []
        return [
            { label: s("time_played"), value: formatDuration(g.time_played) },
            { label: s("games"), value: formatNumber(g.games_played) },
            { label: s("wins"), value: formatNumber(g.games_won) },
            { label: s("winrate"), value: formatPercent(g.winrate) },
            { label: s("kda"), value: formatDecimal(g.kda, 2) },
            { label: s("eliminations"), value: formatNumber(g.total ? g.total.eliminations : 0) },
            { label: s("damage"), value: formatNumber(g.total ? g.total.damage : 0) },
            { label: s("healing"), value: formatNumber(g.total ? g.total.healing : 0) }
        ]
    }

    function flattenCareer(data) {
        var rows = []
        if (!data) return rows
        for (var heroKey in data) {
            var categories = data[heroKey]
            if (!categories || !categories.length) continue
            rows.push({ kind: "hero", label: heroKey === "all-heroes" ? s("all_heroes") : localizedHero(heroKey), value: "" })
            for (var i = 0; i < categories.length; ++i) {
                var category = categories[i]
                rows.push({ kind: "category", label: category.label || humanize(category.category), value: "" })
                var stats = category.stats || []
                for (var j = 0; j < stats.length; ++j) {
                    var stat = stats[j]
                    rows.push({ kind: "stat", key: stat.key || "", label: stat.label || humanize(stat.key), value: formatCareerValue(stat.key, stat.value) })
                }
            }
        }
        return rows
    }

    function humanize(value) {
        var words = String(value || "").replace(/_/g, " ").split(" ")
        for (var i = 0; i < words.length; ++i)
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)
        return words.join(" ")
    }

    function formatCareerValue(key, value) {
        if (value === null || value === undefined) return "—"
        var lowered = String(key || "").toLowerCase()
        if (lowered.indexOf("time") >= 0 || lowered.indexOf("duration") >= 0) return formatDuration(value)
        if (lowered.indexOf("percentage") >= 0 || lowered.indexOf("accuracy") >= 0 || lowered.indexOf("rate") >= 0) return formatPercent(value)
        if (typeof value === "number") return Math.floor(value) === value ? formatNumber(value) : formatDecimal(value, 2)
        return String(value)
    }

    function formatDuration(value) {
        var total = Math.max(0, Math.round(Number(value || 0)))
        var hours = Math.floor(total / 3600)
        var minutes = Math.floor((total % 3600) / 60)
        var seconds = total % 60
        if (hours > 0) return hours + "h " + minutes + "m"
        if (minutes > 0) return minutes + "m " + seconds + "s"
        return seconds + "s"
    }

    function formatNumber(value) {
        var number = Math.round(Number(value || 0))
        var text = String(Math.abs(number))
        var output = ""
        while (text.length > 3) {
            output = "," + text.slice(-3) + output
            text = text.slice(0, -3)
        }
        output = text + output
        return number < 0 ? "-" + output : output
    }

    function formatDecimal(value, decimals) {
        var number = Number(value || 0)
        return number.toFixed(decimals === undefined ? 1 : decimals)
    }

    function formatPercent(value) {
        return formatDecimal(value, 1) + "%"
    }

    function formatDate(timestamp) {
        if (!timestamp) return "—"
        try {
            return new Date(Number(timestamp) * 1000).toLocaleString()
        } catch (error) {
            return "—"
        }
    }

    function roleDisplayName(key) {
        if (key === "tank") return s("tank")
        if (key === "damage") return s("damage")
        if (key === "support") return s("support")
        return s("open_queue")
    }


    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 10

        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 46
            spacing: 10
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0
                Text {
                    text: root.s("statistics")
                    color: localizer.text
                    font.family: "Rajdhani"
                    font.pixelSize: 27
                    font.bold: true
                }
                Text {
                    Layout.fillWidth: true
                    text: root.statusText || root.s("select_player")
                    color: root.statusText.indexOf(root.s("request_failed")) === 0 ? "#ff6375" : localizer.muted
                    font.family: "Open Sans"
                    font.pixelSize: 9
                    elide: Text.ElideRight
                }
            }
            BusyIndicator {
                Layout.preferredWidth: 28
                Layout.preferredHeight: 28
                running: root.busy
                visible: running
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: searchResultsPanel.visible ? 220 : 62
            color: localizer.panel
            border.color: localizer.line
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 7

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 7
                    TextField {
                        id: playerSearch
                        objectName: "statsSearchField"
                        Layout.fillWidth: true
                        Layout.preferredHeight: 40
                        placeholderText: root.s("search_hint")
                        color: localizer.text
                        placeholderTextColor: localizer.muted
                        selectByMouse: true
                        font.family: "Open Sans"
                        font.pixelSize: 11
                        leftPadding: 10
                        onAccepted: root.searchPlayers()
                        background: Rectangle {
                            color: "#0b1e31"
                            border.color: playerSearch.activeFocus ? localizer.cyan : localizer.line
                            border.width: 1
                        }
                    }
                    OWButton {
                        objectName: "statsSearchButton"
                        Layout.preferredWidth: 150
                        Layout.preferredHeight: 40
                        text: root.s("search")
                        selected: true
                        enabled: !root.busy
                        onClicked: root.searchPlayers()
                    }
                }

                ListView {
                    id: searchResultsPanel
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible: root.searchResults.length > 0
                    model: root.searchResults
                    orientation: ListView.Horizontal
                    spacing: 7
                    clip: true
                    reuseItems: true
                    cacheBuffer: 0
                    boundsBehavior: Flickable.StopAtBounds
                    ScrollBar.horizontal: ScrollBar {
                        policy: searchResultsPanel.contentWidth > searchResultsPanel.width ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                    }

                    delegate: Rectangle {
                        required property var modelData
                        width: 260
                        height: searchResultsPanel.height - (searchResultsPanel.contentWidth > searchResultsPanel.width ? 12 : 0)
                        color: root.selectedPlayerId === String(modelData.player_id) ? "#16395a" : resultMouse.containsMouse ? "#102b44" : "#0b1e31"
                        border.color: root.selectedPlayerId === String(modelData.player_id) ? localizer.orange : localizer.line
                        border.width: 1

                        RowLayout {
                            anchors.fill: parent
                            anchors.margins: 8
                            spacing: 8
                            Rectangle {
                                Layout.preferredWidth: 48
                                Layout.preferredHeight: 48
                                color: "#071320"
                                border.color: localizer.line
                                Image {
                                    anchors.fill: parent
                                    anchors.margins: 2
                                    source: modelData.avatar || ""
                                    sourceSize.width: 52
                                    sourceSize.height: 52
                                    fillMode: Image.PreserveAspectCrop
                                    asynchronous: true
                                    cache: false
                                }
                            }
                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 1
                                Text {
                                    Layout.fillWidth: true
                                    text: modelData.name || root.s("player")
                                    color: localizer.text
                                    font.family: "Rajdhani"
                                    font.pixelSize: 14
                                    font.bold: true
                                    elide: Text.ElideRight
                                }
                                Text {
                                    Layout.fillWidth: true
                                    text: modelData.title || (modelData.is_public === false ? root.s("private_profile") : root.s("public_profile"))
                                    color: localizer.muted
                                    font.family: "Open Sans"
                                    font.pixelSize: 8
                                    elide: Text.ElideRight
                                }
                            }
                        }
                        MouseArea {
                            id: resultMouse
                            objectName: "statsSearchResult"
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: root.loadPlayer(modelData)
                        }
                    }
                }
            }
        }

        Item {
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: !root.selectedPlayerId

            Column {
                anchors.centerIn: parent
                spacing: 10
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: root.s("select_player")
                    color: localizer.text
                    font.family: "Rajdhani"
                    font.pixelSize: 28
                    font.bold: true
                }
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: root.s("direct_help")
                    color: localizer.muted
                    font.family: "Open Sans"
                    font.pixelSize: 11
                }
                Rectangle {
                    anchors.horizontalCenter: parent.horizontalCenter
                    width: 230
                    height: 3
                    color: localizer.orange
                }
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: !!root.selectedPlayerId
            spacing: 8

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 104
                color: "#0a1d30"
                border.color: localizer.line
                border.width: 1

                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 10
                    spacing: 11

                    Rectangle {
                        Layout.preferredWidth: 76
                        Layout.preferredHeight: 76
                        color: "#06111d"
                        border.color: localizer.orange
                        border.width: 2
                        Image {
                            anchors.fill: parent
                            anchors.margins: 3
                            source: root.summaryData.avatar || root.selectedSearchPlayer.avatar || ""
                            sourceSize.width: 84
                            sourceSize.height: 84
                            fillMode: Image.PreserveAspectCrop
                            asynchronous: true
                            cache: false
                        }
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 1
                        Text {
                            Layout.fillWidth: true
                            text: root.summaryData.username || root.selectedSearchPlayer.name || root.s("player")
                            color: localizer.text
                            font.family: "Rajdhani"
                            font.pixelSize: 23
                            font.bold: true
                            elide: Text.ElideRight
                        }
                        Text {
                            Layout.fillWidth: true
                            text: root.summaryData.title || root.selectedSearchPlayer.title || ""
                            color: localizer.orange
                            font.family: "Open Sans"
                            font.pixelSize: 10
                            elide: Text.ElideRight
                        }
                        Text {
                            Layout.fillWidth: true
                            text: root.s("last_updated") + ": " + root.formatDate(root.summaryData.last_updated_at || root.selectedSearchPlayer.last_updated_at)
                            color: localizer.muted
                            font.family: "Open Sans"
                            font.pixelSize: 8
                            elide: Text.ElideRight
                        }
                    }

                    GridLayout {
                        Layout.preferredWidth: Math.min(590, parent.width * 0.46)
                        columns: 4
                        columnSpacing: 6
                        rowSpacing: 6

                        DarkComboBox {
                            id: gameModeBox
                            Layout.columnSpan: 2
                            Layout.fillWidth: true
                            Layout.preferredHeight: 34
                            model: [
                                { value: "all", label: root.s("all_modes") },
                                { value: "quickplay", label: root.s("quickplay") },
                                { value: "competitive", label: root.s("competitive") }
                            ]
                            textRole: "label"
                            valueRole: "value"
                            onActivated: { root.statsGamemode = currentValue; appController.playUiSound("stats_filter") }
                            contentItem: Text {
                                text: gameModeBox.displayText
                                color: localizer.text
                                leftPadding: 9
                                verticalAlignment: Text.AlignVCenter
                                font.family: "Rajdhani"
                                font.pixelSize: 10
                            }
                            background: Rectangle { color: "#0b1e31"; border.color: localizer.line }
                        }
                        DarkComboBox {
                            id: platformBox
                            Layout.columnSpan: 2
                            Layout.fillWidth: true
                            Layout.preferredHeight: 34
                            model: [
                                { value: "all", label: root.s("all_platforms") },
                                { value: "pc", label: root.s("pc") },
                                { value: "console", label: root.s("console") }
                            ]
                            textRole: "label"
                            valueRole: "value"
                            onActivated: { root.statsPlatform = currentValue; appController.playUiSound("stats_filter") }
                            contentItem: Text {
                                text: platformBox.displayText
                                color: localizer.text
                                leftPadding: 9
                                verticalAlignment: Text.AlignVCenter
                                font.family: "Rajdhani"
                                font.pixelSize: 10
                            }
                            background: Rectangle { color: "#0b1e31"; border.color: localizer.line }
                        }
                        OWButton {
                            Layout.columnSpan: 2
                            Layout.fillWidth: true
                            Layout.preferredHeight: 32
                            text: root.s("refresh")
                            selected: true
                            enabled: !root.busy
                            onClicked: root.reloadStats()
                        }
                        OWButton {
                            Layout.columnSpan: 2
                            Layout.fillWidth: true
                            Layout.preferredHeight: 32
                            text: root.s("link_profile")
                            enabled: !!root.selectedPlayerId
                            onClicked: { appController.playUiSound("stats_link"); localizer.linkStatsPlayerToCurrentProfile(root.selectedSearchPlayer, root.selectedPlayerId) }
                        }
                    }
                }
            }

            RowLayout {
                Layout.fillWidth: true
                Layout.preferredHeight: 40
                spacing: 5
                Repeater {
                    model: [
                        { id: "overview", label: root.s("overview") },
                        { id: "heroes", label: root.s("heroes") },
                        { id: "roles", label: root.s("roles") },
                        { id: "career", label: root.s("career") }
                    ]
                    delegate: OWButton {
                        required property var modelData
                        Layout.fillWidth: true
                        Layout.preferredHeight: 38
                        text: modelData.label
                        selected: root.selectedTab === modelData.id
                        onClicked: { root.selectedTab = modelData.id; appController.playUiSound("stats_tab") }
                    }
                }
            }

            StackLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                currentIndex: root.selectedTab === "overview" ? 0 : root.selectedTab === "heroes" ? 1 : root.selectedTab === "roles" ? 2 : 3

                    Flickable {
                        id: overviewScroll
                        clip: true
                        contentWidth: width
                        contentHeight: overviewColumn.implicitHeight
                        boundsBehavior: Flickable.StopAtBounds
                        ScrollBar.vertical: ScrollBar {
                            policy: overviewScroll.contentHeight > overviewScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                        }

                        Column {
                            id: overviewColumn
                            width: overviewScroll.width - (overviewScroll.contentHeight > overviewScroll.height ? 10 : 0)
                            spacing: 10

                            GridLayout {
                                width: parent.width
                                columns: width >= 900 ? 4 : 2
                                columnSpacing: 8
                                rowSpacing: 8
                                Repeater {
                                    model: root.overviewMetrics()
                                    delegate: Rectangle {
                                        required property var modelData
                                        Layout.fillWidth: true
                                        Layout.preferredHeight: 82
                                        color: "#0b1e31"
                                        border.color: localizer.line
                                        border.width: 1
                                        Column {
                                            anchors.centerIn: parent
                                            width: parent.width - 16
                                            spacing: 1
                                            Text {
                                                width: parent.width
                                                text: modelData.value
                                                color: localizer.text
                                                font.family: "Rajdhani"
                                                font.pixelSize: 22
                                                font.bold: true
                                                horizontalAlignment: Text.AlignHCenter
                                                elide: Text.ElideRight
                                            }
                                            Text {
                                                width: parent.width
                                                text: modelData.label.toUpperCase()
                                                color: localizer.orange
                                                font.family: "Rajdhani"
                                                font.pixelSize: 9
                                                font.bold: true
                                                horizontalAlignment: Text.AlignHCenter
                                                elide: Text.ElideRight
                                            }
                                        }
                                    }
                                }
                            }

                            Rectangle {
                                width: parent.width
                                height: root.heroRows.length ? 122 : 68
                                color: "#0b1e31"
                                border.color: localizer.line
                                border.width: 1
                                RowLayout {
                                    anchors.fill: parent
                                    anchors.margins: 9
                                    spacing: 12
                                    visible: root.heroRows.length > 0
                                    Image {
                                        Layout.preferredWidth: 82
                                        Layout.preferredHeight: 82
                                        source: root.heroRows.length ? root.heroPortrait(root.heroRows[0].key) : ""
                                        sourceSize.width: 88
                                        sourceSize.height: 88
                                        fillMode: Image.PreserveAspectCrop
                                        asynchronous: true
                                        cache: false
                                    }
                                    ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 1
                                        Text {
                                            text: root.s("top_hero")
                                            color: localizer.orange
                                            font.family: "Rajdhani"
                                            font.pixelSize: 10
                                            font.bold: true
                                        }
                                        Text {
                                            Layout.fillWidth: true
                                            text: root.heroRows.length ? root.heroRows[0].name : ""
                                            color: localizer.text
                                            font.family: "Rajdhani"
                                            font.pixelSize: 22
                                            font.bold: true
                                            elide: Text.ElideRight
                                        }
                                        Text {
                                            Layout.fillWidth: true
                                            text: root.heroRows.length ? root.formatDuration(root.heroRows[0].time_played) + " · " + root.formatPercent(root.heroRows[0].usage) : ""
                                            color: localizer.muted
                                            font.family: "Open Sans"
                                            font.pixelSize: 10
                                        }
                                    }
                                    Rectangle {
                                        Layout.preferredWidth: Math.min(610, Math.max(310, parent.width * 0.48))
                                        Layout.fillHeight: true
                                        visible: root.rankRows.length > 0
                                        color: "#071522"
                                        border.color: localizer.line
                                        ListView {
                                            id: compactRanks
                                            anchors.fill: parent
                                            anchors.margins: 5
                                            orientation: ListView.Horizontal
                                            model: root.rankRows
                                            spacing: 5
                                            clip: true
                                            boundsBehavior: Flickable.StopAtBounds
                                            delegate: Rectangle {
                                                required property var modelData
                                                width: 145
                                                height: compactRanks.height
                                                color: "#0a2136"
                                                border.color: "#234764"
                                                RowLayout {
                                                    anchors.fill: parent
                                                    anchors.margins: 6
                                                    spacing: 6
                                                    Image {
                                                        Layout.preferredWidth: 52
                                                        Layout.preferredHeight: 52
                                                        source: modelData.rank_icon || modelData.tier_icon || ""
                                                        fillMode: Image.PreserveAspectFit
                                                        asynchronous: true
                                                        cache: true
                                                    }
                                                    ColumnLayout {
                                                        Layout.fillWidth: true
                                                        spacing: 0
                                                        Text {
                                                            Layout.fillWidth: true
                                                            text: root.roleDisplayName(modelData.role)
                                                            color: localizer.text
                                                            font.family: "Rajdhani"
                                                            font.pixelSize: 11
                                                            font.bold: true
                                                            elide: Text.ElideRight
                                                        }
                                                        Text {
                                                            Layout.fillWidth: true
                                                            text: String(modelData.division || "").toUpperCase() + " " + String(modelData.tier || "")
                                                            color: localizer.orange
                                                            font.family: "Rajdhani"
                                                            font.pixelSize: 10
                                                            font.bold: true
                                                            elide: Text.ElideRight
                                                        }
                                                        Text {
                                                            text: String(modelData.platform || "").toUpperCase()
                                                            color: localizer.cyan
                                                            font.family: "Open Sans"
                                                            font.pixelSize: 8
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                Text {
                                    anchors.centerIn: parent
                                    visible: !root.heroRows.length
                                    text: root.s("no_stats")
                                    color: localizer.muted
                                    font.family: "Open Sans"
                                    font.pixelSize: 10
                                }
                            }

                            Rectangle {
                                width: parent.width
                                height: 0
                                visible: false
                                color: "#0b1e31"
                                border.color: localizer.line
                                border.width: 1
                                Column {
                                    id: rankColumn
                                    anchors.left: parent.left
                                    anchors.right: parent.right
                                    anchors.top: parent.top
                                    anchors.margins: 12
                                    spacing: 7
                                    Text {
                                        text: root.s("rank")
                                        color: localizer.orange
                                        font.family: "Rajdhani"
                                        font.pixelSize: 14
                                        font.bold: true
                                    }
                                    Repeater {
                                        model: root.rankRows
                                        delegate: Rectangle {
                                            required property var modelData
                                            width: rankColumn.width
                                            height: 42
                                            color: index % 2 ? "#091a2b" : "#0a2136"
                                            RowLayout {
                                                anchors.fill: parent
                                                anchors.margins: 8
                                                Text {
                                                    Layout.preferredWidth: 100
                                                    text: String(modelData.platform).toUpperCase()
                                                    color: localizer.cyan
                                                    font.family: "Rajdhani"
                                                    font.pixelSize: 11
                                                    font.bold: true
                                                }
                                                Text {
                                                    Layout.fillWidth: true
                                                    text: root.roleDisplayName(modelData.role)
                                                    color: localizer.text
                                                    font.family: "Rajdhani"
                                                    font.pixelSize: 12
                                                    font.bold: true
                                                }
                                                Text {
                                                    text: String(modelData.division || "") + " " + String(modelData.tier || "")
                                                    color: localizer.orange
                                                    font.family: "Rajdhani"
                                                    font.pixelSize: 12
                                                    font.bold: true
                                                }
                                            }
                                        }
                                    }
                                    Text {
                                        width: parent.width
                                        visible: !root.rankRows.length
                                        text: root.s("no_comp")
                                        color: localizer.muted
                                        font.family: "Open Sans"
                                        font.pixelSize: 10
                                    }
                                }
                            }
                        }
                    }
                

                    GridView {
                        id: heroesGrid
                        property int columns: width >= 1100 ? 3 : width >= 720 ? 2 : 1
                        model: root.heroRows
                        cellWidth: width / columns
                        cellHeight: 128
                        clip: true
                        reuseItems: true
                        cacheBuffer: 0
                        boundsBehavior: Flickable.StopAtBounds
                        ScrollBar.vertical: ScrollBar {
                            policy: heroesGrid.contentHeight > heroesGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                        }

                        delegate: Rectangle {
                            required property var modelData
                            width: heroesGrid.cellWidth - 8
                            height: heroesGrid.cellHeight - 8
                            x: 4
                            y: 4
                            color: "#0b1e31"
                            border.color: localizer.line
                            border.width: 1
                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 9
                                spacing: 9
                                Image {
                                    Layout.preferredWidth: 68
                                    Layout.preferredHeight: 68
                                    source: root.heroPortrait(modelData.key)
                                    sourceSize.width: 72
                                    sourceSize.height: 72
                                    fillMode: Image.PreserveAspectCrop
                                    asynchronous: true
                                    cache: false
                                }
                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 2
                                    Text {
                                        Layout.fillWidth: true
                                        text: modelData.name
                                        color: localizer.text
                                        font.family: "Rajdhani"
                                        font.pixelSize: 16
                                        font.bold: true
                                        elide: Text.ElideRight
                                    }
                                    Text {
                                        text: root.formatDuration(modelData.time_played) + " · " + root.formatPercent(modelData.usage)
                                        color: localizer.orange
                                        font.family: "Open Sans"
                                        font.pixelSize: 9
                                    }
                                    Rectangle {
                                        Layout.fillWidth: true
                                        Layout.preferredHeight: 7
                                        color: "#06111d"
                                        Rectangle {
                                            width: parent.width * Math.min(1, modelData.usage / 100)
                                            height: parent.height
                                            color: localizer.orange
                                        }
                                    }
                                    GridLayout {
                                        Layout.fillWidth: true
                                        columns: 2
                                        columnSpacing: 6
                                        rowSpacing: 1
                                        Text { text: root.s("games") + ": " + root.formatNumber(modelData.games_played); color: localizer.muted; font.family: "Open Sans"; font.pixelSize: 8 }
                                        Text { text: root.s("wins") + ": " + root.formatNumber(modelData.games_won); color: localizer.muted; font.family: "Open Sans"; font.pixelSize: 8 }
                                        Text { text: root.s("winrate") + ": " + root.formatPercent(modelData.winrate); color: localizer.muted; font.family: "Open Sans"; font.pixelSize: 8 }
                                        Text { text: root.s("kda") + ": " + root.formatDecimal(modelData.kda, 2); color: localizer.muted; font.family: "Open Sans"; font.pixelSize: 8 }
                                    }
                                }
                            }
                        }

                        footer: Text {
                            width: heroesGrid.width
                            height: root.heroRows.length ? 0 : 70
                            text: root.s("no_stats")
                            color: localizer.muted
                            font.family: "Open Sans"
                            font.pixelSize: 11
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                        }
                    }
                

                    GridView {
                        id: rolesGrid
                        property int columns: width >= 940 ? 3 : 1
                        model: root.roleRows
                        cellWidth: width / columns
                        cellHeight: columns === 3 ? height : 170
                        clip: true
                        reuseItems: true
                        cacheBuffer: 0
                        boundsBehavior: Flickable.StopAtBounds
                        ScrollBar.vertical: ScrollBar {
                            policy: rolesGrid.contentHeight > rolesGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                        }

                        delegate: Rectangle {
                            required property var modelData
                            width: rolesGrid.cellWidth - 10
                            height: rolesGrid.cellHeight - 10
                            x: 5
                            y: 5
                            color: "#0b1e31"
                            border.color: modelData.key === "tank" ? "#42c8ff" : modelData.key === "damage" ? "#ff5b69" : "#5ce1a2"
                            border.width: 2
                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 12
                                spacing: 6
                                Text {
                                    Layout.fillWidth: true
                                    text: modelData.name.toUpperCase()
                                    color: localizer.text
                                    font.family: "Rajdhani"
                                    font.pixelSize: 21
                                    font.bold: true
                                    horizontalAlignment: Text.AlignHCenter
                                }
                                Text {
                                    Layout.fillWidth: true
                                    text: root.formatPercent(modelData.usage) + " " + root.s("usage")
                                    color: localizer.orange
                                    font.family: "Rajdhani"
                                    font.pixelSize: 16
                                    font.bold: true
                                    horizontalAlignment: Text.AlignHCenter
                                }
                                Rectangle {
                                    Layout.fillWidth: true
                                    Layout.preferredHeight: 8
                                    color: "#06111d"
                                    Rectangle {
                                        width: parent.width * Math.min(1, modelData.usage / 100)
                                        height: parent.height
                                        color: localizer.orange
                                    }
                                }
                                GridLayout {
                                    Layout.fillWidth: true
                                    columns: 2
                                    columnSpacing: 8
                                    rowSpacing: 5
                                    Repeater {
                                        model: [
                                            { l: root.s("time_played"), v: root.formatDuration(modelData.time_played) },
                                            { l: root.s("games"), v: root.formatNumber(modelData.games_played) },
                                            { l: root.s("wins"), v: root.formatNumber(modelData.games_won) },
                                            { l: root.s("winrate"), v: root.formatPercent(modelData.winrate) },
                                            { l: root.s("kda"), v: root.formatDecimal(modelData.kda, 2) },
                                            { l: root.s("damage"), v: root.formatNumber(modelData.damage) },
                                            { l: root.s("healing"), v: root.formatNumber(modelData.healing) }
                                        ]
                                        delegate: ColumnLayout {
                                            required property var modelData
                                            Layout.fillWidth: true
                                            spacing: 0
                                            Text { text: modelData.l; color: localizer.muted; font.family: "Open Sans"; font.pixelSize: 8 }
                                            Text { text: modelData.v; color: localizer.text; font.family: "Rajdhani"; font.pixelSize: 12; font.bold: true }
                                        }
                                    }
                                }
                                Item { Layout.fillHeight: true }
                            }
                        }
                    }
                

                    ColumnLayout {
                        spacing: 8
                        GridLayout {
                            Layout.fillWidth: true
                            columns: 4
                            columnSpacing: 7
                            rowSpacing: 7
                            DarkComboBox {
                                id: careerModeBox
                                Layout.fillWidth: true
                                model: [
                                    { value: "quickplay", label: root.s("quickplay") },
                                    { value: "competitive", label: root.s("competitive") }
                                ]
                                textRole: "label"
                                valueRole: "value"
                                onActivated: { root.careerGamemode = currentValue; appController.playUiSound("stats_filter") }
                                contentItem: Text { text: careerModeBox.displayText; color: localizer.text; leftPadding: 9; verticalAlignment: Text.AlignVCenter; font.family: "Rajdhani"; font.pixelSize: 10 }
                                background: Rectangle { color: "#0b1e31"; border.color: localizer.line }
                            }
                            DarkComboBox {
                                id: careerPlatformBox
                                Layout.fillWidth: true
                                model: [
                                    { value: "pc", label: root.s("pc") },
                                    { value: "console", label: root.s("console") }
                                ]
                                textRole: "label"
                                valueRole: "value"
                                onActivated: { root.careerPlatform = currentValue; appController.playUiSound("stats_filter") }
                                contentItem: Text { text: careerPlatformBox.displayText; color: localizer.text; leftPadding: 9; verticalAlignment: Text.AlignVCenter; font.family: "Rajdhani"; font.pixelSize: 10 }
                                background: Rectangle { color: "#0b1e31"; border.color: localizer.line }
                            }
                            DarkComboBox {
                                id: careerHeroBox
                                Layout.fillWidth: true
                                model: root.heroOptions
                                textRole: "label"
                                valueRole: "value"
                                onActivated: { root.careerHero = currentValue; appController.playUiSound("stats_filter") }
                                contentItem: Text { text: careerHeroBox.displayText; color: localizer.text; leftPadding: 9; verticalAlignment: Text.AlignVCenter; font.family: "Rajdhani"; font.pixelSize: 10 }
                                background: Rectangle { color: "#0b1e31"; border.color: localizer.line }
                            }
                            OWButton {
                                Layout.fillWidth: true
                                text: root.s("load_career")
                                selected: true
                                enabled: !root.busy
                                onClicked: root.loadCareerLabels()
                            }
                        }

                        Text {
                            Layout.fillWidth: true
                            text: root.s("career_mode_note")
                            color: localizer.muted
                            font.family: "Open Sans"
                            font.pixelSize: 9
                            elide: Text.ElideRight
                        }

                        ListView {
                            id: careerList
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            model: root.careerRows
                            spacing: 2
                            clip: true
                            reuseItems: true
                            cacheBuffer: 0
                            boundsBehavior: Flickable.StopAtBounds
                            ScrollBar.vertical: ScrollBar {
                                policy: careerList.contentHeight > careerList.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                            }
                            delegate: Rectangle {
                                required property var modelData
                                required property int index
                                width: careerList.width - (careerList.contentHeight > careerList.height ? 10 : 0)
                                height: modelData.kind === "hero" ? 44 : modelData.kind === "category" ? 34 : 30
                                color: modelData.kind === "hero" ? "#173653"
                                       : modelData.kind === "category" ? "#0f2941"
                                       : index % 2 ? "#091a2b" : "#0b1e31"
                                border.color: modelData.kind === "hero" ? localizer.orange : "transparent"
                                border.width: modelData.kind === "hero" ? 1 : 0
                                RowLayout {
                                    anchors.fill: parent
                                    anchors.leftMargin: modelData.kind === "stat" ? 24 : 10
                                    anchors.rightMargin: 10
                                    Text {
                                        Layout.fillWidth: true
                                        text: modelData.label
                                        color: modelData.kind === "hero" ? localizer.text
                                               : modelData.kind === "category" ? localizer.orange : localizer.muted
                                        font.family: modelData.kind === "stat" ? "Open Sans" : "Rajdhani"
                                        font.pixelSize: modelData.kind === "hero" ? 16 : modelData.kind === "category" ? 12 : 10
                                        font.bold: modelData.kind !== "stat"
                                        elide: Text.ElideRight
                                    }
                                    Text {
                                        visible: modelData.kind === "stat"
                                        text: modelData.value
                                        color: localizer.text
                                        font.family: "Rajdhani"
                                        font.pixelSize: 12
                                        font.bold: true
                                    }
                                }
                            }
                            footer: Text {
                                width: careerList.width
                                height: root.careerRows.length ? 0 : 70
                                text: root.s("career_mode_note")
                                color: localizer.muted
                                font.family: "Open Sans"
                                font.pixelSize: 11
                                horizontalAlignment: Text.AlignHCenter
                                verticalAlignment: Text.AlignVCenter
                            }
                        }
                    }
                
            }
        }
    }
}
