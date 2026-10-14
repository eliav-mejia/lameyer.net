# Seguridad · Lameyer.net

> Este archivo es público. No contiene claves, cuentas ni datos de clientes.

## Credenciales y códigos de recuperación (2FA)

- Los **códigos de respaldo / recuperación de 2FA** (Stripe, GitHub, Supabase, Cloudflare, Google) se guardan **solo en el
  gestor de contraseñas** o impresos fuera de línea. Nunca en archivos de texto dentro de la carpeta de trabajo `Meyer`
  (sincronizada con OneDrive) ni en ningún repositorio.
- `.gitignore` bloquea `.env*`, `.dev.vars*`, `*.pem`, `*.key` y nombres de archivo de códigos de respaldo
  (`*backup_code*`, `*recovery_code*`, `*codigos-respaldo*`…) como red de seguridad.

## Registro de cambios

### 2026-10-14 · Retiro del código de respaldo de Stripe en texto plano

**Hallazgo (crítico):** un código de respaldo 2FA de la cuenta de Stripe estaba guardado en texto plano en un archivo
local de la carpeta de trabajo, sincronizada con OneDrive. Ese archivo nunca formó parte de este ni de otro repositorio
(se revisó el historial de los seis repositorios: sin coincidencias).

**Riesgo:** con la contraseña de Stripe más ese archivo (malware, cuenta de Microsoft comprometida, equipo perdido o
compartido) se podía saltar el 2FA y controlar pagos, reembolsos, claves de API y datos de clientes de todas las tiendas.

**Acción:** el archivo se eliminó del equipo el 2026-10-14 y se añadieron las reglas de `.gitignore` de arriba.

**Efecto de eliminarlo:**

- El código ya no existe en la carpeta local. Si no estaba también en el gestor de contraseñas, **la cuenta de Stripe
  queda sin código de respaldo**: perder el segundo factor (teléfono / app de autenticación) obligaría a recuperar la
  cuenta con el soporte de Stripe.
- OneDrive conserva una copia en su **Papelera de reciclaje en línea** (hasta 30 días) y en el historial de versiones.
  Hasta vaciarla, el código sigue siendo válido.
- Nada del sitio, los pagos ni las integraciones depende de ese archivo: no hay cambios de funcionamiento.

**Pendiente (dueño de la cuenta):**

- [ ] Stripe → *Settings → Personal details / Security* → generar un **nuevo** código de respaldo (invalida el anterior)
      y guardarlo en el gestor de contraseñas.
- [ ] Vaciar la Papelera de reciclaje en línea de OneDrive (onedrive.live.com → Papelera de reciclaje).
- [ ] Confirmar que la cuenta de Stripe tiene 2FA activo con app de autenticación o llave de seguridad.
