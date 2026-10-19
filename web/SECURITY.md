# Revisión de seguridad de OverRoll web

Revisión del 19 de octubre de 2026. Este documento cubre la aplicación React/Vite, sus catálogos locales y las descargas PNG. `../SEGURIDAD.md` corresponde a la aplicación de escritorio.

## Cambios aplicados

- Los nombres de jugadores y perfiles conservan la restricción a letras y dígitos Unicode, límites de longitud y normalización. Se comprueban tanto la edición como la restauración y asignación de perfiles.
- Los textos siguen renderizándose mediante React o `canvas.fillText`. No se encontró uso de `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval` ni `new Function` en el código de ejecución de la web. La restricción de nombres complementa estos destinos de salida seguros; por sí sola no demuestra ausencia de XSS.
- Las imágenes mostradas por los módulos y las usadas para exportar se resuelven como recursos del propio origen bajo la carpeta de assets. Se rechazan URLs de terceros, credenciales, esquemas activos, datos, blobs proporcionados por catálogos, rutas ambiguas y extensiones ajenas a imágenes. El logo y el audio usan rutas locales constantes.
- Las exportaciones comparten un único generador PNG. No introducen texto del usuario en HTML ni suben la imagen a un servidor. El nombre de descarga se limita a caracteres ASCII seguros con extensión `.png`.
- Se limita la escuadra a 12 fichas, el lienzo a 16 millones de píxeles, cada imagen cargada a 24 millones y el PNG a 32 MB. Las cargas se procesan en lotes de ocho con ocho segundos de espera por recurso. La serialización tiene un límite de quince segundos.
- Una exclusión global impide exportaciones simultáneas. Se precargan los recursos antes del dibujo síncrono para evitar que operaciones asíncronas mezclen el estado del canvas.
- Los recursos que fallan se sustituyen por un fondo visible y se informa en la descarga. Se capturan salidas nulas, tipos MIME incorrectos y excepciones de serialización, incluido `SecurityError`. Los enlaces temporales se retiran y las URLs de descarga se liberan después de iniciarla; el lienzo se libera al terminar o fallar.
- Las ruletas de los ocho módulos adicionales validan arreglos, claves de catálogo y pesos finitos acotados. Los datos locales corruptos no deben causar el fallo de `.forEach` observado en la revisión.
- Cloudflare Pages recibe `_headers` con CSP, protección contra framing, `nosniff`, política de referencia, HSTS sin subdominios y restricciones de permisos. La CSP permite estilos en línea para las variables y estilos de React y la textura SVG estática en CSS; no permite JavaScript en línea ni `eval`. La única conexión externa permitida es el mecanismo heredado de OverFast; los catálogos actuales son locales.
- Se actualizaron las dependencias de desarrollo `nanoid` y `source-map-js` para resolver los dos avisos encontrados. No se identificaron credenciales de API incrustadas en el código de ejecución revisado.

## Validación y límites

- `npm test`: pruebas de nombres, almacenamiento, roles, migración de Last Flag y casos de error, límites y concurrencia del exportador.
- `npm run build`: TypeScript y compilación de producción.
- `npm run lint`: sin errores; conserva avisos de dependencias de efectos y organización de componentes ya presentes.
- `npm audit` y `npm audit --omit=dev`: cero vulnerabilidades conocidas al realizar esta revisión. Esto no descarta vulnerabilidades desconocidas.
- Se renderizaron y revisaron PNG de Overwatch/Stadium, Marvel Rivals y Deadlock con el generador real y un motor Canvas local. Esta comprobación no sustituye la prueba de descarga en un navegador.
- No hubo un controlador de navegador compatible disponible en esta sesión. No se completó una prueba interactiva del diseño móvil/escritorio, sonido, navegación ni descarga en navegadores reales. Conviene validar esos recorridos en Chrome, Firefox y Safari.
- La revisión es acotada al código y a los casos comprobados; no es una certificación ni una prueba de penetración integral. Se debe confirmar que los encabezados llegan desde el dominio desplegado, ya que un archivo de configuración por sí solo no acredita su aplicación.

## Referencias

- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
- https://developers.cloudflare.com/pages/configuration/headers/
- https://github.com/advisories/GHSA-2v37-7h3g-55p8
- https://github.com/advisories/GHSA-68fv-2mgg-jv7q
