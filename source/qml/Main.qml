pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Window
import QtQuick.Controls
import QtQuick.Layouts
import "components"
import "LocalizationData.js" as L10n
import "StatsLocalization.js" as StatsL10n
import "RouletteCatalog.js" as RouletteCatalog
import "OtherHeroShooterCatalogs.js" as OtherCatalogs

ApplicationWindow {
    id: window
    width: 1280
    height: 800
    minimumWidth: 1024
    minimumHeight: 640
    visible: true
    title: "OverRoll: " + (L10n.titles[displayLocale] || "Random Hero Picker")
    color: "#040a12"

    property string displayLocale: appController.locale
    property string activePage: "result"
    property bool statsLoaded: false
    property bool customLocale: !L10n.nativeLocales[displayLocale]
    property var localeChoices: L10n.localeChoices
    property var ui: L10n.buildUi(displayLocale, appController.ui)
    property var remoteHeroTranslations: ({})
    property var localizationRequests: ({})
    property int localizationRevision: 0
    property var localizedProfileModes: [
        { id: "classic", name: ui.mode_classic },
        { id: "allprofile", name: ui.mode_allprofile },
        { id: "lowprob", name: ui.mode_lowprob },
        { id: "practice", name: ui.mode_practice },
        { id: "played", name: ui.mode_played },
        { id: "prefer", name: ui.mode_prefer },
        { id: "main", name: ui.mode_main }
    ]
    property color orange: "#f6a21a"
    property color cyan: "#43cfff"
    property color panel: "#091828"
    property color panel2: "#0e2237"
    property color line: "#234764"
    property color text: "#f5f8fc"
    property color muted: "#94b2cd"
    property bool profilesLoaded: false
    property bool settingsLoaded: false
    property bool helpLoaded: false
    property bool localLoaded: false
    property string selectedFormat: appController.mode
    property bool rouletteSpinning: false
    property real rouletteAngle: 0
    property real rouletteTargetAngle: 0
    property int rouletteSlots: 8
    property bool rouletteTankEnabled: true
    property bool rouletteDamageEnabled: true
    property bool rouletteSupportEnabled: true
    property var rouletteSelectedHeroes: ({})
    property var rouletteHeroWeights: ({})
    property var rouletteEntries: []
    property var rouletteWinner: null
    property string rouletteHeroSearch: ""
    property string rouletteMessage: ""
    property bool rouletteDirty: true
    property int rouletteRevision: 0
    property string rouletteGame: "overwatch"
    property var rouletteCatalogDefinition: OtherCatalogs.catalog(rouletteGame, RouletteCatalog.heroes)
    property var rouletteCatalog: rouletteCatalogDefinition.heroes
    property string helperRoot: typeof localHelperRoot !== "undefined" ? localHelperRoot : ""
    property string helperTokenValue: typeof localHelperToken !== "undefined" ? localHelperToken : ""
    property var syncState: ({ "version": 1, "profiles": ({}) })
    property int syncRevision: 0
    property string syncStatus: ""
    property var obsOverlayInstance: null
    property string secretInputBuffer: ""
    property bool secretDps78ShortcutPending: false
    property bool secretFroggerShortcutPending: false

    function overwatchPortrait(row) {
        if (!row)
            return ""
        return appController.heroPortrait(
                    window.rouletteGame === "overwatch" ? String(row.key || "") : "",
                    String(row.portrait || ""))
    }

    function revealSecret(code) {
        secretCode.text = code
        secretIcon.source = appController.secretNotificationIcon(code)
        secretDescription.text = code === "FROGGER"
                ? (appController.locale === "en-us"
                   ? "Alternate Lucio portrait unlocked."
                   : "Retrato alternativo de Lucio desbloqueado.")
                : (appController.locale === "en-us"
                   ? "Alternate Damage portraits unlocked."
                   : "Retratos alternativos de Daño desbloqueados.")
        secretToast.visible = true
        secretToast.opacity = 0
        secretShift.x = 56
        secretToastAnimation.restart()
    }

    function acceptSecretCharacter(character) {
        var cleaned = String(character || "").toUpperCase().replace(/[^A-Z0-9]/g, "")
        if (!cleaned.length)
            return
        secretInputBuffer = (secretInputBuffer + cleaned).slice(-16)
        appController.acceptSecretCharacter(cleaned)
    }

    function submitSecretCode(code) {
        var value = String(code || "").toUpperCase()
        for (var index = 0; index < value.length; ++index)
            appController.acceptSecretCharacter(value.charAt(index))
        secretInputBuffer = ""
        secretDps78ShortcutPending = false
        secretFroggerShortcutPending = false
    }

    function toggleFullscreen() {
        visibility = visibility === Window.FullScreen ? Window.Windowed : Window.FullScreen
    }

    Shortcut {
        sequences: ["F11"]
        onActivated: window.toggleFullscreen()
    }

    Shortcut {
        sequence: "D, P, S, 7"
        context: Qt.ApplicationShortcut
        onActivated: {
            window.secretDps78ShortcutPending = true
            secretShortcutTimer.restart()
        }
    }

    Shortcut {
        sequence: "8"
        context: Qt.ApplicationShortcut
        enabled: window.secretDps78ShortcutPending
        onActivated: window.submitSecretCode("DPS78")
    }

    Shortcut {
        sequence: "F, R, O, G"
        context: Qt.ApplicationShortcut
        onActivated: {
            window.secretFroggerShortcutPending = true
            secretShortcutTimer.restart()
        }
    }

    Shortcut {
        sequence: "G, E, R"
        context: Qt.ApplicationShortcut
        enabled: window.secretFroggerShortcutPending
        onActivated: window.submitSecretCode("FROGGER")
    }

    Timer {
        id: secretShortcutTimer
        interval: 3000
        repeat: false
        onTriggered: {
            window.secretDps78ShortcutPending = false
            window.secretFroggerShortcutPending = false
        }
    }

    Item {
        id: secretKeyCatcher
        anchors.fill: parent
        focus: true
        z: -100
        Keys.onPressed: function(event) {
            if (event.text && event.text.length)
                window.acceptSecretCharacter(event.text)
            event.accepted = false
        }
    }

    onActiveChanged: {
        if (active)
            Qt.callLater(secretKeyCatcher.forceActiveFocus)
    }

    function syncOverlayWindow() {
        if (appController.overlayEnabled && !obsOverlayInstance) {
            obsOverlayInstance = obsOverlayComponent.createObject(window)
            Qt.callLater(window.resetOverlayPosition)
        } else if (!appController.overlayEnabled && obsOverlayInstance) {
            obsOverlayInstance.destroy()
            obsOverlayInstance = null
        }
    }

    function resetOverlayPosition() {
        if (!obsOverlayInstance || !obsOverlayInstance.screen)
            return
        var area = obsOverlayInstance.screen.availableGeometry
        obsOverlayInstance.x = area.x + Math.max(0, area.width - obsOverlayInstance.width - 24)
        obsOverlayInstance.y = area.y + 24
    }

    onClosing: {
        if (obsOverlayInstance) {
            obsOverlayInstance.destroy()
            obsOverlayInstance = null
        }
    }

    Component {
        id: obsOverlayComponent
        Window {
            id: obsOverlay
            property bool showRoulette: window.selectedFormat === "roulette" && !!window.rouletteWinner
            property bool moduleResult: moduleManager.activeGame !== "overwatch"
            property int overlayCount: moduleResult ? moduleManager.activeSlots.length : appController.resultCount
            property int cardWidth: appController.overlayCardSize
            property int cardHeight: Math.round(cardWidth * 1.35)
            property int cardGap: appController.overlaySpacing
            property bool verticalLayout: appController.overlayOrientation === "vertical"
            property int columns: verticalLayout ? 1
                                  : appController.overlayColumns > 0
                                    ? Math.min(appController.overlayColumns, Math.max(1, overlayCount))
                                    : Math.min(8, Math.max(1, overlayCount))
            property int rows: Math.max(1, Math.ceil(overlayCount / columns))
            property int gridWidth: columns * cardWidth + Math.max(0, columns - 1) * cardGap
            property int gridHeight: rows * cardHeight + Math.max(0, rows - 1) * cardGap

            width: showRoulette ? 240 : Math.max(76, gridWidth + 16)
            height: showRoulette ? 250 : Math.max(96, gridHeight + 16)
            minimumWidth: 76
            minimumHeight: 96
            visible: true
            opacity: appController.overlayOpacity / 100
            title: "OverRoll Overlay"
            color: "transparent"
            flags: Qt.Window | Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint

            DragHandler {
                target: null
                onActiveChanged: if (active) obsOverlay.startSystemMove()
            }

            Grid {
                id: overlayGrid
                anchors.centerIn: parent
                width: obsOverlay.gridWidth
                height: obsOverlay.gridHeight
                visible: !obsOverlay.showRoulette && !obsOverlay.moduleResult
                columns: obsOverlay.columns
                spacing: obsOverlay.cardGap

                Repeater {
                    model: appController.pickModel
                    delegate: OverlayHeroCard {
                        width: obsOverlay.cardWidth
                        height: obsOverlay.cardHeight
                        localizer: window
                    }
                }
            }

            Grid {
                id: moduleOverlayGrid
                anchors.centerIn: parent
                width: obsOverlay.gridWidth
                height: obsOverlay.gridHeight
                visible: !obsOverlay.showRoulette && obsOverlay.moduleResult
                columns: obsOverlay.columns
                spacing: obsOverlay.cardGap

                Repeater {
                    model: moduleManager.activeSlotModel
                    delegate: Rectangle {
                        id: moduleOverlayCard
                        required property var modelData
                        property bool mini: width < 105
                        width: obsOverlay.cardWidth
                        height: obsOverlay.cardHeight
                        color: "#ed071521"
                        border.width: 2
                        border.color: modelData.side === "plants" ? "#75d66b"
                                      : modelData.side === "zombies" ? "#a985dd"
                                      : (modelData.hero && modelData.hero.role === "duelist") ? "#ff5b69"
                                      : (modelData.hero && modelData.hero.role === "strategist") ? "#5ce1a2"
                                      : window.cyan

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: moduleOverlayCard.mini ? 4 : 10
                            spacing: moduleOverlayCard.mini ? 2 : 7
                            Text {
                                Layout.fillWidth: true
                                text: modelData.name || ""
                                visible: appController.overlayShowNames && !moduleOverlayCard.mini
                                color: window.muted
                                font.pixelSize: 11
                                horizontalAlignment: Text.AlignHCenter
                                elide: Text.ElideRight
                            }
                            Image {
                                Layout.alignment: Qt.AlignHCenter
                                Layout.preferredWidth: moduleOverlayCard.mini
                                                       ? Math.max(30, moduleOverlayCard.width - 12)
                                                       : Math.max(64, obsOverlay.cardWidth - 50)
                                Layout.preferredHeight: Layout.preferredWidth
                                source: modelData.hero
                                        ? (modelData.hero.variant
                                           ? modelData.hero.variant.portrait
                                           : modelData.hero.portrait)
                                        : ""
                                fillMode: Image.PreserveAspectCrop
                                asynchronous: true
                                cache: true
                            }
                            Text {
                                Layout.fillWidth: true
                                text: modelData.hero ? String(modelData.hero.name).toUpperCase() : "?"
                                color: "#ffffff"
                                font.family: "Rajdhani"
                                font.pixelSize: moduleOverlayCard.mini ? 9 : 20
                                font.bold: true
                                horizontalAlignment: Text.AlignHCenter
                                elide: Text.ElideRight
                            }
                            Text {
                                Layout.fillWidth: true
                                text: modelData.hero && modelData.hero.variant
                                      ? modelData.hero.variant.name
                                      : modelData.hero ? String(modelData.hero.role || modelData.side || "").toUpperCase() : ""
                                visible: appController.overlayShowDetails && !moduleOverlayCard.mini
                                color: window.orange
                                font.pixelSize: 10
                                font.bold: true
                                horizontalAlignment: Text.AlignHCenter
                                elide: Text.ElideRight
                            }
                        }
                    }
                }
            }

            Rectangle {
                anchors.centerIn: parent
                width: 210
                height: 220
                visible: obsOverlay.showRoulette
                color: "#f2071422"
                border.width: 2
                border.color: window.orange
                radius: 3

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 8

                    Image {
                        Layout.alignment: Qt.AlignHCenter
                        Layout.preferredWidth: 155
                        Layout.preferredHeight: 155
                        source: window.overwatchPortrait(window.rouletteWinner)
                        fillMode: Image.PreserveAspectCrop
                        asynchronous: true
                        cache: true
                    }

                    Text {
                        Layout.fillWidth: true
                        text: window.rouletteWinner
                              ? window.rouletteDisplayName(window.rouletteWinner).toUpperCase()
                              : ""
                        color: "#ffffff"
                        font.family: "Rajdhani"
                        font.pixelSize: 24
                        font.bold: true
                        horizontalAlignment: Text.AlignHCenter
                        elide: Text.ElideRight
                    }
                }
            }
        }
    }

    function navigatePage(page) {
        appController.playUiSound("nav_click")
        activePage = page
        if (page === "stats") {
            statsLoaded = true
            return
        }
        appController.navigate(page)
    }

    property string pendingMenuPage: ""

    function navigateFromMore(page) {
        pendingMenuPage = page
        moreMenu.close()
        menuNavigationTimer.restart()
    }

    Timer {
        id: menuNavigationTimer
        interval: 1
        repeat: false
        onTriggered: {
            var page = window.pendingMenuPage
            window.pendingMenuPage = ""
            if (page !== "")
                window.navigatePage(page)
        }
    }

    function navigationText(page) {
        if (page === "result") return StatsL10n.t(displayLocale, "principal")
        if (page === "games") return displayLocale.indexOf("es-") === 0 ? "JUEGOS" : "GAMES"
        if (page === "stats") return StatsL10n.t(displayLocale, "statistics")
        if (page === "profiles") return ui.profiles
        if (page === "settings") return ui.settings
        if (page === "help") return ui.help
        return page
    }

    function setDisplayLocale(locale) {
        displayLocale = locale
        moduleManager.setDisplayLocale(locale)
        appController.setLocale(L10n.nativeLocales[locale] ? locale : "en-us")
    }

    function t(key) {
        var value = ui[key]
        return value === undefined || value === null ? appController.tr(key) : value
    }

    function heroName(key, fallback) {
        return L10n.heroName(displayLocale, key, fallback)
    }

    function roleName(role, fallback) {
        return customLocale && ui[role] ? ui[role] : fallback
    }

    function subroleName(subrole, fallback) {
        return L10n.subroleName(displayLocale, subrole, fallback)
    }

    function profileModeName(mode) {
        if (!customLocale) return appController.profileModeName
        var key = "mode_" + mode
        return ui[key] || appController.profileModeName
    }

    function profileModeDescription(mode) {
        if (!customLocale) return appController.profileModeDescription
        var key = "mode_" + mode + "_help"
        return ui[key] || appController.profileModeDescription
    }

    function localizedBackendText(value) {
        if (!customLocale || !value) return value
        var map = ({
            "Ready to randomize": ui.ready,
            "Set up the squad and press Generate team.": ui.ready_body,
            "No update is running.": ui.api_idle,
            "Updating local snapshot…": ui.api_running,
            "Cancelling update…": ui.api_cancelling,
            "Update cancelled. Previous local data was kept.": ui.api_cancelled,
            "Data updated. The app is using the new snapshot.": ui.api_done,
            "The update could not be completed.": ui.api_failed,
            "No valid combination matches those roles, profiles, and filters.": ui.no_candidates,
            "No other hero is available for this card.": ui.no_alternative,
            "Result cards copied to the clipboard.": ui.image_copied,
            "1-2-2 Team": ui.team_122,
            "2-2-2 Team": ui.team_222,
            "Custom team": ui.custom_team,
            "2 custom teams": ui.custom_teams
        })
        return map[value] || value
    }

    function localizedResultTitle(value) {
        return localizedBackendText(value)
    }

    function localizedResultSummary(value) {
        if (!customLocale || !value) return value
        return value.replace(/\bTank\b/g, ui.tank)
                    .replace(/\bDamage\b/g, ui.damage)
                    .replace(/\bSupport\b/g, ui.support)
                    .replace(/\bPlayers\b/g, ui.players)
    }

    function localizedSnapshotLabel(value) {
        if (!customLocale || !value) return value
        var prefix = "Local data · Updated "
        if (value.indexOf(prefix) === 0) return ui.snapshot.replace("{date}", value.substring(prefix.length))
        if (value === "Local data · No date") return ui.snapshot_unknown
        return value
    }

    function localizeProfileTag(value) {
        if (!value) return value
        var replacements = ({
            "Main": ss("bucket_main"),
            "Played": ss("bucket_used"),
            "Used": ss("bucket_used"),
            "Usado": ss("bucket_used"),
            "Practice": ss("bucket_practice"),
            "Práctica": ss("bucket_practice"),
            "En práctica": ss("bucket_practice"),
            "Jugado": ss("bucket_practice"),
            "Avoid": ss("bucket_unused"),
            "Unused": ss("bucket_unused"),
            "No usado": ss("bucket_unused"),
            "Sin usar": ss("bucket_unused"),
            "Unmarked": ui.unmarked,
            "No profile": ui.no_profile
        })
        for (var key in replacements) {
            if (value === key) return replacements[key]
            var suffix = " · " + key
            if (value.lastIndexOf(suffix) === value.length - suffix.length)
                return value.substring(0, value.length - key.length) + replacements[key]
        }
        return value
    }

    function filterState(profileLocked, allowed) {
        if (!customLocale) return profileLocked ? "PERFIL" : allowed ? "ON" : "OFF"
        return profileLocked ? ui.profile_locked : allowed ? ui.on : ui.off
    }

    function gameModeLabel(stadiumMode) {
        if (!customLocale) return stadiumMode ? "STADIUM" : "QUICK PLAY"
        return stadiumMode ? ui.stadium_label : ui.quickplay_label
    }

    function flattenLocalizedHeroItems(data) {
        var items = []
        if (data && data.perks) {
            var groups = ["minor", "major"]
            for (var g = 0; g < groups.length; ++g) {
                var rows = data.perks[groups[g]] || []
                for (var i = 0; i < rows.length; ++i) items.push(rows[i])
            }
        }
        var powers = data && data.stadium_powers ? data.stadium_powers : []
        for (var p = 0; p < powers.length; ++p) items.push(powers[p])
        return items
    }

    function ensureHeroLocalization(heroKey) {
        // Normal use stays offline; translations come from the local snapshot.
        return
    }

    function perkName(heroKey, fallback) {
        var revisionDependency = localizationRevision
        ensureHeroLocalization(heroKey)
        var localeCache = remoteHeroTranslations[displayLocale]
        var heroCache = localeCache ? localeCache[heroKey] : null
        return heroCache && heroCache.names[fallback] ? heroCache.names[fallback] : fallback
    }

    function perkDescription(heroKey, fallback) {
        var revisionDependency = localizationRevision
        ensureHeroLocalization(heroKey)
        var localeCache = remoteHeroTranslations[displayLocale]
        var heroCache = localeCache ? localeCache[heroKey] : null
        return heroCache && heroCache.descriptions[fallback] ? heroCache.descriptions[fallback] : fallback
    }

    function ss(key) {
        return StatsL10n.t(displayLocale, key)
    }

    function helperRequest(method, path, payload, callback) {
        if (!helperRoot || !helperTokenValue) {
            callback(null, "Local helper unavailable")
            return
        }
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== XMLHttpRequest.DONE) return
            var parsed = null
            try { parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null } catch (error) { parsed = null }
            if (xhr.status >= 200 && xhr.status < 300) callback(parsed, null)
            else callback(null, parsed && parsed.error ? parsed.error : (xhr.status ? "HTTP " + xhr.status : "Network error"))
        }
        xhr.open(method, helperRoot + path)
        xhr.setRequestHeader("X-OverRoll-Token", helperTokenValue)
        if (payload !== null && payload !== undefined) {
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.send(JSON.stringify(payload))
        } else xhr.send()
    }

    function loadSyncState() {
        helperRequest("GET", "/state", null, function(data, error) {
            if (data && data.profiles) syncState = data
            else syncState = ({ "version": 1, "profiles": ({}) })
            syncRevision += 1
            loadRouletteConfig()
            if (error) syncStatus = ss("sync_helper_warning")
        })
    }

    function saveSyncState(state) {
        syncState = state
        syncRevision += 1
        helperRequest("PUT", "/state", state, function(data, error) {
            if (error) syncStatus = ss("sync_save_failed") + ": " + error
        })
    }

    function defaultSyncConfig() {
        return ({ mode: "manual", battleTag: "", playerId: "", platform: "pc", lockedHeroes: [], lastSync: "", lastStatus: "" })
    }

    function syncConfig(profileId) {
        var dependency = syncRevision
        if (!profileId) return defaultSyncConfig()
        var profiles = syncState && syncState.profiles ? syncState.profiles : ({})
        var cfg = profiles[profileId]
        if (!cfg) return defaultSyncConfig()
        return ({
            mode: cfg.mode || "manual",
            battleTag: cfg.battleTag || "",
            playerId: cfg.playerId || "",
            platform: cfg.platform || "pc",
            lockedHeroes: cfg.lockedHeroes || [],
            lastSync: cfg.lastSync || "",
            lastStatus: cfg.lastStatus || ""
        })
    }

    function currentSyncConfig() {
        return syncConfig(appController.currentProfileId)
    }

    function updateSyncConfig(patch) {
        var profileId = appController.currentProfileId
        if (!profileId) { syncStatus = ss("sync_need_profile"); return }
        var state = JSON.parse(JSON.stringify(syncState || ({ "version": 1, "profiles": ({}) })))
        if (!state.profiles) state.profiles = ({})
        var cfg = syncConfig(profileId)
        for (var key in patch) cfg[key] = patch[key]
        state.profiles[profileId] = cfg
        saveSyncState(state)
    }

    function setConnectionMode(mode) {
        updateSyncConfig({ mode: mode })
        syncStatus = mode === "manual" ? ss("manual_help") : mode === "synced" ? ss("synced_help") : ss("hybrid_help")
    }

    function heroLocked(heroKey) {
        var locked = currentSyncConfig().lockedHeroes || []
        return locked.indexOf(heroKey) >= 0
    }

    function setHeroLocked(heroKey, lockedValue) {
        var locked = (currentSyncConfig().lockedHeroes || []).slice(0)
        var index = locked.indexOf(heroKey)
        if (lockedValue && index < 0) locked.push(heroKey)
        if (!lockedValue && index >= 0) locked.splice(index, 1)
        updateSyncConfig({ lockedHeroes: locked })
    }

    function toggleHeroLocked(heroKey) {
        setHeroLocked(heroKey, !heroLocked(heroKey))
    }

    function setProfileHeroBucket(heroKey, bucket) {
        if (appController.profileGame !== "overwatch") {
            appController.setHeroBucket(heroKey, bucket)
            return
        }
        var mode = currentSyncConfig().mode
        if (mode === "synced") return
        if (mode === "hybrid") setHeroLocked(heroKey, true)
        appController.setHeroBucket(heroKey, bucket)
    }

    function clearProfileBuckets() {
        if (appController.profileGame !== "overwatch") {
            appController.clearProfileCategories()
            return
        }
        var mode = currentSyncConfig().mode
        if (mode === "synced") return
        if (mode === "hybrid") {
            var all = []
            var rows = appController.localHeroRows || []
            for (var i = 0; i < rows.length; ++i) all.push(rows[i].key)
            updateSyncConfig({ lockedHeroes: all })
        }
        appController.clearProfileCategories()
    }

    function normalizeBattleTag(value) {
        return String(value || "").trim().replace("#", "-")
    }

    function encodedPlayerId(value) {
        return encodeURIComponent(value).replace(/%257C/gi, "%7C")
    }

    function statsForHero(heroes, key) {
        if (!heroes) return null
        return heroes[key] || heroes[key.replace(/-/g, "_")] || heroes[key.replace(/_/g, "-")] || null
    }

    function applySyncedStats(stats, player, normalizedTag) {
        var cfg = currentSyncConfig()
        var heroes = stats && stats.heroes ? stats.heroes : ({})
        var rows = appController.localHeroRows || []
        var changed = 0
        for (var i = 0; i < rows.length; ++i) {
            var heroKey = rows[i].key
            if (cfg.mode === "hybrid" && heroLocked(heroKey)) continue
            var heroStats = statsForHero(heroes, heroKey)
            var seconds = heroStats ? Number(heroStats.time_played || 0) : 0
            var bucket = seconds >= 108000 ? "main" : seconds >= 18000 ? "played" : seconds > 0 ? "practice" : "avoid"
            appController.setHeroBucket(heroKey, bucket)
            changed += 1
        }
        var stamp = new Date().toISOString()
        updateSyncConfig({
            battleTag: normalizedTag,
            playerId: String(player.player_id || cfg.playerId || normalizedTag),
            lastSync: stamp,
            lastStatus: ss("sync_loaded")
        })
        syncStatus = ss("sync_loaded") + " · " + changed + " " + ss("heroes_updated")
    }

    function synchronizeCurrentProfile() {
        var profileId = appController.currentProfileId
        if (!profileId) { syncStatus = ss("sync_need_profile"); return }
        var cfg = currentSyncConfig()
        if (cfg.mode === "manual") { syncStatus = ss("manual_help"); return }
        var query = normalizeBattleTag(cfg.battleTag)
        if (!query) { syncStatus = ss("sync_need_battletag"); return }
        syncStatus = ss("sync_searching")
        helperRequest("GET", "/overfast/players?name=" + encodeURIComponent(query) + "&limit=20", null, function(data, error) {
            if (error) { syncStatus = ss("sync_failed") + ": " + error; return }
            var results = data && data.results ? data.results : []
            if (!results.length) { syncStatus = ss("no_results"); return }
            var chosen = results[0]
            for (var i = 0; i < results.length; ++i) {
                if (String(results[i].player_id || "").toLowerCase() === query.toLowerCase()) { chosen = results[i]; break }
            }
            var playerId = String(chosen.player_id || query)
            var path = "/overfast/players/" + encodedPlayerId(playerId) + "/stats/summary?platform=" + encodeURIComponent(cfg.platform || "pc")
            helperRequest("GET", path, null, function(stats, statsError) {
                if (statsError) { syncStatus = ss("sync_failed") + ": " + statsError; return }
                if (!stats || !stats.heroes) { syncStatus = ss("profile_private"); return }
                applySyncedStats(stats, chosen, query)
            })
        })
    }

    function linkStatsPlayerToCurrentProfile(player, playerId) {
        if (!appController.currentProfileId) { syncStatus = ss("sync_need_profile"); navigatePage("profiles"); return }
        var tag = String((player && (player.name || player.player_id)) || playerId || "")
        updateSyncConfig({ battleTag: normalizeBattleTag(tag), playerId: String(playerId || (player ? player.player_id : "") || "") })
        syncStatus = ss("linked_profile")
    }

    function rouletteRows() {
        // The maker uses the bundled catalog directly. The backend list is filled
        // asynchronously and could be empty when this page is opened for the first
        // time, which previously left the picker blank.
        return rouletteCatalog || []
    }

    function rouletteDisplayName(row) {
        if (!row) return ""
        return rouletteGame === "overwatch" ? heroName(row.key, row.name) : String(row.name || "")
    }

    function rouletteGroupName(role) {
        if (rouletteGame === "tf2") {
            if (role === "tank") return ui.hs_group_offense || (displayLocale.indexOf("es-") === 0 ? "Ofensiva" : "Offense")
            if (role === "damage") return ui.hs_group_defense || (displayLocale.indexOf("es-") === 0 ? "Defensa" : "Defense")
            return ui.support
        }
        if (rouletteGame === "pvzgw2") {
            if (role === "tank") return ui.hs_group_plants || (displayLocale.indexOf("es-") === 0 ? "Plantas" : "Plants")
            if (role === "damage") return ui.hs_group_zombies || (displayLocale.indexOf("es-") === 0 ? "Zombis" : "Zombies")
        }
        if (role === "tank") return ui.tank
        if (role === "damage") return ui.damage
        return ui.support
    }

    function rouletteRoleVisible(role) {
        var groups = rouletteCatalogDefinition && rouletteCatalogDefinition.groups
                     ? rouletteCatalogDefinition.groups : []
        for (var i = 0; i < groups.length; ++i) {
            if (groups[i].id === role) return true
        }
        return false
    }

    function setRouletteGame(gameId) {
        var next = String(gameId || "overwatch")
        if (next !== "overwatch" && next !== "tf2" && next !== "pvzgw2") return
        if (rouletteGame === next) {
            selectedFormat = "roulette"
            return
        }
        rouletteGame = next
        rouletteSelectedHeroes = ({})
        rouletteHeroWeights = ({})
        rouletteEntries = []
        rouletteWinner = null
        rouletteTankEnabled = true
        rouletteDamageEnabled = true
        rouletteSupportEnabled = true
        rouletteHeroSearch = ""
        rouletteSlots = 2
        selectedFormat = "roulette"
        rouletteMessage = ss("roulette_pick_heroes")
        rouletteDirty = true
        rouletteRevision += 1
        rouletteSaveTimer.restart()
        appController.playUiSound("mode")
    }

    function rouletteRoleEnabled(role) {
        var normalized = String(role || "").toLowerCase()
        if (normalized === "tank") return rouletteTankEnabled
        if (normalized === "damage") return rouletteDamageEnabled
        if (normalized === "support") return rouletteSupportEnabled
        return false
    }

    function rouletteHeroIsSelected(heroKey) {
        var dependency = rouletteRevision
        return rouletteSelectedHeroes && rouletteSelectedHeroes[heroKey] === true
    }

    function rouletteFilteredRows(includeSearch) {
        var dependency = rouletteRevision
        var rows = rouletteRows()
        var result = []
        var seen = ({})
        var query = includeSearch ? rouletteHeroSearch.trim().toLowerCase() : ""
        for (var i = 0; i < rows.length; ++i) {
            var row = rows[i]
            if (!row || !row.key || seen[row.key]) continue
            seen[row.key] = true
            if (!rouletteRoleEnabled(row.role)) continue
            var localized = rouletteDisplayName(row)
            if (query.length && localized.toLowerCase().indexOf(query) < 0) continue
            result.push(row)
        }
        return result
    }

    function roulettePool() {
        var rows = rouletteFilteredRows(false)
        var result = []
        for (var i = 0; i < rows.length; ++i) {
            if (rouletteHeroIsSelected(rows[i].key)) result.push(rows[i])
        }
        return result
    }

    function rouletteSelectedCount() {
        return roulettePool().length
    }

    function rouletteHeroWeight(heroKey) {
        var dependency = rouletteRevision
        var value = Number(rouletteHeroWeights && rouletteHeroWeights[heroKey] || 1)
        return Math.max(1, Math.min(64, Math.round(value)))
    }

    function rouletteTotalWeight() {
        var pool = roulettePool()
        var total = 0
        for (var i = 0; i < pool.length; ++i) total += rouletteHeroWeight(pool[i].key)
        return total
    }

    function rouletteHeroProbability(heroKey) {
        if (!rouletteHeroIsSelected(heroKey)) return 0
        var total = rouletteTotalWeight()
        if (!total) return 0
        return Math.round(rouletteHeroWeight(heroKey) * 1000 / total) / 10
    }

    function syncRouletteSlotTotal() {
        var total = rouletteTotalWeight()
        rouletteSlots = Math.max(2, Math.min(64, total))
    }

    function markRouletteDirty(message) {
        rouletteDirty = true
        rouletteEntries = []
        rouletteWinner = null
        rouletteAngle = 0
        rouletteMessage = message || ss("roulette_ready_help")
        rouletteRevision += 1
        rouletteSaveTimer.restart()
    }

    function toggleRouletteHero(heroKey) {
        if (!heroKey || rouletteSpinning) return
        var selected = JSON.parse(JSON.stringify(rouletteSelectedHeroes || ({})))
        var weights = JSON.parse(JSON.stringify(rouletteHeroWeights || ({})))
        var wasSelected = selected[heroKey] === true
        if (wasSelected) {
            delete selected[heroKey]
            delete weights[heroKey]
        } else {
            selected[heroKey] = true
            weights[heroKey] = Object.keys(selected).length === 1 ? 2 : 1
        }
        rouletteSelectedHeroes = selected
        rouletteHeroWeights = weights
        rouletteRevision += 1
        if (rouletteSelectedCount() === 1 && rouletteTotalWeight() < 2) {
            var onlyPool = roulettePool()
            if (onlyPool.length) {
                weights[onlyPool[0].key] = 2
                rouletteHeroWeights = weights
                rouletteRevision += 1
            }
        }
        syncRouletteSlotTotal()
        markRouletteDirty(ss("roulette_ready_help"))
        appController.playUiSound(wasSelected ? "toggle_off" : "toggle_on")
    }

    function changeRouletteHeroWeight(heroKey, delta) {
        if (!heroKey || rouletteSpinning || !rouletteHeroIsSelected(heroKey)) return
        var total = rouletteTotalWeight()
        var current = rouletteHeroWeight(heroKey)
        var next = Math.max(1, Math.min(64, current + delta))
        if (delta > 0 && total >= 64) return
        if (delta < 0 && total <= 2) return
        if (next === current) return
        var weights = JSON.parse(JSON.stringify(rouletteHeroWeights || ({})))
        weights[heroKey] = next
        rouletteHeroWeights = weights
        rouletteRevision += 1
        syncRouletteSlotTotal()
        markRouletteDirty(ss("roulette_ready_help"))
        appController.playUiSound("roulette_weight")
    }

    function selectAllRouletteHeroes() {
        if (rouletteSpinning) return
        var selected = ({})
        var weights = ({})
        var rows = rouletteFilteredRows(false)
        for (var i = 0; i < rows.length; ++i) {
            selected[rows[i].key] = true
            weights[rows[i].key] = 1
        }
        rouletteSelectedHeroes = selected
        rouletteHeroWeights = weights
        rouletteRevision += 1
        syncRouletteSlotTotal()
        markRouletteDirty(ss("roulette_ready_help"))
        appController.playUiSound("toggle_on")
    }

    function clearRouletteHeroes() {
        if (rouletteSpinning) return
        rouletteSelectedHeroes = ({})
        rouletteHeroWeights = ({})
        rouletteSlots = 2
        rouletteRevision += 1
        markRouletteDirty(ss("roulette_pick_heroes"))
        appController.playUiSound("toggle_off")
    }

    function setRouletteRole(role, enabled) {
        if (rouletteSpinning) return
        if (role === "tank") rouletteTankEnabled = enabled
        else if (role === "damage") rouletteDamageEnabled = enabled
        else if (role === "support") rouletteSupportEnabled = enabled
        syncRouletteSlotTotal()
        markRouletteDirty(ss("roulette_ready_help"))
        appController.playUiSound(enabled ? "toggle_on" : "toggle_off")
    }

    function shuffledRouletteRows(source) {
        var result = source.slice(0)
        for (var i = result.length - 1; i > 0; --i) {
            var j = Math.floor(Math.random() * (i + 1))
            var temp = result[i]
            result[i] = result[j]
            result[j] = temp
        }
        return result
    }

    function buildRoulette() {
        var pool = roulettePool()
        if (!pool.length) {
            rouletteEntries = []
            rouletteWinner = null
            rouletteMessage = ss("roulette_pick_heroes")
            rouletteRevision += 1
            return false
        }
        var entries = []
        for (var i = 0; i < pool.length; ++i) {
            var copies = rouletteHeroWeight(pool[i].key)
            for (var copy = 0; copy < copies && entries.length < 64; ++copy) entries.push(pool[i])
        }
        if (entries.length === 1) {
            entries.push(entries[0])
        }
        entries = shuffledRouletteRows(entries)
        rouletteSlots = entries.length
        rouletteEntries = entries
        rouletteWinner = null
        rouletteAngle = 0
        rouletteDirty = false
        rouletteMessage = ss("roulette_built")
        rouletteRevision += 1
        rouletteSaveTimer.restart()
        return true
    }

    function buildRouletteAndNotify() {
        var built = buildRoulette()
        if (built) appController.playUiSound("roulette_build")
        return built
    }

    function saveRouletteConfig() {
        var state = JSON.parse(JSON.stringify(syncState || ({ "version": 1, "profiles": ({}) })))
        if (!state.profiles) state.profiles = ({})
        var keys = []
        var weights = ({})
        for (var key in rouletteSelectedHeroes) {
            if (rouletteSelectedHeroes[key] === true) {
                keys.push(key)
                weights[key] = rouletteHeroWeight(key)
            }
        }
        state.roulette = ({
            game: rouletteGame,
            slots: rouletteSlots,
            tank: rouletteTankEnabled,
            damage: rouletteDamageEnabled,
            support: rouletteSupportEnabled,
            selectedHeroes: keys,
            heroWeights: weights
        })
        saveSyncState(state)
    }

    function loadRouletteConfig() {
        var cfg = syncState && syncState.roulette ? syncState.roulette : null
        if (cfg) {
            rouletteGame = cfg.game === "tf2" || cfg.game === "pvzgw2" ? cfg.game : "overwatch"
            rouletteSlots = Math.max(2, Math.min(64, Number(cfg.slots || 8)))
            rouletteTankEnabled = cfg.tank !== false
            rouletteDamageEnabled = cfg.damage !== false
            rouletteSupportEnabled = cfg.support !== false
            var selected = ({})
            var weights = ({})
            var keys = cfg.selectedHeroes || []
            for (var i = 0; i < keys.length; ++i) {
                selected[keys[i]] = true
                weights[keys[i]] = Math.max(1, Math.min(64, Number(cfg.heroWeights && cfg.heroWeights[keys[i]] || 1)))
            }
            if (!cfg.heroWeights && keys.length && Number(cfg.slots || 0) > keys.length) {
                var extras = Math.min(64, Number(cfg.slots)) - keys.length
                for (var extra = 0; extra < extras; ++extra) weights[keys[extra % keys.length]] += 1
            }
            if (keys.length === 1 && weights[keys[0]] < 2) weights[keys[0]] = 2
            rouletteSelectedHeroes = selected
            rouletteHeroWeights = weights
            rouletteRevision += 1
            syncRouletteSlotTotal()
        }
        rouletteDirty = true
        rouletteMessage = rouletteSelectedCount() ? ss("roulette_ready_help") : ss("roulette_pick_heroes")
        rouletteRevision += 1
    }

    function selectFormat(formatId) {
        if (formatId === selectedFormat) return
        selectedFormat = formatId
        if (formatId === "roulette") {
            appController.playUiSound("mode")
            rouletteMessage = rouletteSelectedCount() ? ss("roulette_ready_help") : ss("roulette_pick_heroes")
            return
        }
        appController.setMode(formatId)
    }

    function generateSelectedTeam() {
        if (selectedFormat !== "roulette") { appController.generateTeam(); return }
        if (rouletteSpinning) return
        if ((rouletteDirty || !rouletteEntries.length) && !buildRoulette()) return
        var count = rouletteEntries.length
        if (!count) return
        var winnerIndex = Math.floor(Math.random() * count)
        rouletteWinner = null
        rouletteMessage = ss("roulette_spinning")
        appController.playUiSound("roulette_spin")
        rouletteAngle = 0
        rouletteTargetAngle = 2160 - ((winnerIndex + 0.5) * 360 / count)
        rouletteSpinning = true
        rouletteAnimation.winnerIndex = winnerIndex
        rouletteAnimation.restart()
    }

    NumberAnimation {
        id: rouletteAnimation
        property int winnerIndex: -1
        target: window
        property: "rouletteAngle"
        from: 0
        to: window.rouletteTargetAngle
        duration: 2600
        easing.type: Easing.OutQuint
        onFinished: {
            if (winnerIndex >= 0 && winnerIndex < window.rouletteEntries.length) {
                window.rouletteWinner = window.rouletteEntries[winnerIndex]
                window.rouletteMessage = window.ss("roulette_winner") + ": " + window.rouletteDisplayName(window.rouletteWinner)
                appController.playUiSound("roulette_win")
                if (window.rouletteGame === "overwatch") appController.playRouletteVoice(window.rouletteWinner.key)
            }
            window.rouletteSpinning = false
            window.rouletteRevision += 1
        }
    }

    Timer {
        id: rouletteSaveTimer
        interval: 350
        repeat: false
        onTriggered: window.saveRouletteConfig()
    }

    Component.onCompleted: {
        loadSyncState()
        syncOverlayWindow()
        Qt.callLater(secretKeyCatcher.forceActiveFocus)
    }

    function creditsUrl() {
        // Cada idioma abre una canción cuyo fragmento acompaña el baile de Hammond.
        var links = ({
            "es-mx": "https://youtu.be/4Qy0vs80T5M?t=47",
            "en-us": "https://youtu.be/S9uTScSgzrM?t=95",
            "es-es": "https://youtu.be/lobBMZr14zw?t=126",
            "de-de": "https://youtu.be/ANhQ50bMk8I?t=95",
            "fr-fr": "https://youtu.be/pjJ2w1FX_Wg?t=25",
            "pt-br": "https://youtu.be/HAiHEQblKeQ?t=25",
            "ko-kr": "https://youtu.be/hBpV2qzTGFE?t=95",
            "ja-jp": "https://youtu.be/EjaQdBcF6K4?t=52"
        })
        return links[displayLocale] || links["en-us"]
    }

    function creditsJoke() {
        var jokes = ({
            "es-mx": "¡Se lo llevó el tiburón!",
            "en-us": "I'm already Tracer!",
            "es-es": "¡Hammond se ha marcado un Lúcio!",
            "de-de": "Ich bin schon Tracer!",
            "fr-fr": "Et ça fait bim, bam, boum !",
            "pt-br": "Hammond caiu no samba!",
            "ko-kr": "난 이미 트레이서야!",
            "ja-jp": "ハモンド、オリオンまで転がった！"
        })
        return jokes[displayLocale] || ui.credits_joke
    }

    Connections {
        target: appController
        function onSettingsChanged() { window.syncOverlayWindow() }
        function onPageChanged() {
            if (window.activePage !== "stats") window.activePage = appController.currentPage
            if (appController.currentPage === "profiles") window.profilesLoaded = true
            else if (appController.currentPage === "settings") window.settingsLoaded = true
            else if (appController.currentPage === "help") window.helpLoaded = true
            else if (appController.currentPage === "local") window.localLoaded = true
        }
    }

    background: Rectangle {
        color: "#040a12"
        Repeater {
            model: 8
            Rectangle {
                required property int index
                x: window.width - 280 + index * 36
                y: 80
                width: 1
                height: window.height - 80
                color: index % 2 ? "#0d2235" : "#081725"
                opacity: 0.55
                rotation: 12
                transformOrigin: Item.Top
            }
        }
    }

    header: Rectangle {
        height: 84
        color: "#030913"
        border.color: "#173650"
        border.width: 0

        Rectangle { anchors.left: parent.left; anchors.right: parent.right; anchors.bottom: parent.bottom; height: 2; color: window.orange }

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 18
            anchors.rightMargin: 18
            spacing: 12

            Image {
                Layout.preferredWidth: 48
                Layout.preferredHeight: 48
                source: appController.appIcon
                sourceSize.width: 64
                sourceSize.height: 64
                fillMode: Image.PreserveAspectFit
            }

            ColumnLayout {
                Layout.preferredWidth: 310
                spacing: 0
                Text {
                    text: "OverRoll"
                    color: window.text
                    font.family: "Rajdhani"
                    font.pixelSize: 31
                    font.weight: Font.DemiBold
                    font.letterSpacing: 0
                }
                Text {
                    text: L10n.headerSubtitles[window.displayLocale] || "RANDOM HERO PICKER"
                    color: window.orange
                    font.family: "Rajdhani"
                    font.pixelSize: 11
                    font.bold: true
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }
            }

            Item { Layout.fillWidth: true }

            Button {
                id: snapshotButton
                Layout.preferredWidth: 190
                Layout.preferredHeight: 34
                visible: window.width >= 1440
                hoverEnabled: true
                onHoveredChanged: if (hovered && appController.performanceMode === "high") appController.playUiSound("nav_hover")
                onClicked: window.navigatePage("local")
                contentItem: Text {
                    text: window.localizedSnapshotLabel(appController.snapshotLabel)
                    color: window.orange
                    font.family: "Rajdhani"
                    font.pixelSize: 10
                    font.bold: true
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    elide: Text.ElideRight
                }
                background: Rectangle { color: snapshotButton.hovered ? "#142b43" : "transparent"; radius: 2 }
            }

            OWButton {
                Layout.preferredWidth: 118
                text: window.navigationText("result")
                selected: window.activePage === "result"
                onClicked: window.navigatePage("result")
            }
            OWButton {
                Layout.preferredWidth: 118
                text: window.navigationText("profiles")
                selected: window.activePage === "profiles" || window.activePage === "stats"
                onClicked: window.navigatePage("profiles")
            }
            OWButton {
                id: moreButton
                objectName: "moreButton"
                Layout.preferredWidth: 118
                text: "MÁS"
                selected: window.activePage !== "result"
                          && window.activePage !== "profiles"
                          && window.activePage !== "stats"
                onClicked: moreMenu.open()
            }
            Popup {
                id: moreMenu
                objectName: "moreMenu"
                parent: window.contentItem
                x: window.width - width - 18
                y: 70
                width: 250
                padding: 8
                modal: false
                closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
                background: Rectangle { color: "#071521"; border.color: window.orange; border.width: 1 }
                contentItem: Column {
                    spacing: 5
                    OWButton {
                        objectName: "moreNav_games"
                        width: 234
                        text: "JUEGOS"
                        selected: window.activePage === "games"
                        onClicked: window.navigateFromMore("games")
                    }
                    OWButton {
                        objectName: "moreNav_settings"
                        width: 234
                        text: window.navigationText("settings")
                        selected: window.activePage === "settings"
                        onClicked: window.navigateFromMore("settings")
                    }
                    OWButton {
                        objectName: "moreNav_help"
                        width: 234
                        text: window.navigationText("help")
                        selected: window.activePage === "help"
                        onClicked: window.navigateFromMore("help")
                    }
                    Rectangle { width: 234; height: 1; color: window.line }
                    OWButton {
                        width: 234
                        text: window.visibility === Window.FullScreen ? "SALIR DE PANTALLA COMPLETA · F11" : "PANTALLA COMPLETA · F11"
                        onClicked: { moreMenu.close(); window.toggleFullscreen() }
                    }
                }
            }
        }
    }

    StackLayout {
        anchors.fill: parent
        currentIndex: window.activePage === "result" ? 0
                      : window.activePage === "stats" ? 1
                      : window.activePage === "profiles" ? 2
                      : window.activePage === "settings" ? 3
                      : window.activePage === "help" ? 4
                      : window.activePage === "local" ? 5 : 6

        Loader {
            active: window.activePage === "result"
            asynchronous: false
            sourceComponent: Component {
                Item {
                    id: resultPage

            Loader {
                anchors.fill: parent
                active: moduleManager.activeGame !== "overwatch"
                visible: active
                source: moduleManager.activeView
            }

            function copyVisibleResults() {
                var bodyHeight
                if (appController.resultTeamCount === 1) {
                    var rows = Math.ceil(resultGrid.count / Math.max(1, resultGrid.columns))
                    bodyHeight = Math.min(resultGrid.height, rows * resultGrid.cellHeight)
                } else {
                    bodyHeight = Math.min(teamsScroll.height, teamsColumn.implicitHeight)
                }
                var statusHeight = appController.status.length && appController.hasResults ? 38 : 0
                var captureHeight = Math.ceil(70 + bodyHeight + statusHeight)
                resultSurface.grabToImage(function(grab) {
                    appController.copyResultImage(grab.image, captureHeight)
                })
            }

            RowLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 10
                visible: moduleManager.activeGame === "overwatch"

                Rectangle {
                    id: commandRail
                    property int requestedWidth: window.selectedFormat === "roulette"
                                                 ? Math.max(appController.sidebarWidth, 410)
                                                 : appController.sidebarWidth
                    Layout.preferredWidth: Math.min(requestedWidth, Math.max(326, window.width * 0.38))
                    Layout.minimumWidth: 326
                    Layout.maximumWidth: 460
                    Layout.fillHeight: true
                    color: window.panel
                    border.color: window.line
                    border.width: 1

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 10
                        spacing: 8

                        Text {
                            text: ui.prepare
                            color: window.orange
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
                            ScrollBar.vertical: ScrollBar { policy: railScroll.contentHeight > railScroll.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }

                            Column {
                                id: railColumn
                                width: railScroll.width - (railScroll.contentHeight > railScroll.height ? 10 : 0)
                                spacing: 8

                                SectionPanel {
                                    width: parent.width
                                    height: window.selectedFormat === "roulette" ? 104 : 194
                                    title: ui.format

                                    ColumnLayout {
                                        anchors.fill: parent
                                        spacing: 6
                                        RowLayout {
                                            Layout.fillWidth: true
                                            spacing: 4
                                            Repeater {
                                                model: [
                                                    { id: "team", title: "EQUIPO", sub: "1–24" },
                                                    { id: "roulette", title: window.ss("roulette_format"), sub: window.ss("roulette_maker_short") }
                                                ]
                                                delegate: OWButton {
                                                    required property var modelData
                                                    Layout.fillWidth: true
                                                    Layout.preferredHeight: 42
                                                    text: modelData.title + "\n" + modelData.sub
                                                    selected: modelData.id === "team"
                                                              ? window.selectedFormat !== "roulette"
                                                              : window.selectedFormat === "roulette"
                                                    onClicked: {
                                                        if (modelData.id === "roulette") window.selectFormat("roulette")
                                                        else {
                                                            window.selectedFormat = appController.mode
                                                            appController.setUnifiedPlayerCount(appController.playerCount)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        ColumnLayout {
                                            visible: window.selectedFormat !== "roulette"
                                            Layout.fillWidth: true
                                            spacing: 5
                                            RowLayout {
                                                Layout.fillWidth: true
                                                OWButton { Layout.preferredWidth: 54; text: "−"; onClicked: appController.setUnifiedPlayerCount(appController.playerCount - 1) }
                                                Text {
                                                    Layout.fillWidth: true
                                                    text: appController.playerCount + " " + ui.players
                                                    color: window.text
                                                    font.family: "Rajdhani"
                                                    font.pixelSize: 12
                                                    font.bold: true
                                                    horizontalAlignment: Text.AlignHCenter
                                                }
                                                OWButton { Layout.preferredWidth: 54; text: "+"; onClicked: appController.setUnifiedPlayerCount(appController.playerCount + 1) }
                                            }
                                            RowLayout {
                                                Layout.fillWidth: true
                                                OWButton { Layout.fillWidth: true; text: ui.one_team; selected: appController.customTeams === 1; onClicked: appController.setCustomTeams(1) }
                                                OWButton { Layout.fillWidth: true; text: ui.two_teams; selected: appController.customTeams === 2; onClicked: appController.setCustomTeams(2) }
                                            }
                                        }
                                    }
                                }

                                SectionPanel {
                                    width: parent.width
                                    height: Math.max(548, railScroll.height - 112)
                                    visible: window.selectedFormat === "roulette"
                                    title: window.ss("roulette_maker")

                                    ColumnLayout {
                                        anchors.fill: parent
                                        spacing: 7

                                        Text {
                                            Layout.fillWidth: true
                                            text: window.ss("roulette_weight_hint")
                                            color: window.muted
                                            font.family: "Open Sans"
                                            font.pixelSize: 10
                                            wrapMode: Text.Wrap
                                        }
                                        RowLayout {
                                            Layout.fillWidth: true
                                            Text {
                                                Layout.fillWidth: true
                                                text: window.rouletteCatalogDefinition.name.toUpperCase()
                                                color: window.orange
                                                font.family: "Rajdhani"
                                                font.pixelSize: 13
                                                font.bold: true
                                                elide: Text.ElideRight
                                            }
                                            Text {
                                                text: window.rouletteRows().length + " " + (ui.catalog_entries || (window.displayLocale.indexOf("es-") === 0 ? "personajes" : "characters"))
                                                color: window.muted
                                                font.family: "Open Sans"
                                                font.pixelSize: 9
                                            }
                                        }
                                        Rectangle {
                                            Layout.fillWidth: true
                                            Layout.preferredHeight: 36
                                            color: "#0b1e31"
                                            border.color: window.line
                                            Text {
                                                anchors.centerIn: parent
                                                text: window.rouletteTotalWeight() + " " + window.ss("roulette_slots")
                                                color: window.text
                                                font.family: "Rajdhani"
                                                font.pixelSize: 15
                                                font.bold: true
                                            }
                                        }

                                        Text { text: window.ss("roulette_roles"); color: window.muted; font.family: "Open Sans"; font.pixelSize: 10 }
                                        RowLayout {
                                            Layout.fillWidth: true
                                            spacing: 4
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 32; text: window.rouletteGroupName("tank"); selected: window.rouletteTankEnabled; activeColor: "#42c8ff"; visible: window.rouletteRoleVisible("tank"); onClicked: window.setRouletteRole("tank", !window.rouletteTankEnabled) }
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 32; text: window.rouletteGroupName("damage"); selected: window.rouletteDamageEnabled; activeColor: "#ff5b69"; visible: window.rouletteRoleVisible("damage"); onClicked: window.setRouletteRole("damage", !window.rouletteDamageEnabled) }
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 32; text: window.rouletteGroupName("support"); selected: window.rouletteSupportEnabled; activeColor: "#5ce1a2"; visible: window.rouletteRoleVisible("support"); onClicked: window.setRouletteRole("support", !window.rouletteSupportEnabled) }
                                        }

                                        RowLayout {
                                            Layout.fillWidth: true
                                            spacing: 4
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: window.ss("roulette_select_all"); onClicked: window.selectAllRouletteHeroes() }
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: window.ss("roulette_clear"); onClicked: window.clearRouletteHeroes() }
                                        }

                                        TextField {
                                            Layout.fillWidth: true
                                            Layout.preferredHeight: 34
                                            placeholderText: window.ss("roulette_search")
                                            text: window.rouletteHeroSearch
                                            color: window.text
                                            placeholderTextColor: "#6987a2"
                                            leftPadding: 9
                                            background: Rectangle { color: "#0b1e31"; border.color: parent.activeFocus ? window.cyan : window.line }
                                            onTextChanged: { window.rouletteHeroSearch = text; window.rouletteRevision += 1 }
                                        }

                                        Text {
                                            Layout.fillWidth: true
                                            text: window.rouletteSelectedCount() + " " + window.ss("roulette_selected") + " · " + window.rouletteTotalWeight() + " " + window.ss("roulette_slots")
                                            color: window.orange
                                            font.family: "Rajdhani"
                                            font.pixelSize: 11
                                            font.bold: true
                                        }

                                        GridView {
                                            id: rouletteHeroGrid
                                            objectName: "rouletteHeroGrid"
                                            Layout.fillWidth: true
                                            Layout.fillHeight: true
                                            Layout.minimumHeight: 170
                                            property var visibleRows: window.rouletteFilteredRows(true)
                                            property int columns: 1
                                            model: visibleRows
                                            cellWidth: width / columns
                                            cellHeight: 64
                                            clip: true
                                            reuseItems: true
                                            cacheBuffer: 0
                                            boundsBehavior: Flickable.StopAtBounds
                                            ScrollBar.vertical: ScrollBar { policy: rouletteHeroGrid.contentHeight > rouletteHeroGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
                                            delegate: Rectangle {
                                                required property var modelData
                                                property bool chosen: window.rouletteHeroIsSelected(modelData.key)
                                                property int heroWeight: window.rouletteHeroWeight(modelData.key)
                                                property real heroProbability: window.rouletteHeroProbability(modelData.key)
                                                width: rouletteHeroGrid.cellWidth - 5
                                                height: rouletteHeroGrid.cellHeight - 5
                                                color: chosen ? "#17364f" : "#0a1b2b"
                                                border.color: chosen ? window.orange : window.line
                                                border.width: chosen ? 2 : 1
                                                radius: 3
                                                MouseArea { anchors.fill: parent; enabled: !parent.chosen && !window.rouletteSpinning; onClicked: window.toggleRouletteHero(modelData.key) }
                                                RowLayout {
                                                    anchors.fill: parent
                                                    anchors.margins: 4
                                                    spacing: 5
                                                    Image { Layout.preferredWidth: 44; Layout.preferredHeight: 44; source: window.overwatchPortrait(modelData); sourceSize.width: 56; sourceSize.height: 56; fillMode: Image.PreserveAspectCrop; cache: true; asynchronous: false }
                                                    ColumnLayout {
                                                        Layout.fillWidth: true
                                                        spacing: 0
                                                        Text { Layout.fillWidth: true; text: window.rouletteDisplayName(modelData); color: window.text; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true; elide: Text.ElideRight }
                                                        Text { text: window.rouletteGroupName(modelData.role).toUpperCase(); color: modelData.role === "tank" ? "#42c8ff" : modelData.role === "damage" ? "#ff5b69" : "#5ce1a2"; font.family: "Rajdhani"; font.pixelSize: 8; font.bold: true }
                                                    }
                                                    RowLayout {
                                                        visible: chosen
                                                        spacing: 3
                                                        Rectangle {
                                                            property bool controlEnabled: !window.rouletteSpinning && heroWeight > 1 && window.rouletteTotalWeight() > 2
                                                            Layout.preferredWidth: 30
                                                            Layout.preferredHeight: 28
                                                            color: controlEnabled ? "#1c4164" : "#10283e"
                                                            border.color: controlEnabled ? window.line : "#17334d"
                                                            Text { anchors.centerIn: parent; text: "−"; color: parent.controlEnabled ? window.text : window.muted; font.pixelSize: 16; font.bold: true }
                                                            MouseArea { anchors.fill: parent; enabled: parent.controlEnabled; onClicked: window.changeRouletteHeroWeight(modelData.key, -1) }
                                                        }
                                                        Text {
                                                            Layout.preferredWidth: 24
                                                            text: "x" + heroWeight
                                                            color: window.orange
                                                            font.family: "Rajdhani"
                                                            font.pixelSize: 12
                                                            font.bold: true
                                                            horizontalAlignment: Text.AlignHCenter
                                                        }
                                                        Rectangle {
                                                            property bool controlEnabled: !window.rouletteSpinning && window.rouletteTotalWeight() < 64
                                                            Layout.preferredWidth: 30
                                                            Layout.preferredHeight: 28
                                                            color: controlEnabled ? "#1c4164" : "#10283e"
                                                            border.color: controlEnabled ? window.line : "#17334d"
                                                            Text { anchors.centerIn: parent; text: "+"; color: parent.controlEnabled ? window.text : window.muted; font.pixelSize: 16; font.bold: true }
                                                            MouseArea { anchors.fill: parent; enabled: parent.controlEnabled; onClicked: window.changeRouletteHeroWeight(modelData.key, 1) }
                                                        }
                                                        Text {
                                                            Layout.preferredWidth: 42
                                                            text: heroProbability + "%"
                                                            color: window.muted
                                                            font.family: "Rajdhani"
                                                            font.pixelSize: 10
                                                            horizontalAlignment: Text.AlignRight
                                                        }
                                                        Rectangle {
                                                            Layout.preferredWidth: 30
                                                            Layout.preferredHeight: 28
                                                            color: "#402033"
                                                            border.color: "#7b3145"
                                                            Text { anchors.centerIn: parent; text: "×"; color: "#ff7384"; font.pixelSize: 15; font.bold: true }
                                                            MouseArea { anchors.fill: parent; enabled: !window.rouletteSpinning; onClicked: window.toggleRouletteHero(modelData.key) }
                                                        }
                                                    }
                                                    Text { visible: !chosen; text: "+"; color: window.muted; font.pixelSize: 17; font.bold: true }
                                                }
                                            }
                                        }

                                        OWButton {
                                            Layout.fillWidth: true
                                            Layout.preferredHeight: 36
                                            text: window.ss("roulette_build")
                                            enabled: !window.rouletteSpinning && window.rouletteSelectedCount() > 0
                                            onClicked: window.buildRouletteAndNotify()
                                        }
                                    }
                                }

                                SectionPanel {
                                    width: parent.width
                                    height: Math.min(390, 102 + appController.playerCount * 44)
                                    visible: window.selectedFormat !== "roulette"
                                    title: ui.squad

                                    ColumnLayout {
                                        anchors.fill: parent
                                        spacing: 6
                                        RowLayout {
                                            Layout.fillWidth: true
                                            spacing: 4
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: "LIMPIAR NOMBRES"; onClicked: appController.clearNames() }
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: "REVOLVER PERFILES"; onClicked: appController.shufflePlayers() }
                                            OWButton { Layout.fillWidth: true; Layout.preferredHeight: 30; text: "RESTABLECER ROLES"; onClicked: appController.resetRoles() }
                                        }
                                        ListView {
                                            id: playerList
                                            Layout.fillWidth: true
                                            Layout.fillHeight: true
                                            model: appController.playerModel
                                            spacing: 4
                                            clip: true
                                            boundsBehavior: Flickable.StopAtBounds
                                            ScrollBar.vertical: ScrollBar { policy: playerList.contentHeight > playerList.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
                                            delegate: PlayerRow {
                                                required property string name
                                                required property bool tank
                                                required property bool damage
                                                required property bool support
                                                width: playerList.width - (playerList.contentHeight > playerList.height ? 10 : 0)
                                                playerName: name
                                                tankActive: tank
                                                damageActive: damage
                                                supportActive: support
                                                controller: appController
                                                localizer: window
                                            }
                                        }
                                    }
                                }

                                SectionPanel {
                                    width: parent.width
                                    height: 266
                                    visible: window.selectedFormat !== "roulette"
                                    title: ui.rules
                                    Column {
                                        anchors.fill: parent
                                        spacing: 5
                                        ToggleRow { width: parent.width; text: ui.unique; checkedValue: appController.uniqueHeroes; onClicked: appController.toggleRule("unique") }
                                        ToggleRow { width: parent.width; text: ui.role_composition; checkedValue: appController.quickplayOnly; onClicked: appController.toggleRule("quickplay") }
                                        ToggleRow { width: parent.width; text: ui.random_perks; checkedValue: appController.randomPerks; activeColor: "#f6a21a"; onClicked: appController.toggleRule("perks") }
                                        ToggleRow { width: parent.width; text: ui.roles_only; checkedValue: appController.rolesOnly; activeColor: "#a985ff"; onClicked: appController.toggleRule("roles") }
                                        ToggleRow { width: parent.width; text: ui.stadium; checkedValue: appController.stadium; activeColor: "#ffcc30"; onClicked: appController.toggleRule("stadium") }
                                    }
                                }

                                SectionPanel {
                                    width: parent.width
                                    height: 126
                                    visible: window.selectedFormat !== "roulette"
                                    title: ui.quick_hero
                                    ColumnLayout {
                                        anchors.fill: parent
                                        spacing: 6
                                        RowLayout {
                                            Layout.fillWidth: true
                                            DarkComboBox {
                                                id: quickRoleBox
                                                Layout.fillWidth: true
                                                Layout.preferredHeight: 36
                                                model: [
                                                    { id: "any", name: ui.any_role },
                                                    { id: "tank", name: ui.tank },
                                                    { id: "damage", name: ui.damage },
                                                    { id: "support", name: ui.support }
                                                ]
                                                textRole: "name"
                                                valueRole: "id"
                                                onActivated: appController.setQuickRole(currentValue)
                                                contentItem: Text { text: quickRoleBox.displayText; color: window.text; leftPadding: 10; verticalAlignment: Text.AlignVCenter; font.family: "Rajdhani"; font.pixelSize: 11 }
                                                background: Rectangle { color: "#0b1e31"; border.color: window.line }
                                            }
                                            OWButton { Layout.preferredWidth: 82; Layout.preferredHeight: 36; text: ui.random; onClicked: appController.quickRoll() }
                                        }
                                        OWButton { Layout.fillWidth: true; text: ui.copy_image; enabled: appController.hasResults; onClicked: resultPage.copyVisibleResults() }
                                    }
                                }
                            }
                        }

                        OWButton {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 52
                            text: window.selectedFormat === "roulette" ? window.ss("spin_roulette") : ui.generate
                            selected: true
                            enabled: !window.rouletteSpinning && (window.selectedFormat !== "roulette" || window.rouletteSelectedCount() > 0)
                            onClicked: window.generateSelectedTeam()
                        }
                    }
                }

                Rectangle {
                    id: resultSurface
                    objectName: "resultSurface"
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    color: "#081726"
                    border.color: window.line
                    border.width: 1

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 12
                        spacing: 8

                        RowLayout {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 50
                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 0
                                Text { text: ui.result; color: window.orange; font.family: "Rajdhani"; font.pixelSize: 10; font.bold: true }
                                Text { text: window.selectedFormat === "roulette" ? window.ss("roulette_custom_title") : window.localizedResultTitle(appController.resultTitle); color: window.text; font.family: "Rajdhani"; font.pixelSize: 22; font.weight: Font.DemiBold }
                            }
                            Text { text: window.selectedFormat === "roulette" ? (window.rouletteSelectedCount() + " " + window.ss("roulette_selected") + " · " + window.rouletteSlots + " " + window.ss("roulette_slots")) : window.localizedResultSummary(appController.resultSummary); color: window.muted; font.family: "Open Sans"; font.pixelSize: 11 }
                        }

                        Item {
                            Layout.fillWidth: true
                            Layout.fillHeight: true

                            Column {
                                anchors.centerIn: parent
                                spacing: 10
                                visible: window.selectedFormat !== "roulette" && !appController.hasResults
                                Text { anchors.horizontalCenter: parent.horizontalCenter; text: window.localizedBackendText(appController.resultTitle); color: window.text; font.family: "Rajdhani"; font.pixelSize: 22; font.bold: true }
                                Text { anchors.horizontalCenter: parent.horizontalCenter; text: window.localizedBackendText(appController.status); color: window.muted; font.family: "Open Sans"; font.pixelSize: 12 }
                                Rectangle { anchors.horizontalCenter: parent.horizontalCenter; width: 180; height: 3; color: window.orange }
                            }

                            Item {
                                id: rouletteMakerResult
                                anchors.fill: parent
                                visible: window.selectedFormat === "roulette"
                                z: 80

                                RowLayout {
                                    anchors.fill: parent
                                    spacing: 14

                                    Item {
                                        Layout.fillWidth: true
                                        Layout.fillHeight: true
                                        Layout.minimumWidth: 450

                                        Item {
                                            id: rouletteWheel
                                            width: Math.min(parent.width - 30, parent.height - 120, 620)
                                            height: width
                                            anchors.horizontalCenter: parent.horizontalCenter
                                            anchors.verticalCenter: parent.verticalCenter
                                            rotation: window.rouletteAngle

                                            Canvas {
                                                id: wheelCanvas
                                                anchors.fill: parent
                                                antialiasing: true
                                                onPaint: {
                                                    var ctx = getContext("2d")
                                                    ctx.clearRect(0, 0, width, height)
                                                    var entries = window.rouletteEntries
                                                    var count = entries.length
                                                    var cx = width / 2
                                                    var cy = height / 2
                                                    var radius = Math.min(width, height) / 2 - 7
                                                    if (!count) {
                                                        ctx.beginPath()
                                                        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
                                                        ctx.fillStyle = "#0e2237"
                                                        ctx.fill()
                                                        ctx.strokeStyle = "#234764"
                                                        ctx.lineWidth = 4
                                                        ctx.stroke()
                                                        return
                                                    }
                                                    var palette = ["#f6a21a", "#249bc7", "#8c63d7", "#d94b5d", "#30a978", "#d07d29", "#3877bd", "#a44d9f"]
                                                    var overwatchRoles = {
                                                        "tank": "#32b9e9",
                                                        "damage": "#f04f64",
                                                        "support": "#55d99a"
                                                    }
                                                    var step = Math.PI * 2 / count
                                                    for (var i = 0; i < count; ++i) {
                                                        var start = -Math.PI / 2 + i * step
                                                        var end = start + step
                                                        ctx.beginPath()
                                                        ctx.moveTo(cx, cy)
                                                        ctx.arc(cx, cy, radius, start, end)
                                                        ctx.closePath()
                                                        var roleKey = String(entries[i].role || "").toLowerCase()
                                                        ctx.fillStyle = window.rouletteGame === "overwatch"
                                                                ? (overwatchRoles[roleKey] || palette[i % palette.length])
                                                                : palette[i % palette.length]
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
                                                            var label = window.rouletteDisplayName(entries[i])
                                                            var maxChars = count <= 12 ? 18 : count <= 20 ? 13 : 9
                                                            if (label.length > maxChars) label = label.slice(0, maxChars - 1) + "…"
                                                            ctx.fillText(label, radius - 18, 0)
                                                            ctx.restore()
                                                        }
                                                    }
                                                    ctx.beginPath()
                                                    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
                                                    ctx.strokeStyle = "#f6a21a"
                                                    ctx.lineWidth = 5
                                                    ctx.stroke()
                                                }

                                                Connections {
                                                    target: window
                                                    function onRouletteRevisionChanged() { wheelCanvas.requestPaint() }
                                                }
                                            }

                                            Rectangle {
                                                anchors.centerIn: parent
                                                width: Math.min(154, parent.width * 0.25)
                                                height: width
                                                radius: width / 2
                                                rotation: -window.rouletteAngle
                                                z: 4
                                                clip: true
                                                color: "#06111d"
                                                border.color: window.orange
                                                border.width: 5
                                                Image {
                                                    anchors.fill: parent
                                                    anchors.margins: 8
                                                    source: window.overwatchPortrait(window.rouletteWinner)
                                                    visible: source.toString().length > 0
                                                    fillMode: Image.PreserveAspectCrop
                                                    cache: true
                                                    asynchronous: false
                                                }
                                                Text {
                                                    anchors.centerIn: parent
                                                    width: parent.width - 18
                                                    text: window.rouletteSpinning ? "…" : window.rouletteWinner ? window.rouletteDisplayName(window.rouletteWinner) : window.rouletteEntries.length ? window.ss("roulette_spin_hint") : "?"
                                                    visible: !window.rouletteWinner || window.rouletteSpinning
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
                                            anchors.horizontalCenter: rouletteWheel.horizontalCenter
                                            anchors.top: rouletteWheel.top
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
                                                ctx.fillStyle = "#f6a21a"
                                                ctx.fill()
                                                ctx.strokeStyle = "#fff2cf"
                                                ctx.lineWidth = 2
                                                ctx.stroke()
                                            }
                                        }

                                        Rectangle {
                                            anchors.horizontalCenter: parent.horizontalCenter
                                            anchors.bottom: parent.bottom
                                            width: Math.min(parent.width - 20, 620)
                                            height: 72
                                            radius: 4
                                            color: "#0e2237"
                                            border.color: window.rouletteWinner ? window.orange : window.line
                                            Column {
                                                anchors.centerIn: parent
                                                width: parent.width - 20
                                                spacing: 3
                                                Text {
                                                    anchors.horizontalCenter: parent.horizontalCenter
                                                    text: window.rouletteMessage.length ? window.rouletteMessage : window.ss("roulette_pick_heroes")
                                                    color: window.rouletteWinner ? window.orange : window.text
                                                    font.family: "Rajdhani"
                                                    font.pixelSize: window.rouletteWinner ? 19 : 14
                                                    font.bold: true
                                                    horizontalAlignment: Text.AlignHCenter
                                                    elide: Text.ElideRight
                                                    width: parent.width
                                                }
                                                Text {
                                                    anchors.horizontalCenter: parent.horizontalCenter
                                                    text: window.ss("roulette_rule_note")
                                                    color: window.muted
                                                    font.family: "Open Sans"
                                                    font.pixelSize: 10
                                                    horizontalAlignment: Text.AlignHCenter
                                                    width: parent.width
                                                    wrapMode: Text.Wrap
                                                }
                                            }
                                        }
                                    }

                                    Rectangle {
                                        Layout.preferredWidth: 300
                                        Layout.fillHeight: true
                                        color: "#091828"
                                        border.color: window.line
                                        border.width: 1
                                        radius: 3
                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 8
                                            spacing: 6
                                            Text { text: window.ss("roulette_entries"); color: window.orange; font.family: "Rajdhani"; font.pixelSize: 14; font.bold: true }
                                            Text { Layout.fillWidth: true; text: window.rouletteEntries.length ? window.rouletteEntries.length + " " + window.ss("roulette_slots") : window.ss("roulette_not_built"); color: window.muted; font.family: "Open Sans"; font.pixelSize: 10; wrapMode: Text.Wrap }
                                            ListView {
                                                id: rouletteEntryList
                                                Layout.fillWidth: true
                                                Layout.fillHeight: true
                                                model: window.rouletteEntries
                                                spacing: 4
                                                clip: true
                                            reuseItems: true
                                            cacheBuffer: 0
                                                boundsBehavior: Flickable.StopAtBounds
                                                ScrollBar.vertical: ScrollBar { policy: rouletteEntryList.contentHeight > rouletteEntryList.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }
                                                delegate: Rectangle {
                                                    required property var modelData
                                                    required property int index
                                                    width: rouletteEntryList.width - (rouletteEntryList.contentHeight > rouletteEntryList.height ? 10 : 0)
                                                    height: 46
                                                    color: window.rouletteWinner && window.rouletteWinner.key === modelData.key ? "#17364f" : "#0a1b2b"
                                                    border.color: window.rouletteWinner && window.rouletteWinner.key === modelData.key ? window.orange : window.line
                                                    RowLayout {
                                                        anchors.fill: parent
                                                        anchors.margins: 4
                                                        spacing: 6
                                                        Text { Layout.preferredWidth: 26; text: index + 1; color: window.orange; font.family: "Rajdhani"; font.pixelSize: 12; font.bold: true; horizontalAlignment: Text.AlignHCenter }
                                                        Image { Layout.preferredWidth: 36; Layout.preferredHeight: 36; source: window.overwatchPortrait(modelData); sourceSize.width: 48; sourceSize.height: 48; fillMode: Image.PreserveAspectCrop; cache: true; asynchronous: false }
                                                        ColumnLayout {
                                                            Layout.fillWidth: true
                                                            spacing: 0
                                                            Text { Layout.fillWidth: true; text: window.rouletteDisplayName(modelData); color: window.text; font.family: "Rajdhani"; font.pixelSize: 11; font.bold: true; elide: Text.ElideRight }
                                                            Text { text: window.rouletteGroupName(modelData.role).toUpperCase(); color: modelData.role === "tank" ? "#42c8ff" : modelData.role === "damage" ? "#ff5b69" : "#5ce1a2"; font.family: "Rajdhani"; font.pixelSize: 8; font.bold: true }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            GridView {
                                id: resultGrid
                                anchors.fill: parent
                                visible: window.selectedFormat !== "roulette" && appController.hasResults && appController.resultTeamCount === 1
                                property int minimumCardWidth: appController.compactCards ? 230 : 255
                                property int maximumColumns: Math.max(1, Math.floor(width / minimumCardWidth))
                                property int columns: Math.max(1, Math.min(count > 0 ? count : 1, maximumColumns))
                                property int cardHeight: appController.rolesOnly ? 340 : appController.stadium ? (appController.compactCards ? 550 : 670) : (appController.compactCards ? 430 : 570)
                                model: appController.pickModel
                                cellWidth: width / columns
                                cellHeight: cardHeight
                                clip: true
                                            reuseItems: true
                                            cacheBuffer: 0
                                boundsBehavior: Flickable.StopAtBounds
                                ScrollBar.vertical: ScrollBar { policy: resultGrid.contentHeight > resultGrid.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded }

                                delegate: HeroCard {
                                    width: resultGrid.cellWidth - 10
                                    height: resultGrid.cellHeight - 10
                                    x: 5
                                    y: 5
                                    controller: appController
                                    localizer: window
                                    compact: appController.compactCards
                                    animations: appController.animationsEnabled && appController.performanceMode !== "low"
                                }
                            }

                            Flickable {
                                id: teamsScroll
                                anchors.fill: parent
                                visible: window.selectedFormat !== "roulette" && appController.hasResults && appController.resultTeamCount === 2
                                contentWidth: width
                                contentHeight: teamsColumn.implicitHeight
                                clip: true
                                boundsBehavior: Flickable.StopAtBounds
                                ScrollBar.vertical: ScrollBar { policy: ScrollBar.AlwaysOn }

                                Column {
                                    id: teamsColumn
                                    width: teamsScroll.width - 12
                                    spacing: 10
                                    TeamSection { width: parent.width; teamNumber: 1; teamModel: appController.team1Model; controller: appController; localizer: window; availableWidth: width }
                                    TeamSection { width: parent.width; teamNumber: 2; teamModel: appController.team2Model; controller: appController; localizer: window; availableWidth: width }
                                }
                            }
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: appController.status.length && appController.hasResults ? 30 : 0
                            visible: window.selectedFormat !== "roulette" && appController.status.length && appController.hasResults
                            color: "#102941"
                            border.color: window.line
                            Text { anchors.fill: parent; anchors.margins: 6; text: window.localizedBackendText(appController.status); color: "#b8cee1"; font.family: "Open Sans"; font.pixelSize: 10; verticalAlignment: Text.AlignVCenter; elide: Text.ElideRight }
                        }
                    }
                }
            }
                }
            }
        }

        Loader {
            active: window.activePage === "stats"
            asynchronous: false
            sourceComponent: Component {
                StatsPage { localizer: window }
            }
        }

        Loader {
            active: window.activePage === "profiles"
            asynchronous: false
            sourceComponent: Component {
                ProfilesPage { localizer: window }
            }
        }

        Loader {
            active: window.activePage === "settings"
            visible: window.activePage === "settings"
            asynchronous: false
            sourceComponent: Component {
                SettingsPage { localizer: window }
            }
        }

        Loader {
            active: window.activePage === "help"
            asynchronous: false
            sourceComponent: Component {
                HelpPage { localizer: window }
            }
        }

        Loader {
            active: window.activePage === "local"
            asynchronous: false
            sourceComponent: Component {
                LocalDataPage { localizer: window }
            }
        }

        Loader {
            active: window.activePage === "games"
            asynchronous: false
            sourceComponent: Component {
                GamesPage { localizer: window }
            }
        }
    }

    Connections {
        target: appController
        function onSecretRevealed(code) {
            window.revealSecret(code)
        }
    }

    Rectangle {
        id: secretToast
        width: Math.min(390, window.width - 40)
        height: 94
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.rightMargin: 22
        anchors.bottomMargin: 22
        visible: false
        opacity: 0
        z: 10000
        color: "#ed111a24"
        border.color: "#f6a21a"
        border.width: 1
        radius: 4
        transform: Translate { id: secretShift; x: 56 }

        Rectangle {
            width: 5
            anchors.left: parent.left
            anchors.top: parent.top
            anchors.bottom: parent.bottom
            color: "#f6a21a"
        }

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 17
            anchors.rightMargin: 14
            anchors.topMargin: 12
            anchors.bottomMargin: 12
            spacing: 13

            Rectangle {
                Layout.preferredWidth: 58
                Layout.preferredHeight: 58
                color: "#091828"
                border.color: "#d9b65f"
                border.width: 2
                radius: 3
                Image {
                    id: secretIcon
                    anchors.fill: parent
                    anchors.margins: 7
                    source: appController.secretNotificationIcon("DPS78")
                    fillMode: Image.PreserveAspectFit
                    asynchronous: false
                    cache: true
                }
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 1
                Text {
                    Layout.fillWidth: true
                    text: appController.locale === "en-us"
                          ? "A SECRET HAS BEEN REVEALED!"
                          : "¡UN SECRETO HA SIDO REVELADO!"
                    color: "#ffffff"
                    font.family: "Rajdhani"
                    font.pixelSize: 18
                    font.bold: true
                    elide: Text.ElideRight
                }
                Text {
                    id: secretCode
                    Layout.fillWidth: true
                    text: "DPS78"
                    color: "#f6a21a"
                    font.family: "Open Sans"
                    font.pixelSize: 11
                    font.bold: true
                    elide: Text.ElideRight
                }
                Text {
                    id: secretDescription
                    Layout.fillWidth: true
                    text: appController.locale === "en-us"
                          ? "Alternate Damage portraits unlocked."
                          : "Retratos alternativos de Daño desbloqueados."
                    color: "#9eb8ce"
                    font.family: "Open Sans"
                    font.pixelSize: 10
                    elide: Text.ElideRight
                }
            }
        }
    }

    SequentialAnimation {
        id: secretToastAnimation
        ParallelAnimation {
            NumberAnimation { target: secretToast; property: "opacity"; to: 1; duration: appController.animationsEnabled ? 170 : 1; easing.type: Easing.OutCubic }
            NumberAnimation { target: secretShift; property: "x"; to: 0; duration: appController.animationsEnabled ? 210 : 1; easing.type: Easing.OutCubic }
        }
        PauseAnimation { duration: 2800 }
        ParallelAnimation {
            NumberAnimation { target: secretToast; property: "opacity"; to: 0; duration: appController.animationsEnabled ? 160 : 1; easing.type: Easing.InCubic }
            NumberAnimation { target: secretShift; property: "x"; to: 32; duration: appController.animationsEnabled ? 160 : 1; easing.type: Easing.InCubic }
        }
        ScriptAction { script: secretToast.visible = false }
    }
}
