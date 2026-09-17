document.addEventListener("DOMContentLoaded", () => {
    const CLAVES = {
        historial: "historialTareas",
        pendientes: "tareasPendientes"
    };
    const crearId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

    const leerLista = (clave) => {
        try {
            const datos = JSON.parse(localStorage.getItem(clave));
            return Array.isArray(datos) ? datos : [];
        } catch {
            return [];
        }
    };

    class Tarea {
        constructor({ id = crearId(), ...datos }) {
            this.id = id;
            Object.assign(this, datos);
        }

        editar(cambios) {
            Object.assign(this, cambios);
        }

        calificar(dificultad) {
            this.dificultad = dificultad;
        }

        completar({ fechaFinalizacion, horaFinalizacion }) {
            this.fechaFinalizacion = fechaFinalizacion;
            this.horaFinalizacion = horaFinalizacion;
            this.estado = "completada";
        }
    }

    class GestorTareas {
        constructor(pendientes, historial) {
            this.pendientes = pendientes.map((tarea) => new Tarea(tarea));
            this.historial = historial.map((tarea) => new Tarea(tarea));
        }

        guardarPendientes() {
            localStorage.setItem(CLAVES.pendientes, JSON.stringify(this.pendientes));
        }

        guardarHistorial() {
            localStorage.setItem(CLAVES.historial, JSON.stringify(this.historial));
        }

        agregar(datos) {
            this.pendientes = [...this.pendientes, new Tarea(datos)];
            this.guardarPendientes();
        }

        editar(id, cambios) {
            this.pendientes.find((tarea) => tarea.id === id)?.editar(cambios);
            this.guardarPendientes();
        }

        eliminar(id) {
            this.pendientes = this.pendientes.filter((tarea) => tarea.id !== id);
            this.guardarPendientes();
        }

        calificar(id, dificultad) {
            this.pendientes.find((tarea) => tarea.id === id)?.calificar(dificultad);
            this.guardarPendientes();
        }

        completar(id, fechas) {
            const tarea = this.pendientes.find((pendiente) => pendiente.id === id);
            if (!tarea) return false;
            tarea.completar(fechas);
            this.historial = [...this.historial, tarea];
            this.pendientes = this.pendientes.filter((pendiente) => pendiente.id !== id);
            this.guardarPendientes();
            this.guardarHistorial();
            return true;
        }
    }

    const gestor = new GestorTareas(
        leerLista(CLAVES.pendientes),
        leerLista(CLAVES.historial)
    );
    let historialTareas = gestor.historial;
    let tareasPendientes = gestor.pendientes;
    let idEnEdicion = null;

    const $ = (selector) => document.querySelector(selector);
    const elementos = {
        btnAgregar: $("#btnAgregar"),
        btnCancelar: $("#btnCancelar"),
        formulario: $("#formulario"),
        formularioContenido: $(".formulario__contenido"),
        nombreTarea: $("#nombreTarea"),
        categoriaTarea: $("#categoriaTarea"),
        fechaTarea: $("#fechaTarea"),
        tareasImportantes: $("#flush-collapseOne .cuerpo__tareas"),
        tareasRegulares: $("#flush-collapseTwo .cuerpo__tareas"),
        tareasComplementarias: $("#flush-collapseThree .cuerpo__tareas"),
        modalHoy: $("#modalHoy"),
        modalHoyContenido: $("#modalHoyContenido"),
        btnPendientes: $("#btnPendientes"),
        btnCompletadas: $("#btnCompletadas"),
        resumen: $("#resumen")
    };

    const ahoraFormateado = () => {
        const ahora = new Date();
        const fecha = [
            ahora.getFullYear(),
            String(ahora.getMonth() + 1).padStart(2, "0"),
            String(ahora.getDate()).padStart(2, "0")
        ].join("-");
        const hora = ahora.toTimeString().slice(0, 5);
        return { fecha, hora };
    };

    const guardarPendientes = () => {
        gestor.pendientes = tareasPendientes;
        gestor.guardarPendientes();
    };

    const guardarHistorial = () => {
        gestor.historial = historialTareas;
        gestor.guardarHistorial();
    };

    // Incluye rest al recibir propiedades y spread al crear una copia independiente.
    const crearTarea = ({ id = crearId(), ...datos }) => new Tarea({ id, ...datos });

    // Asigna identificadores a tareas creadas antes de esta versión.
    const migrarTareasSinId = () => {
        let huboCambios = false;
        tareasPendientes = tareasPendientes.map((tarea) => {
            if (tarea.id) return tarea;
            huboCambios = true;
            return crearTarea(tarea);
        });

        if (huboCambios) guardarPendientes();
    };

    const obtenerContenedor = (categoria) => ({
        importantes: elementos.tareasImportantes,
        regulares: elementos.tareasRegulares,
        complementarias: elementos.tareasComplementarias
    }[categoria]);

    const crearBoton = (texto, accion, id, clase) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = texto;
        boton.dataset.accion = accion;
        boton.dataset.id = id;
        boton.className = clase;
        return boton;
    };

    const crearElementoTarea = (tarea) => {
        const elemento = document.createElement("div");
        elemento.className = "cuerpo__tarea";
        elemento.dataset.id = tarea.id;

        const titulo = document.createElement("strong");
        titulo.textContent = tarea.nombre;

        const fecha = document.createElement("span");
        fecha.textContent = `Fecha: ${tarea.fecha}`;

        const contador = document.createElement("span");
        contador.className = "contadorTarea";
        contador.dataset.fecha = tarea.fecha;

        const acciones = document.createElement("div");
        acciones.className = "cuerpo__acciones";
        acciones.append(
            crearBoton("Editar", "editar", tarea.id, "btnEditar"),
            crearBoton("Eliminar", "eliminar", tarea.id, "btnEliminar")
        );

        elemento.append(titulo, fecha, contador, acciones);
        return elemento;
    };

    const actualizarContadores = () => {
        document.querySelectorAll(".contadorTarea").forEach((contador) => {
            const limite = new Date(`${contador.dataset.fecha}T23:59:59`);
            const diferencia = limite - new Date();
            if (Number.isNaN(limite.getTime()) || diferencia < 0) {
                contador.textContent = "Fecha límite vencida";
                contador.classList.add("contadorTarea--vencido");
                return;
            }

            const minutos = Math.floor(diferencia / 60000);
            const dias = Math.floor(minutos / 1440);
            const horas = Math.floor((minutos % 1440) / 60);
            const minutosRestantes = minutos % 60;
            contador.textContent = `Faltan ${dias} d, ${horas} h y ${minutosRestantes} min`;
            contador.classList.remove("contadorTarea--vencido");
        });
    };

    const mostrarTareas = () => {
        [
            elementos.tareasImportantes,
            elementos.tareasRegulares,
            elementos.tareasComplementarias
        ].filter(Boolean).forEach((contenedor) => {
            contenedor.replaceChildren();
        });

        tareasPendientes.forEach((tarea) => {
            const contenedor = obtenerContenedor(tarea.categoria);
            if (contenedor) contenedor.appendChild(crearElementoTarea(tarea));
        });
        actualizarContadores();
    };

    const actualizarResumen = () => {
        if (!elementos.resumen) return;

        const { fecha: hoy } = ahoraFormateado();
        const pendientesHoy = tareasPendientes.filter(({ fecha }) => fecha === hoy).length;
        const completadasHoy = historialTareas.filter(
            ({ fechaFinalizacion }) => fechaFinalizacion === hoy
        ).length;
        const principales = tareasPendientes.filter(
            ({ categoria }) => categoria === "importantes"
        ).length;

        const badges = elementos.resumen.querySelectorAll("li .badge");
        [completadasHoy, pendientesHoy, principales].forEach((cantidad, indice) => {
            if (badges[indice]) badges[indice].textContent = cantidad;
        });
    };

    const limpiarFormulario = () => {
        elementos.formularioContenido?.reset();
        idEnEdicion = null;
        if (elementos.btnAgregar) elementos.btnAgregar.textContent = "Agregar tarea";
    };

    const cerrarFormulario = () => {
        elementos.formulario?.classList.remove("formulario--visible");
        limpiarFormulario();
    };

    const editarTarea = (id) => {
        const tarea = tareasPendientes.find((pendiente) => pendiente.id === id);
        if (!tarea || !elementos.formulario) return;

        const { nombre, categoria, fecha } = tarea;
        elementos.nombreTarea.value = nombre;
        elementos.categoriaTarea.value = categoria;
        elementos.fechaTarea.value = fecha;
        idEnEdicion = id;
        elementos.formulario.classList.add("formulario--visible");
        elementos.nombreTarea.focus();
    };

    const eliminarTarea = (id) => {
        const tarea = tareasPendientes.find((pendiente) => pendiente.id === id);
        if (!tarea) return;

        if (!window.confirm(`¿Eliminar la tarea “${tarea.nombre}”?`)) return;

        gestor.eliminar(id);
        tareasPendientes = gestor.pendientes;
        mostrarTareas();
        actualizarResumen();
    };

    const mostrarTareasHoy = () => {
        if (!elementos.modalHoyContenido) return;

        const { fecha: hoy } = ahoraFormateado();
        const tareasHoy = tareasPendientes.filter(({ fecha }) => fecha === hoy);
        elementos.modalHoyContenido.replaceChildren();

        if (!tareasHoy.length) {
            elementos.modalHoyContenido.textContent = "🎉 ¡Felicitaciones! No tienes tareas programadas para hoy.";
            return;
        }

        tareasHoy.forEach((tarea) => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "modal__tarea";
            tarjeta.dataset.id = tarea.id;

            const titulo = document.createElement("strong");
            titulo.textContent = `📌 ${tarea.nombre}`;
            const detalle = document.createElement("span");
            detalle.textContent = `Categoría: ${tarea.categoria} | Fecha: ${tarea.fecha}`;

            const estrellas = document.createElement("div");
            estrellas.className = "modal__estrellas";
            estrellas.append("Dificultad: ");

            for (let valor = 1; valor <= 5; valor += 1) {
                const estrella = document.createElement("button");
                estrella.type = "button";
                estrella.dataset.dificultad = valor;
                estrella.textContent = valor <= (tarea.dificultad || 0) ? "★" : "☆";
                estrellas.appendChild(estrella);
            }

            const completar = crearBoton("✓ Completar", "completar", tarea.id, "modal__boton-completar");
            completar.disabled = !tarea.dificultad;
            tarjeta.append(titulo, detalle, estrellas, completar);
            elementos.modalHoyContenido.appendChild(tarjeta);
        });
    };

    const mostrarNotificacion = (mensaje, tipo = "informacion") => {
        let aviso = $("#notificacionTareas");
        if (!aviso) {
            aviso = document.createElement("div");
            aviso.id = "notificacionTareas";
            aviso.setAttribute("role", "status");
            document.body.appendChild(aviso);
        }
        aviso.className = `notificacionTareas notificacionTareas--${tipo}`;
        aviso.textContent = mensaje;
        aviso.hidden = false;
        return aviso;
    };

    const agregarTareaConRetardo = (datos) => {
        const aviso = mostrarNotificacion("Guardando tarea...");
        const botonEnviar = elementos.formularioContenido?.querySelector('[type="submit"]');
        if (botonEnviar) botonEnviar.disabled = true;
        setTimeout(() => {
            gestor.agregar(datos);
            tareasPendientes = gestor.pendientes;
            mostrarTareas();
            actualizarResumen();
            cerrarFormulario();
            if (botonEnviar) botonEnviar.disabled = false;

            setTimeout(() => {
                mostrarNotificacion("✓ Tarea creada correctamente.", "exito");
                setTimeout(() => { aviso.hidden = true; }, 3000);
            }, 2000);
        }, 800);
    };

    elementos.btnAgregar?.addEventListener("click", () => {
        elementos.formulario?.classList.add("formulario--visible");
        elementos.nombreTarea?.focus();
    });

    elementos.btnCancelar?.addEventListener("click", cerrarFormulario);

    // keyup: feedback inmediato sobre el campo obligatorio del formulario.
    elementos.nombreTarea?.addEventListener("keyup", ({ currentTarget }) => {
        const esValido = currentTarget.value.trim().length >= 3;
        currentTarget.setCustomValidity(esValido ? "" : "Escribe al menos 3 caracteres.");
        currentTarget.setAttribute("aria-invalid", String(!esValido));
    });

    elementos.formularioContenido?.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nombre = elementos.nombreTarea.value.trim();
        const categoria = elementos.categoriaTarea.value;
        const fecha = elementos.fechaTarea.value;
        if (nombre.length < 3 || !categoria || !fecha) {
            alert("Completa todos los campos y escribe un nombre de al menos 3 caracteres.");
            return;
        }

        if (idEnEdicion) {
            gestor.editar(idEnEdicion, { nombre, categoria, fecha });
            tareasPendientes = gestor.pendientes;
            mostrarTareas();
            actualizarResumen();
            cerrarFormulario();
        } else {
            const { fecha: fechaCreacion, hora: horaCreacion } = ahoraFormateado();
            agregarTareaConRetardo({
                nombre, categoria, fecha, fechaCreacion, horaCreacion,
                estado: "pendiente", dificultad: null
            });
        }
    });

    // Delegación: funciona para los botones creados dinámicamente.
    document.addEventListener("click", (evento) => {
        const boton = evento.target.closest("[data-accion]");
        if (!boton) return;
        const { accion, id } = boton.dataset;
        if (accion === "editar") editarTarea(id);
        if (accion === "eliminar") eliminarTarea(id);
    });

    // mouseover: explica la acción destructiva antes de hacer clic.
    document.addEventListener("mouseover", (evento) => {
        const boton = evento.target.closest(".btnEliminar");
        if (boton) boton.title = "Eliminar esta tarea pendiente";
    });

    elementos.modalHoy?.addEventListener("show.bs.modal", mostrarTareasHoy);

    elementos.modalHoyContenido?.addEventListener("click", (evento) => {
        const estrella = evento.target.closest("[data-dificultad]");
        if (estrella) {
            const tarjeta = estrella.closest(".modal__tarea");
            const dificultad = Number(estrella.dataset.dificultad);
            gestor.calificar(tarjeta.dataset.id, dificultad);
            tareasPendientes = gestor.pendientes;
            mostrarTareasHoy();
            return;
        }

        const boton = evento.target.closest('[data-accion="completar"]');
        if (!boton) return;
        const tarea = tareasPendientes.find((pendiente) => pendiente.id === boton.dataset.id);
        if (!tarea) return;
        if (!tarea.dificultad) {
            alert("Debes evaluar la dificultad antes de completar la tarea.");
            return;
        }

        const { fecha: fechaFinalizacion, hora: horaFinalizacion } = ahoraFormateado();
        gestor.completar(tarea.id, { fechaFinalizacion, horaFinalizacion });
        historialTareas = gestor.historial;
        tareasPendientes = gestor.pendientes;
        mostrarTareas();
        actualizarResumen();
        mostrarTareasHoy();
    });

    elementos.btnPendientes?.addEventListener("click", () => {
        ["#flush-collapseOne", "#flush-collapseTwo", "#flush-collapseThree"].forEach((selector) => {
            $(selector)?.classList.add("show");
        });
    });

    elementos.btnCompletadas?.addEventListener("click", () => {
        window.location.href = "./completadas.html";
    });

    migrarTareasSinId();
    mostrarTareas();
    actualizarResumen();
    setInterval(actualizarContadores, 60000);
});
