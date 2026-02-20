**Documentación de Diagramas**

*Descripción General del Diseño*
Esta sección presenta la documentación técnica y el modelado de procesos para la implementación de un sistema de gestión de citas médicas. El enfoque del proyecto ha evolucionado de un formulario público a un Panel de Gestión Interno, priorizando la seguridad, la trazabilidad y el control administrativo.

*Descripción del Proyecto*
El sistema permite al personal de la clínica centralizar la agenda médica, eliminando procesos manuales y errores de duplicidad. Esta Fase se centra en la definición de la lógica de negocio y el flujo de datos mediante diagramas técnicos.

*Diagramas creados:*

- Flujo de Reserva de citas
- Formulario de cita
- Agenda diaria
- Panel de Gestion
- Confirmacion de citas

*Diagrama de Flujo de Reserva (Actualizado)*
El flujo de trabajo ha sido actualizado para reflejar un proceso de gestión profesional y centralizado:

Autenticación Obligatoria: Se ha implementado un nodo de decisión al inicio del flujo. Si no se detecta una sesión activa, el sistema redirige forzosamente a la Pantalla de Login o Inicio. 

Rol Administrativo: El proceso ahora inicia con la recepción de la solicitud por parte del personal administrativo, quien actúa como el único operador autorizado para la captura de datos. 

Validación de Disponibilidad: El sistema incluye un motor lógico que verifica espacios en la agenda antes de confirmar el registro, evitando traslapes de horarios.

