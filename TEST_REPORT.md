**Reporte de Pruebas y Resultados**

## Objetivo

Validar el correcto funcionamiento del Sistema de Registro de Citas Médicas desarrollado en Google Apps Script, verificando la seguridad en el acceso mediante autenticación, la correcta validación de datos ingresados por el usuario, el almacenamiento adecuado de la información en Google Sheets y la estabilidad operativa general del sistema bajo condiciones reales de uso.

## Alcance 
La evaluación comprende el módulo de autenticación (login), el registro y validación de citas médicas, el almacenamiento y recuperación de información en la base de datos vinculada (Google Sheets), así como la verificación de controles básicos de seguridad y manejo de sesión. No se incluyen pruebas de penetración avanzada ni auditorías externas de seguridad.

## Entorno de prueba 

Las pruebas fueron ejecutadas utilizando el navegador Opera GX, seleccionado por su capacidad de mostrar de forma más explícita mensajes del sistema, redirecciones de URL y comportamientos asociados a scripts y autenticación, lo cual facilita la detección de incidencias durante la validación.
Se utilizó conexión a internet mediante fibra óptica dedicada de 150 Mbps, garantizando estabilidad, baja latencia y ausencia de interferencias en la medición del rendimiento del sistema. Las pruebas se realizaron con cuentas autorizadas y en entorno controlado.

## Tipos de prueba
Se realizaron pruebas funcionales (flujo completo de registro y almacenamiento), pruebas de validación de datos (campos obligatorios, formatos y restricciones), pruebas básicas de seguridad (control de acceso y manejo de sesión) y pruebas de lógica operativa (duplicidad de citas y restricciones de horario).

## Criterios de aceptación
El sistema debe permitir el acceso exclusivamente a usuarios autenticados, impedir el ingreso con credenciales inválidas, validar correctamente los datos obligatorios, registrar la información sin errores en la base de datos y mantener estabilidad durante su ejecución sin presentar fallos críticos.

## Documentación 

El siguiente enlace lo llevará al documento en donde se describe los resultados de las pruebas:
[Documento_tester](docs/analisis/docs/Documento_Tester.pdf)
