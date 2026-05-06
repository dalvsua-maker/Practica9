const readline = require("readline-sync");
const { DateTime } = require("luxon");
const fs = require("fs");

class Agenda {
    constructor(nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
        this.tareas = this.leerCarta();
    }
    leerCarta = () => {
        try {
            const data = fs.readFileSync(`./${this.nombreArchivo}.json`, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo de carta:", error.message);
            return [];
        }
    };
    fechaRepetida(tareas, fechaObjetoEntrada) {
        // Obtenemos los milisegundos de la nueva fecha
        const msEntrada = fechaObjetoEntrada.toMillis();

        for (let i = 0; i < tareas.length; i++) {
            // Convertimos el string guardado a objeto Luxon para sacar sus ms
            const msGuardado = DateTime.fromISO(tareas[i].fecha).toMillis();

            if (msEntrada === msGuardado) {
                return true; // Coincidencia exacta de tiempo
            }
        }
        return false;
    }


    mostrarTareas() {
        // Mostrar tareas
        this.tareas.forEach(({ fecha, titulo, duracion }) => {
            const fechaStr = fecha.toString().padEnd(4);
            const tituloStr = titulo.toString();
            const duracionStr = duracion.toString();
            console.log(`${fechaStr} | ${tituloStr} | ${duracionStr} `);
        });



    }
    pedirDato(mensaje, min, max) {
        let dato;
        while (true) {
            dato = readline.questionInt(`${mensaje} (${min}-${max}): `);
            if (dato >= min && dato <= max) {
                return dato;
            }
            console.log(`Valor inválido. Debe estar entre ${min} y ${max}.`);
        }
    }
    //año, mes, día, hora y minuto; el título y la duración. (Formato ISO "2023-04-12T09:00:00.000+02:00")
    crearTarea() {
        console.log("--- Registro de Fecha y Hora Detallado ---");

        const anio = this.pedirDato("Introduce el año", 1, 9999);
        const mes = this.pedirDato("Introduce el mes", 1, 12);
        const dia = this.pedirDato("Introduce el día", 1, 31);
        const hora = this.pedirDato("Introduce la hora", 0, 23);
        const min = this.pedirDato("Introduce los minutos", 0, 59);

        const fechaObjeto = DateTime.fromObject({
            year: anio,
            month: mes,
            day: dia,
            hour: hora,
            minute: min
        });

        if (fechaObjeto.isValid) {
            // LÓGICA CORREGIDA: Si el método devuelve TRUE, es que existe
            if (this.fechaRepetida(this.tareas, fechaObjeto)) {
                console.log("\n Error: Ya existe una tarea programada exactamente para esa fecha y hora.");
            } else {
                // Si devuelve FALSE, la fecha está libre
                const titulo = readline.question("Introduce el titulo de la tarea: ");
                const duracion = readline.questionInt("Introduce la duracion en minutos: ");

                const nuevaTarea = {
                    fecha: fechaObjeto.toISO(),
                    titulo: titulo,
                    duracion: duracion
                };

                this.tareas.push(nuevaTarea);
                fs.writeFileSync(
                    `./${this.nombreArchivo}.json`,
                    JSON.stringify(this.tareas, null, 2) // El 'null, 2' mantiene el JSON ordenado
                );
                console.log(" Tarea guardada con éxito.");
            }
        } else {
            console.error("--- Error en los datos:", fechaObjeto.invalidReason);
        }
    }

}

class Menu {
    constructor() {
        this.agenda = new Agenda("datos");
    }

    lanzar() {
        let salir = false;
        while (!salir) {
            console.log("\n--- AGENDA ---");
            console.log("1. Crear nueva tarea");
            console.log("2. Ver tareas");
            console.log("3. ");
            console.log("4. Salir ");

            let opcion = readline.questionInt("Seleccione una opcion: ");

            switch (opcion) {
                case 1:
                    this.agenda.crearTarea();
                    break;
                //case 1: console.log(this.agenda.leerCarta()); break;
                case 2:
                    this.agenda.mostrarTareas();
                    break;
                case 3:
                    break;
                case 4:
                    salir = true;
                    break;
                default:
                    console.log("Opción incorrecta.");
            }
        }
    }
}
let m = new Menu();
m.lanzar();
