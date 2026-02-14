# Prototipo-de-Reservas-o-Turnos-Medicos-Cloud
Proyecto cloud lite para la gestión de citas médicas (proyecto académico).

## Descripción
Este proyecto consiste en un prototipo cloud lite para la gestión de citas médicas.

## Objetivo
Permitir registrar, reprogramar y cancelar citas médicas, gestionar horarios y estados
de cita, y enviar notificaciones de confirmación al paciente.

## Tecnologías
- HTML, CSS, JavaScript
- Google Apps Script (doGet / doPost)
- Google Sheets (base de datos)
- GitHub (control de versiones)

## Arquitectura
Paciente → Formulario Web → Apps Script → Google Sheets → Notificación

## 🔗 Acceso a la Aplicación
**Link del Proyecto:** [Abrir Portal de Citas Médicas](https://script.google.com/macros/s/AKfycbyj_XgqtY-OXklGD1RCnLU8N3O-JMxNoaDwJXk1y__NHflm6Jy8Y0albzGsJOGNX6Hw5g/exec)

*Nota: Para efectos de revisión académica, el acceso se ha configurado de forma pública (sin requerir inicio de sesión en Google) para facilitar las pruebas de la interfaz y lógica de negocio.*

## Estructura del repositorio
/backend → Lógica del sistema en Google Apps Script.
/docs → Documentación del proyecto y diagramas.
/frontend → Interfaz del formulario web.

## Consideraciones de seguridad (Actualizacion)

**Seguridad por Lista Blanca (Whitelist):** Se ha implementado un filtro de seguridad robusto donde el sistema solo permite el acceso a cuentas de Google autorizadas previamente en la base de datos

**Autenticación y 2FA:** Se utiliza la infraestructura de Google para la autenticación, eliminando el uso de credenciales estáticas y permitiendo el uso de Doble Factor de Autenticación.

**Separación Back/Front:** El código y la base de datos están protegidos en el servidor; el personal solo interactúa con la interfaz de trabajo, evitando manipulaciones accidentales de la base de datos.

**Trazabilidad Total:** Cada movimiento genera una marca de tiempo y un ID único (UUID). Esto permite saber con exactitud quién, cuándo y qué se registró o modificó, garantizando un control del 100% sobre la agenda.

**Registro de Auditoría:** El sistema vincula cada cambio al correo electrónico del usuario que inició sesión, garantizando el cumplimiento de los procesos clínicos.


## Tipo de proyecto
Proyecto académico.
