/************ CONFIG ************/
//desarrollado para ESIT por Carlos Fuentes //
const SPREADSHEET_ID = "1cbRC8rujJ4kvVDrOTQ2Yx-v6ZR0gu1ZDHV-bJXADfWA";
const SHEET_NAME = "CitasAgendadas";

const ESPECIALIDADES = {
  "Medicina General": 3,
  "Medicina Interna": 1,
  "Pediatría": 1,
  "Ginecología": 1
};

const ESTADOS = {
  AGENDADA: "Agendada",
  CANCELADA: "Cancelada",
  COMPLETADA: "Completada",
  NO_ASISTIO: "No asistio"
};

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

/************ UTIL ************/
//desarrollado para ESIT por Carlos Fuentes //
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["Timestamp","Fecha","Hora","Paciente","Especialidad","Estado","ID"]);
  }
  return sh;
}

/************ WEB ************/
//desarrollado para ESIT por Carlos Fuentes //
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Sistema de Citas Médicas");
}

/************ LOGIN ************/
//desarrollado para ESIT por Carlos Fuentes //
function loginAdmin(u, p) {
  return { success: u === ADMIN_USER && p === ADMIN_PASS };
}

/************ VALIDAR BLOQUE ************/
function validarBloque(fecha, hora, especialidad) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const limite = ESPECIALIDADES[especialidad] || 0;

  let ocupadas = 0;
  
  for (let i = 1; i < data.length; i++) {
    // Mapeo correcto de columnas post-cambio:
    // [1] = Fecha (B), [2] = Hora (C), [5] = Especialidad (F), [6] = Estado (G)
    
    const fCelda = data[i][1];
    const hCelda = data[i][2];
    const espCelda = data[i][5];   // Antes era [4]
    const estCelda = data[i][6];   // Antes era [5]

    // Normalizamos para asegurar que comparamos Texto con Texto
    const fString = (fCelda instanceof Date) ? Utilities.formatDate(fCelda, Session.getScriptTimeZone(), "yyyy-MM-dd") : fCelda;
    const hString = (hCelda instanceof Date) ? Utilities.formatDate(hCelda, Session.getScriptTimeZone(), "HH:mm") : hCelda;

    if (fString === fecha && hString === hora && espCelda === especialidad && estCelda === ESTADOS.AGENDADA) {
      ocupadas++;
    }
  }
  
  return ocupadas < limite;
}

/************ AGENDAR CITA CON CAPTURA DE CORREO ************/
//desarrollado para ESIT por Carlos Fuentes //
function agendarCita(datos) {
  const lock = LockService.getScriptLock();
  lock.waitLock(3000);

  try {
    const sheet = getSheet();
    const { fecha, hora, nombre, correo, motivo } = datos;  // ← incluimos correo

    const fechaHora = new Date(`${fecha} ${hora}`);
    if (fechaHora < new Date()) 
      return { success: false, message: "No se puede agendar en el pasado" };

    if (hayChoque(fecha, hora, motivo)) 
      return { success: false, message: "Horario no disponible para esta especialidad" };

    const id = Utilities.getUuid();

    sheet.appendRow([
      new Date(),        // A Timestamp
      fecha,             // B Fecha
      hora,              // C Hora
      nombre,            // D Paciente
      correo,            // E Correo   ← NUEVO
      motivo,            // F Especialidad
      ESTADOS.AGENDADA,  // G Estado
      id                 // H ID
    ]);

    // Enviar correo de confirmación
    enviarCorreoConfirmacion({ nombre, correo, motivo, fecha, hora });

    return { success: true, message: "Cita agendada correctamente" };

  } finally {
    lock.releaseLock();
  }
}


/*************FUNCION HAY CHOQUE*************/
function hayChoque(fecha, hora, especialidad, idExcluir = null) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;

  const capacidad = ESPECIALIDADES[especialidad] || 1;
  let ocupadas = 0;

  // Normalizar fecha de búsqueda (Convertir dd/mm/yyyy a yyyy-mm-dd si es necesario)
  let fBusqueda = String(fecha).trim();
  if (fBusqueda.includes("/")) {
    const partes = fBusqueda.split("/");
    fBusqueda = `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  const hBusqueda = String(hora).trim().substring(0, 5);
  const espBusqueda = String(especialidad).trim();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const idFila = String(row[7] || "").trim();

    // IMPORTANTE: Si estamos editando, no contamos la cita que estamos modificando
    if (idExcluir && idFila === idExcluir) continue;

    const fCelda = row[1];
    const hCelda = row[2];
    const espCelda = String(row[5] || "").trim();
    const estCelda = String(row[6] || "").trim();

    if (estCelda !== ESTADOS.AGENDADA) continue;

    const fString = (fCelda instanceof Date) 
      ? Utilities.formatDate(fCelda, Session.getScriptTimeZone(), "yyyy-MM-dd") 
      : String(fCelda).trim();
                    
    let hString = (hCelda instanceof Date)
      ? Utilities.formatDate(hCelda, Session.getScriptTimeZone(), "HH:mm")
      : String(hCelda).trim().substring(0, 5);

    if (fString === fBusqueda && hString === hBusqueda && espCelda === espBusqueda) {
      ocupadas++;
    }
  }

  return ocupadas >= capacidad;
}


/************ OBTENER ************/
//desarrollado para ESIT por Carlos Fuentes //
function obtenerCitas(filtros) {
  filtros = filtros || {};
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  data.shift(); // quitar encabezados

  const resultado = [];

  data.forEach(row => {
    const cita = {
      timestamp: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm"),
      fecha: Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
      hora: Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), "HH:mm"),
      nombre: row[3],
      correo: row[4],      // ← NUEVO
      motivo: row[5],      // ← Especialidad real
      estado: row[6],      // ← Estado real
      id: row[7]           // ← ID real
    };

    if (filtros.fecha && filtros.fecha !== cita.fecha) return;
    if (filtros.hora && filtros.hora !== cita.hora) return;
    if (filtros.motivo && filtros.motivo !== cita.motivo) return;
    if (filtros.estado && filtros.estado !== cita.estado) return;
    if (filtros.nombre && !cita.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) return;

    resultado.push(cita);
  });

  return JSON.parse(JSON.stringify(resultado));
}

/************ ESTADO ************/
//desarrollado para ESIT por Carlos Fuentes //
function modificarCita(id, campos) {
  if (!id) throw new Error("ID no proporcionado");

  const sh = getSheet();
  const data = sh.getDataRange().getValues();
  const idBuscado = String(id).trim();

  for (let i = 1; i < data.length; i++) {
    const filaID = String(data[i][7] || "").trim(); // Columna H (ID)

    if (filaID === idBuscado) {
      if (campos.estado) {
        // Columna G (7) es Estado
        sh.getRange(i + 1, 7).setValue(campos.estado);
      }
      return { success: true }; 
    }
  }
  return { success: false };
}

/************ PDF ************/
//desarrollado para ESIT por Carlos Fuentes //
function exportarPDF() {
  const data = getSheet().getDataRange().getDisplayValues();
  let html = `<h2 style="text-align:center">Agenda Médica</h2>
    <table border="1" cellpadding="6" width="100%">
    <tr>${data[0].map(h=>`<th>${h}</th>`).join("")}</tr>`;
  
  for (let i=1;i<data.length;i++) {
    html += `<tr>${data[i].map(c=>`<td>${c}</td>`).join("")}</tr>`;
  }
  html += "</table>";

  const blob = HtmlService.createHtmlOutput(html).getBlob().setName("Agenda.pdf");
  return DriveApp.createFile(blob).getUrl();
}

/************ EDITAR CITA ************/
//desarrollado para ESIT por Carlos Fuentes //
function editarCita(id, nuevosDatos) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000); // Evitar colisiones de escritura

  try {
    const sh = getSheet();
    const data = sh.getDataRange().getValues();
    const idBuscado = String(id).trim();

    let filaCita = -1;
    let especialidad = "";

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][7]).trim() === idBuscado) {
        filaCita = i + 1;
        especialidad = data[i][5]; 
        break;
      }
    }

    if (filaCita === -1) throw new Error("Cita no encontrada");

    // Pasamos el ID para que 'hayChoque' no cuente esta misma cita como ocupada
    const ocupado = hayChoque(nuevosDatos.fecha, nuevosDatos.hora, especialidad, idBuscado);
    
    if (ocupado) {
      throw new Error("Lo sentimos, el horario " + nuevosDatos.hora + " ya está lleno para " + especialidad);
    }

    // Actualizar en la hoja
    sh.getRange(filaCita, 2).setValue(nuevosDatos.fecha);
    sh.getRange(filaCita, 3).setValue(nuevosDatos.hora);
    
    return true;
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle('Clínica Integral Santa Salud');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function mostrarMiHtml() {
  var html = HtmlService.createTemplateFromFile('index').evaluate();
  html.setWidth(600).setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, 'Acceso Administrador');
}

//FUNCION ENVIAR CORREO ELECTRONICO DE CONFIRMACION DE CITA//
function enviarCorreoConfirmacion(datos) {
  if (!datos || !datos.correo) {
    console.log("No hay datos o correo para enviar email");
    return;
  }

  const asunto = "Confirmación de cita médica - Clínica Integral Santa Salud";

  const mensaje = `
Estimado/a ${datos.nombre},

Su cita ha sido agendada en la Clínica Integral Santa Salud con los siguientes detalles:

🩺 Especialidad: ${datos.motivo}
📅 Fecha: ${datos.fecha}
⏰ Hora: ${datos.hora}

Le solicitamos presentarse 15 minutos antes de su hora programada.

Gracias por confiar en nosotros.

Atentamente,
Clínica Integral Santa Salud (CISS)
`;

  MailApp.sendEmail({
    to: datos.correo,
    subject: asunto,
    body: mensaje
  });
}
//desarrollado para ESIT por Carlos Fuentes //
