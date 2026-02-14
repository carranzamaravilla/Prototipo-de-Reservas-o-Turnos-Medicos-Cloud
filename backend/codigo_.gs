/**********************************************************
 * CONFIGURACIÓN GLOBAL
 * Proyecto: Clínica Integral Santa Salud CISS
 * Desarrollado para ESIT por Carlos Fuentes (Ing. Cloud Jr.)
 **********************************************************/

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

// SEGURIDAD: Lista Blanca de Usuarios Autorizados (SSO)
const LISTA_BLANCA_ADMINS = [
  "charls23081@gmail.com",
  "carranzamaravilla@gmail.com",
  "elias.a.tovar@gmail.com",
  "luisgerardopuentes99@gmail.com",
  "marioizzytovar@gmail.com"
];

/************ UTILIDADES Y ACCESO ************/

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    // Estructura: A=Timestamp, B=Fecha, C=Hora, D=Paciente, E=Correo, F=Especialidad, G=Estado, H=ID, I=CreadoPor, J=ActualizadoPor
    sh.appendRow(["Timestamp","Fecha","Hora","Paciente","Correo","Especialidad","Estado","ID","Creado por","Actualizado por"]);
  }
  return sh;
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

/**
 * Valida si el usuario en sesión pertenece a la lista blanca.
 */
function loginAdmin() {
  try {
    const emailUsuario = Session.getActiveUser().getEmail().toLowerCase().trim();
    const tieneAcceso = LISTA_BLANCA_ADMINS.some(email => email.toLowerCase() === emailUsuario);

    if (tieneAcceso) {
      return { success: true, usuario: emailUsuario, message: "Acceso concedido" };
    } else {
      console.warn(`Intento no autorizado de: ${emailUsuario}`);
      return { success: false, usuario: emailUsuario, message: "Usuario no autorizado en lista blanca." };
    }
  } catch (e) {
    return { success: false, message: "Error SSO: " + e.message };
  }
}

/**
 * Middleware interno para proteger funciones de escritura
 */
function protegerOperacion() {
  const email = Session.getActiveUser().getEmail().toLowerCase().trim();
  if (!LISTA_BLANCA_ADMINS.includes(email)) {
    throw new Error("No tiene permisos para modificar datos.");
  }
}

/************ LÓGICA DE CITAS ************/

function agendarCita(datos) {
  const lock = LockService.getScriptLock();
  lock.waitLock(3000);

  try {
    const sheet = getSheet();
    const { fecha, hora, nombre, correo, motivo } = datos;
    const usuarioLogueado = Session.getActiveUser().getEmail();

    const fechaHora = new Date(`${fecha} ${hora}`);
    if (fechaHora < new Date()) return { success: false, message: "No se puede agendar en el pasado" };

    if (hayChoque(fecha, hora, motivo)) return { success: false, message: "Horario lleno para esta especialidad" };

    const id = Utilities.getUuid();
    
    // Registro con trazabilidad en I y J
    sheet.appendRow([
      new Date(),       // A: Timestamp
      fecha,            // B
      hora,             // C
      nombre,           // D
      correo,           // E
      motivo,           // F
      ESTADOS.AGENDADA, // G
      id,               // H
      usuarioLogueado,  // I: Creado por
      usuarioLogueado   // J: Actualizado por
    ]);

    enviarCorreoConfirmacion({ nombre, correo, motivo, fecha, hora });
    return { success: true, message: "Agendado por " + usuarioLogueado };

  } catch (e) {
    return { success: false, message: e.message };
  } finally {
    lock.releaseLock();
  }
}

function hayChoque(fecha, hora, especialidad, idExcluir = null) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;

  const capacidad = ESPECIALIDADES[especialidad] || 1;
  let ocupadas = 0;

  const fBusqueda = String(fecha).trim();
  const hBusqueda = String(hora).trim().substring(0, 5);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const idFila = String(row[7] || "").trim();
    if (idExcluir && idFila === idExcluir) continue;

    const estCelda = String(row[6] || "").trim();
    if (estCelda !== ESTADOS.AGENDADA) continue;

    const fCelda = row[1];
    const hCelda = row[2];
    const espCelda = String(row[5] || "").trim();

    const fString = (fCelda instanceof Date) ? Utilities.formatDate(fCelda, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(fCelda).trim();
    const hString = (hCelda instanceof Date) ? Utilities.formatDate(hCelda, Session.getScriptTimeZone(), "HH:mm") : String(hCelda).trim().substring(0, 5);

    if (fString === fBusqueda && hString === hBusqueda && espCelda === especialidad) {
      ocupadas++;
    }
  }
  return ocupadas >= capacidad;
}

function obtenerCitas(filtros) {
  filtros = filtros || {};
  const data = getSheet().getDataRange().getValues();
  data.shift(); 

  const resultado = data.map(row => ({
    timestamp: row[0] instanceof Date ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm") : row[0],
    fecha: row[1] instanceof Date ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), "dd/MM/yyyy") : row[1],
    hora: row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), "HH:mm") : row[2],
    nombre: row[3],
    correo: row[4],
    motivo: row[5],
    estado: row[6],
    id: row[7]
  })).filter(cita => {
    if (filtros.fecha && filtros.fecha !== cita.fecha) return false;
    if (filtros.motivo && filtros.motivo !== cita.motivo) return false;
    if (filtros.estado && filtros.estado !== cita.estado) return false;
    if (filtros.nombre && !cita.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) return false;
    return true;
  });

  return JSON.parse(JSON.stringify(resultado));
}

function modificarCita(id, campos) {
  protegerOperacion();
  const sh = getSheet();
  const data = sh.getDataRange().getValues();
  const usuario = Session.getActiveUser().getEmail();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][7]).trim() === String(id).trim()) {
      if (campos.estado) sh.getRange(i + 1, 7).setValue(campos.estado);
      sh.getRange(i + 1, 10).setValue(usuario); // Columna J
      return { success: true };
    }
  }
  return { success: false };
}

function editarCita(id, nuevosDatos) {
  protegerOperacion();
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const sh = getSheet();
    const data = sh.getDataRange().getValues();
    const usuario = Session.getActiveUser().getEmail();
    let fila = -1, esp = "";

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][7]).trim() === String(id).trim()) {
        fila = i + 1; esp = data[i][5]; break;
      }
    }
    if (fila === -1) throw new Error("Cita no encontrada");

    if (hayChoque(nuevosDatos.fecha, nuevosDatos.hora, esp, id)) {
      throw new Error("Horario lleno.");
    }

    sh.getRange(fila, 2).setValue(nuevosDatos.fecha);
    sh.getRange(fila, 3).setValue(nuevosDatos.hora);
    sh.getRange(fila, 10).setValue(usuario); // Trazabilidad J
    return true;
  } finally {
    lock.releaseLock();
  }
}

/************ NOTIFICACIONES Y EXPORTACIÓN ************/

function enviarCorreoConfirmacion(datos) {
  if (!datos.correo) return;
  const mensaje = `Estimado/a ${datos.nombre},\n\nSu cita en Clínica Santa Salud ha sido agendada:\n🩺 Especialidad: ${datos.motivo}\n📅 Fecha: ${datos.fecha}\n⏰ Hora: ${datos.hora}\n\nGracias por su preferencia.`;
  MailApp.sendEmail(datos.correo, "Confirmación de Cita - CISS", mensaje);
}

function exportarPDF() {
  protegerOperacion();
  const data = getSheet().getDataRange().getDisplayValues();
  let html = `<h2 style="text-align:center">Agenda Médica Santa Salud</h2><table border="1" style="width:100%; border-collapse:collapse;">`;
  html += `<tr>${data[0].map(h=>`<th style="background:#f2f2f2">${h}</th>`).join("")}</tr>`;
  for (let i=1; i<data.length; i++) {
    html += `<tr>${data[i].map(c=>`<td>${c}</td>`).join("")}</tr>`;
  }
  html += "</table>";
  const blob = HtmlService.createHtmlOutput(html).getBlob().setName("Agenda_Santa_Salud.pdf");
  return DriveApp.createFile(blob).getUrl();
}
