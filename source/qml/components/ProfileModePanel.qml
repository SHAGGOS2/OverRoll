import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

SectionPanel {
    id: root

    property color accent: "#f5a623"
    property bool collectionMode: false

    height: root.collectionMode ? 82 : 108
    title: root.collectionMode ? "PERFIL DE COLECCION" : "MODO DE PERFIL"
    subtitle: appController.currentProfileName
              ? "Perfil activo: " + appController.currentProfileName
              : "Sin perfil vinculado"

    DarkComboBox {
        anchors.fill: parent
        visible: !root.collectionMode
        model: appController.profileModes
        textRole: "name"
        valueRole: "id"
        displayText: appController.profileModeName
        currentIndex: indexOfValue(appController.profileMode)
        onActivated: appController.setProfileMode(currentValue)
    }

    Text {
        anchors.fill: parent
        visible: root.collectionMode
        text: "La disponibilidad depende de las variantes marcadas en Perfiles."
        color: root.accent
        font.family: "Rajdhani"
        font.pixelSize: 11
        font.bold: true
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        wrapMode: Text.Wrap
    }
}
