# Seguridad y privacidad de OverRoll

OverRoll es una aplicación fan local. No instala servicios, controladores, tareas programadas ni componentes de inicio automático.

## Conexiones de red

- La aplicación funciona con su snapshot local y no mantiene procesos de actualización en segundo plano.
- **Actualizar datos desde API** conecta con OverFast únicamente cuando el usuario lo solicita.
- **Estadísticas** conecta con OverFast únicamente al buscar o actualizar un jugador.
- La aplicación abre un helper en `127.0.0.1` mientras está en ejecución. Usa un puerto aleatorio y un token nuevo por sesión; no acepta conexiones externas ni peticiones sin ese token.
- La integración de Twitch permanece desactivada y no almacena credenciales.
- Las voces, imágenes y datos incluidos se leen desde la propia distribución.

## Datos locales

Los ajustes, filtros y perfiles se guardan en `%APPDATA%\OWRPRenewed\data`. No se envían a ningún servidor. Los archivos de perfiles importados tienen límites de tamaño y cantidad.

Al cerrar OverRoll se detienen el helper local, el audio y cualquier actualización activa. No quedan servicios ni tareas programadas.

## Distribuciones

- **Portable standalone:** recomendado para compartir y auditar. Se construye con Nuitka, sus librerias estan visibles, no usa PyInstaller y no se autoextrae al ejecutarse.
- **EXE unico:** practico, pero empaqueta la aplicacion completa en un archivo y puede provocar falsos positivos heuristicos en algunos antivirus aunque no use compresion ni UPX.

`CHECKSUMS_SHA256.txt` permite confirmar que los archivos no cambiaron despues
de compilarse. Una deteccion generica no demuestra que un archivo sea malicioso,
pero debe revisarse usando el hash exacto y enviarse al proveedor que la emitio.
