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
**Link del Proyecto:** [Abrir Portal de Citas Médicas](https://script.google.com/macros/s/AKfycbzVeHOQCYUNm3PLnIuWDww1gCeWLvG3rKzwVkkyn882mQxxe-aJdCA1CWqXsg9H7A2RXA/exec)


## Estructura del repositorio
/backend → Lógica del sistema en Google Apps Script.
/docs → Documentación del proyecto y diagramas.
/frontend → Interfaz del formulario web.

## Consideraciones de seguridad (Actualizacion)

**Seguridad por Lista Blanca (Whitelist):** Se ha implementado un filtro de seguridad robusto donde el sistema solo permite el acceso a cuentas de Google autorizadas previamente en la base de datos

**Autenticación a través de SSO Google:** Se utiliza la infraestructura de Google para la autenticación, eliminando el uso de credenciales estáticas y permitiendo el uso de Doble Factor de Autenticación.

**Separación Back/Front:** El código y la base de datos están protegidos en el servidor; el personal solo interactúa con la interfaz de trabajo, evitando manipulaciones accidentales de la base de datos.

**Trazabilidad Total:** Cada movimiento genera una marca de tiempo y un ID único (UUID). Esto permite saber con exactitud quién, cuándo y qué se registró o modificó, garantizando un control del 100% sobre la agenda.

**Registro de Auditoría:** El sistema vincula cada cambio al correo electrónico del usuario que inició sesión, garantizando el cumplimiento de los procesos clínicos.


## Tipo de proyecto
Proyecto académico.
