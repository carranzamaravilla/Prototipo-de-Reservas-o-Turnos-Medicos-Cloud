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

## Estructura del repositorio
/backend → Lógica del sistema en Google Apps Script.
/docs → Documentación del proyecto y diagramas.
/frontend → Interfaz del formulario web.

## Consideraciones de seguridad
- El acceso a la base de datos en Google Sheets estará restringido a cuentas autorizadas.
- El backend desarrollado en Google Apps Script será desplegado como Web App con acceso controlado mediante enlace privado o autenticación.
- El formulario web se publicará en un entorno no indexado, con validaciones básicas, contemplando la implementación futura de mecanismos adicionales de control del acceso.


## Tipo de proyecto
Proyecto académico.
