# Seguridad · Lameyer.net

> Este archivo es público. No contiene claves, cuentas, incidentes ni datos de clientes.

## Reportar una vulnerabilidad

Si encuentras un problema de seguridad en lameyer.net, escríbenos a **contacto@lameyer.net** con el asunto
«Seguridad». Incluye la URL, los pasos para reproducirlo y su impacto. No abras un issue público ni accedas a datos de
otras personas. Respondemos lo antes posible.

## Principios

- Ningún secreto (claves de API, variables de entorno, certificados, códigos de recuperación 2FA) entra al repositorio.
  `.gitignore` los bloquea como red de seguridad.
- Los códigos de recuperación se guardan solo en un gestor de contraseñas o fuera de línea.
- Los datos de las cuentas se protegen en el servidor con reglas de acceso por usuario; lo que el navegador oculta es
  solo una cortesía.
- El detalle de configuración, hallazgos y acciones se documenta internamente y no se publica.
