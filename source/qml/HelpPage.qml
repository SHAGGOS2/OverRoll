pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"

Item {
    id: root
    objectName: "helpPage"
    required property var localizer
    property var window: localizer
    property var ui: localizer.ui
    property string topic: "start"

    function catalogText(spanish, english) {
        return String(appController.locale || "").indexOf("es-") === 0 ? spanish : english
    }

    function topicTitle() {
        if (topic === "overlay") return catalogText("Overlay para OBS", "OBS overlay")
        if (topic === "settings") return catalogText("Configuración sin enredos", "Settings without confusion")
        if (topic === "troubleshooting") return catalogText("Soluciones rápidas", "Quick fixes")
        return ui["help_" + topic]
    }

    function topicBody() {
        if (topic === "catalogs") return catalogText(
            "Cada juego conserva su propio catálogo, reglas, perfiles y ruleta. Ya puedes usar Overwatch, TF2, PVZ GW2, Marvel Rivals, Valorant, Last Flag, Deadlock, THE FINALS, Paladins, FragPunk y Apex Legends. Cambiar de juego no borra la configuración de los demás.",
            "Each game keeps its own catalog, rules, profiles, and roulette. You can use Overwatch, TF2, PVZ GW2, Marvel Rivals, Valorant, Last Flag, Deadlock, THE FINALS, Paladins, FragPunk, and Apex Legends. Switching games does not erase the others' settings.")
        if (topic === "overlay") return catalogText(
            "El overlay es una ventana transparente que muestra únicamente las fichas del resultado. OBS la captura como una ventana aparte. Puedes ordenar las fichas, reducirlas hasta 60 px y ocultar nombres o detalles sin cambiar el resultado principal.",
            "The overlay is a transparent window that only shows result cards. OBS captures it as a separate window. You can arrange cards, shrink them to 60 px, and hide names or details without changing the main result.")
        if (topic === "settings") return catalogText(
            "Configuración está dividida por tareas: Apariencia controla sonido y rendimiento; Idioma y datos controla el catálogo local; Conexiones contiene OBS y Twitch; Otros HS muestra el estado de cada juego; Créditos reúne las fuentes. Las opciones poco usadas aparecen con Más opciones.",
            "Settings is divided by task: Appearance controls audio and performance; Language and data controls the local catalog; Connections contains OBS and Twitch; Other HS shows each game's status; Credits lists sources. Rare controls are under More options.")
        if (topic === "troubleshooting") return catalogText(
            "Si algo se ve fuera de lugar, primero restaura sólo esa sección. En el overlay usa Reubicar o Restaurar todo. Si una ruleta cambió de catálogo, vuelve al equipo y constrúyela otra vez. Si faltan imágenes, confirma que estás usando el portable completo y no únicamente el EXE lanzador.",
            "If something looks misplaced, reset only that section first. For the overlay use Reset position or Reset all. If a roulette changed catalogs, return to the team and build it again. If images are missing, confirm you are using the complete portable package and not only the launcher EXE.")
        return ui["help_" + topic + "_body"]
    }

    function topicTip() {
        if (topic === "catalogs") return catalogText(
            "En Rivals cada héroe tiene dos Team-Ups. Elige uno en su ficha: BASE funciona por sí solo y MEJORADO indica que el aliado necesario también está en la escuadra.",
            "Every Rivals hero has two Team-Ups. Choose one on the card: BASE works alone and ENHANCED means the required ally is also in the squad.")
        if (topic === "overlay") return catalogText(
            "Para muchas fichas usa 60–100 px, columnas automáticas y oculta los detalles. El botón Reubicar devuelve la ventana a la esquina superior derecha.",
            "For many cards use 60–100 px, automatic columns, and hide details. Reset position returns the window to the upper-right corner.")
        if (topic === "settings") return catalogText(
            "Los cambios se aplican al instante. No necesitas un botón Guardar.",
            "Changes apply immediately. There is no Save button.")
        if (topic === "troubleshooting") return catalogText(
            "Restaurar el overlay no borra perfiles, filtros, estadísticas ni catálogos.",
            "Resetting the overlay does not erase profiles, filters, statistics, or catalogs.")
        return ui["help_" + topic + "_tip"]
    }

    function topicSteps() {
        if (topic === "catalogs") return catalogText(
            "Abre Más y entra a Juegos.|Activa el catálogo que quieres usar.|En Escuadra elige nombres, perfiles y roles o bandos permitidos.|Usa Equipo para preparar jugadores o Ruleta para construir probabilidades.|Pulsa Generar equipo; cada módulo conserva sus propias reglas.",
            "Open More and enter Games.|Activate the catalog you want to use.|In Squad choose names, profiles, and allowed roles or factions.|Use Team to prepare players or Roulette to build probabilities.|Press Generate team; every module keeps its own rules.").split("|")
        if (topic === "overlay") return catalogText(
            "Genera un resultado en cualquier juego.|Abre Más, Configuración y Conexiones.|Activa Ventana de overlay.|Elige Horizontal o Vertical y ajusta el tamaño.|En OBS agrega Captura de ventana y selecciona OverRoll Overlay.|Usa Reubicar si la ventana quedó fuera de pantalla.",
            "Generate a result in any game.|Open More, Settings, and Connections.|Enable Overlay window.|Choose Horizontal or Vertical and adjust card size.|In OBS add Window Capture and select OverRoll Overlay.|Use Reset position if the window ended up off-screen.").split("|")
        if (topic === "settings") return catalogText(
            "Abre Más y Configuración.|Elige una categoría en la izquierda.|Cambia sólo la opción que necesitas.|Pulsa Más opciones únicamente cuando necesites controles avanzados.|Usa Restaurar dentro de la sección si quieres volver a valores cómodos.",
            "Open More and Settings.|Choose a category on the left.|Change only the option you need.|Press More options only for advanced controls.|Use Reset inside the section to return to comfortable defaults.").split("|")
        if (topic === "troubleshooting") return catalogText(
            "Identifica si el fallo afecta al resultado, una ruleta o el overlay.|Prueba el botón Restaurar de esa sección.|Cierra y abre sólo la vista afectada; tus datos siguen guardados.|Comprueba que data y assets estén junto al ejecutable portable.|Si persiste, anota el juego, modo y acción exacta que lo provoca.",
            "Identify whether the issue affects results, a roulette, or the overlay.|Try that section's Reset button.|Close and reopen only the affected view; your data stays saved.|Check that data and assets are next to the portable executable.|If it persists, note the exact game, mode, and action that triggers it.").split("|")
        var value = ui["help_" + topic + "_steps"] || ""
        return value.length ? String(value).split("|") : []
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 10

        Rectangle {
            Layout.preferredWidth: 260
            Layout.fillHeight: true
            color: window.panel
            border.color: window.line
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 14
                spacing: 9

                Text {
                    text: ui.help
                    color: window.text
                    font.family: "Rajdhani"
                    font.pixelSize: 29
                    font.bold: true
                }
                Text {
                    Layout.fillWidth: true
                    text: ui.help_subtitle
                    color: window.muted
                    font.family: "Open Sans"
                    font.pixelSize: 11
                    lineHeight: 1.25
                    wrapMode: Text.Wrap
                }
                Rectangle { Layout.fillWidth: true; Layout.preferredHeight: 1; color: window.line }

                Repeater {
                    model: [
                        { id: "start", key: "help_start" },
                        { id: "profiles", key: "help_profiles" },
                        { id: "filters", key: "help_filters" },
                        { id: "roulette", key: "help_roulette" },
                        { id: "stadium", key: "help_stadium" },
                        { id: "catalogs", key: "help_catalogs" },
                        { id: "overlay", key: "" },
                        { id: "settings", key: "" },
                        { id: "troubleshooting", key: "" },
                        { id: "twitch", key: "help_twitch" }
                    ]
                    delegate: OWButton {
                        required property var modelData
                        required property int index
                        Layout.fillWidth: true
                        Layout.preferredHeight: 40
                        text: (index < 9 ? "0" : "") + (index + 1) + "   "
                              + (modelData.key.length ? ui[modelData.key]
                                                     : (modelData.id === "overlay"
                                                        ? root.catalogText("Overlay OBS", "OBS overlay")
                                                        : modelData.id === "settings"
                                                          ? root.catalogText("Configuración", "Settings")
                                                          : root.catalogText("Soluciones rápidas", "Quick fixes")))
                        selected: root.topic === modelData.id
                        onClicked: {
                            root.topic = modelData.id
                            helpFlick.contentY = 0
                        }
                    }
                }
                Item { Layout.fillHeight: true }

                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 72
                    color: "#071521"
                    border.color: window.line
                    Column {
                        anchors.fill: parent
                        anchors.margins: 10
                        spacing: 4
                        Text { text: "TIP"; color: window.orange; font.family: "Rajdhani"; font.pixelSize: 11; font.bold: true }
                        Text {
                            width: parent.width
                            text: root.topicTip()
                            color: window.muted
                            font.family: "Open Sans"
                            font.pixelSize: 9
                            wrapMode: Text.Wrap
                            maximumLineCount: 3
                            elide: Text.ElideRight
                        }
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: window.panel
            border.color: window.line
            border.width: 1

            Flickable {
                id: helpFlick
                anchors.fill: parent
                anchors.margins: 2
                clip: true
                contentWidth: width
                contentHeight: helpContent.implicitHeight + 48
                boundsBehavior: Flickable.StopAtBounds
                ScrollBar.vertical: ScrollBar {
                    policy: helpFlick.contentHeight > helpFlick.height ? ScrollBar.AlwaysOn : ScrollBar.AsNeeded
                }

                Column {
                    id: helpContent
                    x: 28
                    y: 24
                    width: parent.width - 56
                    spacing: 15

                    Text {
                        width: parent.width
                        text: root.topicTitle()
                        color: window.orange
                        font.family: "Rajdhani"
                        font.pixelSize: 31
                        font.bold: true
                        elide: Text.ElideRight
                    }
                    Rectangle { width: parent.width; height: 2; color: window.orange }

                    Rectangle {
                        width: parent.width
                        height: helpBody.implicitHeight + 68
                        color: "#0b2034"
                        border.color: window.line
                        border.width: 1
                        Column {
                            anchors.fill: parent
                            anchors.margins: 18
                            spacing: 9
                            Text {
                                text: ui.help_how_title
                                color: window.cyan
                                font.family: "Rajdhani"
                                font.pixelSize: 14
                                font.bold: true
                            }
                            Text {
                                id: helpBody
                                width: parent.width
                                text: root.topicBody()
                                color: window.text
                                font.family: "Open Sans"
                                font.pixelSize: 14
                                lineHeight: 1.35
                                wrapMode: Text.Wrap
                            }
                        }
                    }

                    Text {
                        text: ui.help_steps_title
                        color: window.text
                        font.family: "Rajdhani"
                        font.pixelSize: 20
                        font.bold: true
                    }

                    Repeater {
                        model: root.topicSteps()
                        delegate: Rectangle {
                            required property string modelData
                            required property int index
                            width: helpContent.width
                            height: stepText.implicitHeight + 32
                            color: index % 2 === 0 ? "#0a1d30" : "#0c2238"
                            border.color: window.line
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 10
                                spacing: 12
                                Rectangle {
                                    Layout.preferredWidth: 38
                                    Layout.preferredHeight: 38
                                    color: index === 0 ? window.orange : "#1c4164"
                                    Text {
                                        anchors.centerIn: parent
                                        text: index + 1
                                        color: index === 0 ? "#07111d" : window.text
                                        font.family: "Rajdhani"
                                        font.pixelSize: 17
                                        font.bold: true
                                    }
                                }
                                Text {
                                    id: stepText
                                    Layout.fillWidth: true
                                    text: modelData
                                    color: window.text
                                    font.family: "Open Sans"
                                    font.pixelSize: 13
                                    lineHeight: 1.25
                                    wrapMode: Text.Wrap
                                }
                            }
                        }
                    }

                    Rectangle {
                        width: parent.width
                        height: helpTip.implicitHeight + 62
                        color: "#102842"
                        border.color: window.cyan
                        border.width: 1
                        Column {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 7
                            Text {
                                text: ui.help_problem_title
                                color: window.cyan
                                font.family: "Rajdhani"
                                font.pixelSize: 14
                                font.bold: true
                            }
                            Text {
                                id: helpTip
                                width: parent.width
                                text: root.topicTip()
                                color: window.text
                                font.family: "Open Sans"
                                font.pixelSize: 13
                                lineHeight: 1.3
                                wrapMode: Text.Wrap
                            }
                        }
                    }
                }
            }
        }
    }
}
