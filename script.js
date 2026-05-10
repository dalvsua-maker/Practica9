const readline = require("readline-sync");
const { DateTime } = require("luxon");
const fs = require("fs");


class Agenda {


    constructor(nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
        this.tareas = this.leerAgenda();
    }

    leerAgenda = () => {
        try {
            if (!fs.existsSync(`./${this.nombreArchivo}.json`)) return [];
            const data = fs.readFileSync(`./${this.nombreArchivo}.json`, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo:", error.message);
            return [];
        }
    };




    guardarCambios() {
        fs.writeFileSync(
            `./${this.nombreArchivo}.json`,
            JSON.stringify(this.tareas, null, 2)
        );
    }

    // Comprueba si un nuevo evento se solapa con los existentes 
    haySolapamiento(nuevaFechaInicio, nuevaDuracion) {
        const nuevoInicio = nuevaFechaInicio;
        const nuevoFin = nuevaFechaInicio.plus({ minutes: nuevaDuracion });

        for (let tarea of this.tareas) {
            const inicioExistente = DateTime.fromISO(tarea.fecha);
            const finExistente = inicioExistente.plus({ minutes: tarea.duracion });

            // Lógica de solapamiento: (InicioA < FinB) y (InicioB < FinA)
            if (nuevoInicio < finExistente && inicioExistente < nuevoFin) {
                return true;
            }
        }
        return false;
    }


    mostrarFormatoEvento(evento) {
        const inicio = DateTime.fromISO(evento.fecha);
        const fin = inicio.plus({ minutes: evento.duracion });
        
        console.log(`------------------------------`);
        console.log(`Título: ${evento.titulo}`); // [cite: 17]
        console.log(`Fecha de inicio: ${inicio.toLocaleString(DateTime.DATETIME_SHORT)}`); // [cite: 18]
        console.log(`Fecha de fin: ${fin.toLocaleString(DateTime.DATETIME_SHORT)}`); // 
    }

    // Punto 2 y 3 del enunciado [cite: 15, 20]
    verEventosFecha(fechaFiltro = DateTime.now()) {
        const filtrados = this.tareas
            .filter(t => DateTime.fromISO(t.fecha).hasSame(fechaFiltro, 'day'))
            .sort((a, b) => DateTime.fromISO(a.fecha) - DateTime.fromISO(b.fecha)); // Ordenar por fecha 

        if (filtrados.length === 0) {
            console.log("\nNo hay eventos para esta fecha.");
        } else {
            filtrados.forEach(e => this.mostrarFormatoEvento(e));
        }
    }

    pedirDato(mensaje, min, max) {
        let dato;
        while (true) {
            dato = readline.questionInt(`${mensaje} (${min}-${max}): `);
            if (dato >= min && dato <= max) return dato;
            console.log(`Valor inválido.`);
        }
    }

    // Punto 1: Nuevo evento [cite: 12]


    crearTarea() {
        console.log("\n--- Nuevo Evento ---");
        const anio = this.pedirDato("Año", 2023, 2100);
        const mes = this.pedirDato("Mes", 1, 12);
        const dia = this.pedirDato("Día", 1, 31);
        const hora = this.pedirDato("Hora", 0, 23);
        const min = this.pedirDato("Minuto", 0, 59);

        const fechaObjeto = DateTime.fromObject({ year: anio, month: mes, day: dia, hour: hora, minute: min });

        if (!fechaObjeto.isValid) {
            console.error("Fecha no válida:", fechaObjeto.invalidReason);
            return;
        }

        const titulo = readline.question("Introduce el titulo: ");
        const duracion = readline.questionInt("Introduce la duracion (minutos): ");

        if (this.haySolapamiento(fechaObjeto, duracion)) {
            console.log("\nError: El evento se solapa con otro ya programado."); // 
        } else {
            this.tareas.push({
                fecha: fechaObjeto.toISO(),
                titulo: titulo,
                duracion: duracion
            });
            this.guardarCambios(); // [cite: 25]
            console.log("Evento guardado.");
        }
    }

    // Punto 4: Borrar [cite: 22]
    borrarEvento() {
        if (this.tareas.length === 0) return console.log("No hay nada que borrar.");
        
        console.log("\n--- Seleccione evento para borrar ---");
        this.tareas.forEach((t, i) => {
            console.log(`${i + 1}. ${t.titulo} (${t.fecha})`);
        });

        const indice = this.pedirDato("Número de evento", 1, this.tareas.length) - 1;
        this.tareas.splice(indice, 1);
        this.guardarCambios(); // [cite: 25]
        console.log("Evento eliminado.");
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
            console.log("1. Nuevo evento");
            console.log("2. Ver eventos de hoy");
            console.log("3. Buscar eventos por fecha");
            console.log("4. Borrar evento");
            console.log("5. Salir");

            let opcion = readline.questionInt("Seleccione una opcion: ");

            switch (opcion) {
                case 1: this.agenda.crearTarea(); break;
                case 2: this.agenda.verEventosFecha(); break;
                case 3:
                    const anio = this.agenda.pedirDato("Año", 2023, 2100);
                    const mes = this.agenda.pedirDato("Mes", 1, 12);
                    const dia = this.agenda.pedirDato("Día", 1, 31);
                    this.agenda.verEventosFecha(DateTime.fromObject({ year: anio, month: mes, day: dia }));
                    break;
                case 4: this.agenda.borrarEvento(); break;
                case 5: salir = true; break;
                default: console.log("Opción incorrecta.");
            }
        }
    }
}

new Menu().lanzar();