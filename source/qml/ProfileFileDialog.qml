import QtQuick
import QtQuick.Dialogs

Item {
    id: root
    property bool saveMode: false
    property string dialogTitle: ""
    signal fileChosen(url fileUrl)
    signal closed()

    FileDialog {
        id: dialog
        title: root.dialogTitle
        fileMode: root.saveMode ? FileDialog.SaveFile : FileDialog.OpenFile
        nameFilters: ["JSON (*.json)"]
        onAccepted: {
            root.fileChosen(selectedFile)
            root.closed()
        }
        onRejected: root.closed()
        Component.onCompleted: open()
    }
}
