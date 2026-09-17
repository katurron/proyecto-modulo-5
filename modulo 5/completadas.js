document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // DATOS DEL LOCALSTORAGE
    // ==========================================

    const historialTareas = JSON.parse(
        localStorage.getItem("historialTareas")
    ) || [];

    const listaTareasPendientes = JSON.parse(
        localStorage.getItem("tareasPendientes")
    ) || [];


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const tablaHistorial =
        document.querySelector("#tablaHistorial");

    const filtroCategoria =
        document.querySelector("#filtroCategoria");

    const btnVolver =
        document.querySelector("#btnVolver");

    const btnGraficoTotal =
        document.querySelector("#btnGraficoTotal");

    const btnGraficoTiempo =
        document.querySelector("#btnGraficoTiempo");

    const btnGraficoDificultad =
        document.querySelector("#btnGraficoDificultad");

    const contenedorGrafico =
        document.querySelector("#contenedorGrafico");


    // ==========================================
    // CATEGORÍAS
    // ==========================================

    const categorias = [
        "importantes",
        "regulares",
        "complementarias"
    ];

    const nombresCategorias = {
        importantes: "Importantes",
        regulares: "Regulares",
        complementarias: "Complementarias"
    };


    // ==========================================
    // MOSTRAR HISTORIAL
    // ==========================================

    function mostrarHistorial() {

        tablaHistorial.innerHTML = "";

        const categoriaSeleccionada =
            filtroCategoria.value;


        historialTareas.forEach(function (tarea) {

            if (
                categoriaSeleccionada !== "todas" &&
                tarea.categoria !== categoriaSeleccionada
            ) {
                return;
            }


            const fila =
                document.createElement("tr");


            const dificultad =
                Number(tarea.dificultad) || 0;


            fila.innerHTML = `

                <td>
                    ${tarea.nombre}
                </td>

                <td>
                    ${tarea.fecha}
                </td>

                <td>
                    ${tarea.fechaCreacion || "-"}
                    ${tarea.horaCreacion || ""}
                </td>

                <td>
                    ${tarea.fechaFinalizacion || "-"}
                    ${tarea.horaFinalizacion || ""}
                </td>

                <td>
                    ${tarea.categoria}
                </td>

                <td>
                    ${"★".repeat(dificultad)}
                    ${"☆".repeat(5 - dificultad)}
                </td>

            `;


            tablaHistorial.appendChild(fila);

        });

    }


    // ==========================================
    // FILTRO
    // ==========================================

    filtroCategoria.addEventListener(
        "change",
        mostrarHistorial
    );


    // ==========================================
    // VOLVER AL INDEX
    // ==========================================

    btnVolver.addEventListener("click", function () {

        window.location.href = "./index.html";

    });


    // ==========================================
    // ESTADÍSTICA 1
    // TAREAS TOTALES VS COMPLETADAS
    // ==========================================

    btnGraficoTotal.addEventListener("click", function () {

        const tareasPendientesCantidad =
            listaTareasPendientes.length;


        const tareasCompletadas =
            historialTareas.length;


        const tareasTotales =
            tareasPendientesCantidad +
            tareasCompletadas;


        contenedorGrafico.innerHTML = `

            <div class="estadisticas__datos">

                <p>
                    Tareas totales:
                    <strong>${tareasTotales}</strong>
                </p>

                <p>
                    Tareas pendientes:
                    <strong>${tareasPendientesCantidad}</strong>
                </p>

                <p>
                    Tareas completadas:
                    <strong>${tareasCompletadas}</strong>
                </p>

            </div>

        `;


        console.log(
            "Tareas pendientes:",
            tareasPendientesCantidad
        );

        console.log(
            "Tareas completadas:",
            tareasCompletadas
        );

        console.log(
            "Tareas totales:",
            tareasTotales
        );

    });


    // ==========================================
    // FUNCIÓN
    // CALCULAR DURACIÓN DE UNA TAREA
    // ==========================================

    function obtenerDuracionMinutos(tarea) {

        // Comprobar que existan las fechas y horas

        if (
            !tarea.fechaCreacion ||
            !tarea.horaCreacion ||
            !tarea.fechaFinalizacion ||
            !tarea.horaFinalizacion
        ) {
            return null;
        }


        const inicio = new Date(
            `${tarea.fechaCreacion}T${tarea.horaCreacion}:00`
        );


        const finalizacion = new Date(
            `${tarea.fechaFinalizacion}T${tarea.horaFinalizacion}:00`
        );


        const diferencia =
            finalizacion - inicio;


        // Convertir milisegundos a minutos

        const minutos =
            diferencia / 60000;


        if (!Number.isFinite(minutos) || minutos < 0) {
            return null;
        }


        return minutos;

    }


    // ==========================================
    // FUNCIÓN
    // FORMATEAR MINUTOS
    // ==========================================

    function formatearMinutos(minutos) {

        const minutosRedondeados =
            Math.round(minutos);


        const horas =
            Math.floor(minutosRedondeados / 60);


        const minutosRestantes =
            minutosRedondeados % 60;


        if (horas > 0) {

            return `${horas} h ${minutosRestantes} min`;

        }


        return `${minutosRedondeados} min`;

    }


    // ==========================================
    // ESTADÍSTICA 2
    // TIEMPO PROMEDIO POR CATEGORÍA
    // ==========================================

    btnGraficoTiempo.addEventListener("click", function () {

        // ==========================================
        // CREAR DATOS PARA CADA CATEGORÍA
        // ==========================================

        const datosTiempo = {};


        categorias.forEach(function (categoria) {

            datosTiempo[categoria] = {
                totalMinutos: 0,
                cantidad: 0
            };

        });


        // ==========================================
        // RECORRER TAREAS COMPLETADAS
        // ==========================================

        historialTareas.forEach(function (tarea) {

            if (!datosTiempo[tarea.categoria]) {
                return;
            }


            const minutos =
                obtenerDuracionMinutos(tarea);


            if (minutos === null) {
                return;
            }


            datosTiempo[tarea.categoria].totalMinutos +=
                minutos;


            datosTiempo[tarea.categoria].cantidad++;

        });


        // ==========================================
        // CREAR TABLA
        // ==========================================

        let contenidoTabla = `

            <h3 class="estadisticas__subtitulo">
                Tiempo promedio por categoría
            </h3>

            <table class="estadisticas__tabla">

                <thead>

                    <tr>

                        <th>
                            Categoría
                        </th>

                        <th>
                            Tiempo promedio
                        </th>

                        <th>
                            Tareas completadas
                        </th>

                    </tr>

                </thead>

                <tbody>
        `;


        // ==========================================
        // AGREGAR CATEGORÍAS
        // ==========================================

        categorias.forEach(function (categoria) {

            const datos =
                datosTiempo[categoria];


            let tiempoPromedio = "Sin datos";


            if (datos.cantidad > 0) {

                const promedio =
                    datos.totalMinutos /
                    datos.cantidad;


                tiempoPromedio =
                    formatearMinutos(promedio);

            }


            contenidoTabla += `

                <tr>

                    <td>
                        ${nombresCategorias[categoria]}
                    </td>

                    <td>
                        ${tiempoPromedio}
                    </td>

                    <td>
                        ${datos.cantidad}
                    </td>

                </tr>

            `;

        });


        contenidoTabla += `

                </tbody>

            </table>

        `;


        contenedorGrafico.innerHTML =
            contenidoTabla;


        console.log(
            "Datos de tiempo:",
            datosTiempo
        );

    });


    // ==========================================
    // ESTADÍSTICA 3
    // DIFICULTAD PROMEDIO POR CATEGORÍA
    // ==========================================

    btnGraficoDificultad.addEventListener(
        "click",
        function () {

            // ==========================================
            // CREAR DATOS PARA CADA CATEGORÍA
            // ==========================================

            const datosDificultad = {};


            categorias.forEach(function (categoria) {

                datosDificultad[categoria] = {
                    total: 0,
                    cantidad: 0
                };

            });


            // ==========================================
            // RECORRER TAREAS COMPLETADAS
            // ==========================================

            historialTareas.forEach(function (tarea) {

                if (!datosDificultad[tarea.categoria]) {
                    return;
                }


                const dificultad =
                    Number(tarea.dificultad);


                if (
                    !Number.isFinite(dificultad) ||
                    dificultad < 1 ||
                    dificultad > 5
                ) {
                    return;
                }


                datosDificultad[tarea.categoria].total +=
                    dificultad;


                datosDificultad[tarea.categoria].cantidad++;

            });


            // ==========================================
            // CREAR TABLA
            // ==========================================

            let contenidoTabla = `

                <h3 class="estadisticas__subtitulo">
                    Dificultad promedio por categoría
                </h3>

                <table class="estadisticas__tabla">

                    <thead>

                        <tr>

                            <th>
                                Categoría
                            </th>

                            <th>
                                Dificultad promedio
                            </th>

                            <th>
                                Tareas evaluadas
                            </th>

                        </tr>

                    </thead>

                    <tbody>
            `;


            // ==========================================
            // AGREGAR CATEGORÍAS
            // ==========================================

            categorias.forEach(function (categoria) {

                const datos =
                    datosDificultad[categoria];


                let dificultadPromedio =
                    "Sin datos";


                if (datos.cantidad > 0) {

                    const promedio =
                        datos.total /
                        datos.cantidad;


                    dificultadPromedio =
                        promedio.toFixed(2) + " / 5";

                }


                contenidoTabla += `

                    <tr>

                        <td>
                            ${nombresCategorias[categoria]}
                        </td>

                        <td>
                            ${dificultadPromedio}
                        </td>

                        <td>
                            ${datos.cantidad}
                        </td>

                    </tr>

                `;

            });


            contenidoTabla += `

                    </tbody>

                </table>

            `;


            contenedorGrafico.innerHTML =
                contenidoTabla;


            console.log(
                "Datos de dificultad:",
                datosDificultad
            );

        }
    );


    // ==========================================
    // CARGAR HISTORIAL AL ABRIR LA PÁGINA
    // ==========================================

    mostrarHistorial();

});