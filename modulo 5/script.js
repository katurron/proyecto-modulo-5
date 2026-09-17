document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // DATOS GUARDADOS
    // ==========================================

    let historialTareas = JSON.parse(
        localStorage.getItem("historialTareas")
    ) || [];

    let tareasPendientes = JSON.parse(
        localStorage.getItem("tareasPendientes")
    ) || [];


    // ==========================================
    // ELEMENTOS DEL HEADER
    // ==========================================

    const btnAgregar = document.querySelector("#btnAgregar");
    const btnCancelar = document.querySelector("#btnCancelar");


    // ==========================================
    // ELEMENTOS DEL FORMULARIO
    // ==========================================

    const formulario = document.querySelector("#formulario");
    const formularioContenido =
        document.querySelector(".formulario__contenido");

    const nombreTarea =
        document.querySelector("#nombreTarea");

    const categoriaTarea =
        document.querySelector("#categoriaTarea");

    const fechaTarea =
        document.querySelector("#fechaTarea");


    // ==========================================
    // ELEMENTOS DEL ACORDEÓN
    // ==========================================

    const tareasImportantes =
        document.querySelector(
            "#flush-collapseOne .cuerpo__tareas"
        );

    const tareasRegulares =
        document.querySelector(
            "#flush-collapseTwo .cuerpo__tareas"
        );

    const tareasComplementarias =
        document.querySelector(
            "#flush-collapseThree .cuerpo__tareas"
        );


    // ==========================================
    // ABRIR FORMULARIO
    // ==========================================

    if (btnAgregar) {

        btnAgregar.addEventListener("click", function () {

            formulario.classList.add(
                "formulario--visible"
            );

        });

    }


    // ==========================================
    // CANCELAR
    // ==========================================

    if (btnCancelar) {

        btnCancelar.addEventListener("click", function () {

            formulario.classList.remove(
                "formulario--visible"
            );

            formularioContenido.reset();

        });

    }


    // ==========================================
    // MOSTRAR TAREAS EN EL ACORDEÓN
    // ==========================================

    function mostrarTareas() {

        // Limpiar las tres categorías

        tareasImportantes.innerHTML = "";
        tareasRegulares.innerHTML = "";
        tareasComplementarias.innerHTML = "";


        // Recorrer tareas guardadas

        tareasPendientes.forEach(function (tarea) {

            const elemento =
                document.createElement("div");

            elemento.classList.add(
                "cuerpo__tarea"
            );


            // Guardar información en dataset

            elemento.dataset.nombre =
                tarea.nombre;

            elemento.dataset.fecha =
                tarea.fecha;

            elemento.dataset.categoria =
                tarea.categoria;

            elemento.dataset.fechaCreacion =
                tarea.fechaCreacion;

            elemento.dataset.horaCreacion =
                tarea.horaCreacion;

            elemento.dataset.estado =
                "pendiente";


            // Mostrar información

            elemento.innerHTML = `
                <strong>
                    ${tarea.nombre}
                </strong>

                <span>
                    Fecha: ${tarea.fecha}
                </span>
            `;


            // ==================================
            // UBICAR POR CATEGORÍA
            // ==================================

            if (
                tarea.categoria ===
                "importantes"
            ) {

                tareasImportantes.appendChild(
                    elemento
                );

            }

            else if (
                tarea.categoria ===
                "regulares"
            ) {

                tareasRegulares.appendChild(
                    elemento
                );

            }

            else if (
                tarea.categoria ===
                "complementarias"
            ) {

                tareasComplementarias.appendChild(
                    elemento
                );

            }

        });

    }


    // ==========================================
    // MOSTRAR TAREAS AL CARGAR LA PÁGINA
    // ==========================================

    mostrarTareas();


    // ==========================================
    // GUARDAR NUEVA TAREA
    // ==========================================

    if (formularioContenido) {

        formularioContenido.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();


                // ==================================
                // OBTENER DATOS
                // ==================================

                const nombre =
                    nombreTarea.value.trim();

                const categoria =
                    categoriaTarea.value;

                const fecha =
                    fechaTarea.value;


                // ==================================
                // VALIDAR
                // ==================================

                if (
                    nombre === "" ||
                    categoria === "" ||
                    fecha === ""
                ) {

                    alert(
                        "Por favor, completa todos los campos."
                    );

                    return;

                }


                // ==================================
                // FECHA Y HORA DE CREACIÓN
                // ==================================

                const ahora = new Date();


                const fechaCreacion =
                    ahora.getFullYear() +
                    "-" +
                    String(
                        ahora.getMonth() + 1
                    ).padStart(2, "0") +
                    "-" +
                    String(
                        ahora.getDate()
                    ).padStart(2, "0");


                const horaCreacion =
                    String(
                        ahora.getHours()
                    ).padStart(2, "0") +
                    ":" +
                    String(
                        ahora.getMinutes()
                    ).padStart(2, "0");


                // ==================================
                // CREAR OBJETO
                // ==================================

                const nuevaTarea = {

                    nombre: nombre,

                    categoria: categoria,

                    fecha: fecha,

                    fechaCreacion:
                        fechaCreacion,

                    horaCreacion:
                        horaCreacion,

                    estado: "pendiente"

                };


                // ==================================
                // GUARDAR
                // ==================================

                tareasPendientes.push(
                    nuevaTarea
                );


                localStorage.setItem(
                    "tareasPendientes",
                    JSON.stringify(
                        tareasPendientes
                    )
                );


                // ==================================
                // ACTUALIZAR PANTALLA
                // ==================================

                mostrarTareas();

                actualizarResumen();


                // ==================================
                // LIMPIAR Y CERRAR
                // ==================================

                formularioContenido.reset();

                formulario.classList.remove(
                    "formulario--visible"
                );


                console.log(
                    "Tarea guardada:",
                    nuevaTarea
                );

            }
        );

    }


    // ==========================================
    // TAREAS PROGRAMADAS HOY
    // ==========================================

    const modalHoy =
        document.querySelector("#modalHoy");

    const modalHoyContenido =
        document.querySelector(
            "#modalHoyContenido"
        );


    if (modalHoy) {

        modalHoy.addEventListener(
            "show.bs.modal",
            function () {

                mostrarTareasHoy();

            }
        );

    }


    // ==========================================
    // MOSTRAR TAREAS DE HOY
    // ==========================================

    function mostrarTareasHoy() {

        const ahora = new Date();


        const hoy =
            ahora.getFullYear() +
            "-" +
            String(
                ahora.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                ahora.getDate()
            ).padStart(2, "0");


        modalHoyContenido.innerHTML = "";


        const tareasHoy =
            tareasPendientes.filter(
                function (tarea) {

                    return tarea.fecha === hoy;

                }
            );


        // ==================================
        // SIN TAREAS
        // ==================================

        if (tareasHoy.length === 0) {

            modalHoyContenido.innerHTML = `

                <p>
                    🎉 ¡Felicitaciones!
                </p>

                <p>
                    No tienes tareas programadas
                    para hoy.
                </p>

            `;

            return;

        }


        // ==================================
        // CREAR TAREAS
        // ==================================

        tareasHoy.forEach(function (tarea) {

            const tareaModal =
                document.createElement("div");

            tareaModal.classList.add(
                "modal__tarea"
            );


            tareaModal.innerHTML = `

                <strong>
                    📌 ${tarea.nombre}
                </strong>

                <span>
                    Categoría:
                    ${tarea.categoria}
                </span>

                <span>
                    Fecha:
                    ${tarea.fecha}
                </span>

                <div class="modal__estrellas">

                    <span>
                        Dificultad:
                    </span>

                    <button
                        type="button"
                        data-dificultad="1">
                        ☆
                    </button>

                    <button
                        type="button"
                        data-dificultad="2">
                        ☆
                    </button>

                    <button
                        type="button"
                        data-dificultad="3">
                        ☆
                    </button>

                    <button
                        type="button"
                        data-dificultad="4">
                        ☆
                    </button>

                    <button
                        type="button"
                        data-dificultad="5">
                        ☆
                    </button>

                </div>

                <button
                    type="button"
                    class="modal__boton-completar"
                    disabled>
                    ✓ Completar
                </button>

            `;


            modalHoyContenido.appendChild(
                tareaModal
            );


            // ==================================
            // ESTRELLAS
            // ==================================

            const estrellas =
                tareaModal.querySelectorAll(
                    ".modal__estrellas button"
                );


            const botonCompletar =
                tareaModal.querySelector(
                    ".modal__boton-completar"
                );


            estrellas.forEach(
                function (estrella) {

                    estrella.addEventListener(
                        "click",
                        function () {

                            const dificultad =
                                Number(
                                    estrella.dataset
                                        .dificultad
                                );


                            estrellas.forEach(
                                function (
                                    estrellaActual
                                ) {

                                    const valor =
                                        Number(
                                            estrellaActual
                                                .dataset
                                                .dificultad
                                        );


                                    if (
                                        valor <=
                                        dificultad
                                    ) {

                                        estrellaActual
                                            .textContent =
                                            "★";

                                    } else {

                                        estrellaActual
                                            .textContent =
                                            "☆";

                                    }

                                }
                            );


                            // Guardar dificultad
                            tarea.dificultad =
                                dificultad;


                            // Activar completar
                            botonCompletar.disabled =
                                false;

                        }
                    );

                }
            );

        });

    }


    // ==========================================
    // COMPLETAR TAREA
    // ==========================================

    if (modalHoyContenido) {

        modalHoyContenido.addEventListener(
            "click",
            function (evento) {

                if (
                    !evento.target.classList.contains(
                        "modal__boton-completar"
                    )
                ) {

                    return;

                }


                const tareaModal =
                    evento.target.closest(
                        ".modal__tarea"
                    );


                const nombre =
                    tareaModal
                        .querySelector("strong")
                        .textContent
                        .replace("📌 ", "")
                        .trim();


                // ==================================
                // BUSCAR EN PENDIENTES
                // ==================================

                const posicion =
                    tareasPendientes.findIndex(
                        function (tarea) {

                            return (
                                tarea.nombre ===
                                nombre
                            );

                        }
                    );


                if (posicion === -1) {

                    alert(
                        "No se encontró la tarea."
                    );

                    return;

                }


                const tarea =
                    tareasPendientes[posicion];


                // ==================================
                // VERIFICAR DIFICULTAD
                // ==================================

                if (
                    !tarea.dificultad ||
                    tarea.dificultad < 1 ||
                    tarea.dificultad > 5
                ) {

                    alert(
                        "Debes evaluar la dificultad antes de completar la tarea."
                    );

                    return;

                }


                // ==================================
                // FECHA Y HORA FINALIZACIÓN
                // ==================================

                const ahora = new Date();


                const fechaFinalizacion =
                    ahora.getFullYear() +
                    "-" +
                    String(
                        ahora.getMonth() + 1
                    ).padStart(2, "0") +
                    "-" +
                    String(
                        ahora.getDate()
                    ).padStart(2, "0");


                const horaFinalizacion =
                    String(
                        ahora.getHours()
                    ).padStart(2, "0") +
                    ":" +
                    String(
                        ahora.getMinutes()
                    ).padStart(2, "0");


                // ==================================
                // CREAR HISTORIAL
                // ==================================

                const tareaCompletada = {

                    nombre:
                        tarea.nombre,

                    categoria:
                        tarea.categoria,

                    fecha:
                        tarea.fecha,

                    fechaCreacion:
                        tarea.fechaCreacion,

                    horaCreacion:
                        tarea.horaCreacion,

                    fechaFinalizacion:
                        fechaFinalizacion,

                    horaFinalizacion:
                        horaFinalizacion,

                    dificultad:
                        tarea.dificultad,

                    estado:
                        "completada"

                };


                // ==================================
                // AGREGAR AL HISTORIAL
                // ==================================

                historialTareas.push(
                    tareaCompletada
                );


                localStorage.setItem(
                    "historialTareas",
                    JSON.stringify(
                        historialTareas
                    )
                );


                // ==================================
                // ELIMINAR DE PENDIENTES
                // ==================================

                tareasPendientes.splice(
                    posicion,
                    1
                );


                localStorage.setItem(
                    "tareasPendientes",
                    JSON.stringify(
                        tareasPendientes
                    )
                );


                // ==================================
                // ACTUALIZAR PANTALLA
                // ==================================

                mostrarTareas();

                actualizarResumen();


                // ==================================
                // ELIMINAR DE MODAL
                // ==================================

                tareaModal.remove();


                console.log(
                    "Tarea completada:",
                    tareaCompletada
                );

            }
        );

    }


    // ==========================================
    // TAREAS PENDIENTES
    // ==========================================

    const btnPendientes =
        document.querySelector(
            "#btnPendientes"
        );


    const importantes =
        document.querySelector(
            "#flush-collapseOne"
        );

    const regulares =
        document.querySelector(
            "#flush-collapseTwo"
        );

    const complementarias =
        document.querySelector(
            "#flush-collapseThree"
        );


    if (btnPendientes) {

        btnPendientes.addEventListener(
            "click",
            function () {

                importantes.classList.add(
                    "show"
                );

                regulares.classList.add(
                    "show"
                );

                complementarias.classList.add(
                    "show"
                );

            }
        );

    }


    // ==========================================
    // TAREAS COMPLETADAS
    // ==========================================

    const btnCompletadas =
        document.querySelector(
            "#btnCompletadas"
        );


    if (btnCompletadas) {

        btnCompletadas.addEventListener(
            "click",
            function () {

                window.location.href =
                    "./completadas.html";

            }
        );

    }


    // ==========================================
    // RESUMEN
    // ==========================================

    function actualizarResumen() {

        const ahora = new Date();


        const hoy =
            ahora.getFullYear() +
            "-" +
            String(
                ahora.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                ahora.getDate()
            ).padStart(2, "0");


        // ==================================
        // PENDIENTES DE HOY
        // ==================================

        const pendientesHoy =
            tareasPendientes.filter(
                function (tarea) {

                    return tarea.fecha === hoy;

                }
            ).length;


        // ==================================
        // COMPLETADAS HOY
        // ==================================

        const completadasHoy =
            historialTareas.filter(
                function (tarea) {

                    return (
                        tarea.fechaFinalizacion ===
                        hoy
                    );

                }
            ).length;


        // ==================================
        // PRINCIPALES
        // ==================================

        const principales =
            tareasPendientes.filter(
                function (tarea) {

                    return (
                        tarea.categoria ===
                        "importantes"
                    );

                }
            ).length;


        // ==================================
        // BUSCAR ELEMENTOS DEL RESUMEN
        // ==================================

        const resumen =
            document.querySelector(
                "#resumen"
            );


        if (!resumen) {

            return;

        }


        const elementos =
            resumen.querySelectorAll(
                "li"
            );


        // Completadas hoy

        if (elementos[0]) {

            const badge =
                elementos[0].querySelector(
                    ".badge"
                );

            if (badge) {

                badge.textContent =
                    completadasHoy;

            }

        }


        // Pendientes hoy

        if (elementos[1]) {

            const badge =
                elementos[1].querySelector(
                    ".badge"
                );

            if (badge) {

                badge.textContent =
                    pendientesHoy;

            }

        }


        // Principales

        if (elementos[2]) {

            const badge =
                elementos[2].querySelector(
                    ".badge"
                );

            if (badge) {

                badge.textContent =
                    principales;

            }

        }


        console.log(
            "Completadas hoy:",
            completadasHoy
        );

        console.log(
            "Pendientes hoy:",
            pendientesHoy
        );

        console.log(
            "Principales:",
            principales
        );

    }


    // ==========================================
    // CARGAR RESUMEN
    // ==========================================

    actualizarResumen();

});