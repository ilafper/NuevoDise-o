$(document).ready(function () {
    // Función para cargar los productos
    function cargarProductos() {
        $.ajax({
            url: '../php/cargarProductos.php', // Ruta al archivo PHP
            method: 'GET',
            dataType: 'json', // Esperamos respuesta en formato JSON

            success: function (data) {
                if (data.success) {
                    const productosWrap = $('.ProductosWrap');
                    productosWrap.empty(); // Limpiar el contenido previo

                    // Recorrer los productos y mostrarlos.
                    data.productos.forEach(function (producto) {
                        // console.log(producto);

                        const productoHTML = `
                            <section class="targetaProducto" data-codigo="${producto.codigo}">
                                <div class="targ-img">
                                    <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid">
                                </div>
                                <div class="info">
                                    <h5>${producto.nombre}</h5>
                                    <p class="descripcion">${producto.descripcion}</p>
                                    <p class="precio">${producto.precio}€</p>
                                    <p class="stock"><strong>Stock:</strong>${producto.stok}</p>
                                </div>
                                <div class="button">
                                    <button class="añadir">AÑADIR CARRITO</button>
                                </div>
                            </section>
                        `;
                        productosWrap.append(productoHTML); // Agregar al contenedor

                        console.log(producto);

                    });

                } else {
                    alert('Error al cargar los productos: ' + data.error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error en la solicitud AJAX:', error);

            }
        });
    }

    cargarProductos();
    function calcularTotal() {
        let total = 0;
        $('.item-carrito').each(function () {
            let cantidad = $(this).find('.cantidad-input').val();
            let precio = $(this).find('.arriba p:nth-child(2)').text().trim().replace('€', '');
            total += cantidad * precio;
        });

        // Mostrar el total en el contenedor adecuado
        $('.total').text(total + '€');
    }
    
    function cargarCarrito() {
        $.ajax({
            url: '../php/cargarCarrito.php', // Ruta al archivo PHP para cargar el carrito
            method: 'GET',
            dataType: 'json', // Esperamos respuesta en formato JSON
            success: function (data) {
                if (data.success) {
                    const listaCarrito = $('.listaCarrito'); // Contenedor donde se mostrarán los productos del carrito
                    listaCarrito.empty(); // Limpiar el contenido previo del carrito

                    // Recorrer los productos del carrito y mostrarlos
                    data.productos.forEach(function (producto) {
                        let imgSrc = producto.imagen;
                        console.log(imgSrc);

                        const carritoHtml = `
                            <section class="item-carrito d-flex" data-codigo="${producto.codigo}">
                                <section class="rigth">
                                    <img src="${imgSrc}" alt="${producto.nombre}" width="50">
                                </section>
                                <section class="left d-flex flex-column w-100">
                                    <section class="arriba">
                                        <p>${producto.nombre}</p>
                                        <p class="precioUND">${producto.precio}€</p>
                                    </section>
                                    <section class="abajo d-flex align-items-center gap-2">
                                        <section class="canti d-flex align-items-center gap-2">
                                            <input type="number" class="cantidad-input" value="${producto.cantidad}" min="1">
                                        </section>
                                        <section class="trash">
                                            <i class='bx bx-trash'></i>
                                        </section>
                                    </section>
                                </section>
                            </section>
                        `;
                        listaCarrito.append(carritoHtml);
                        calcularTotal();
                    });

                } else {
                    alert('Error al cargar el carrito: ' + data.error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error en la solicitud AJAX:', error);
            }
        });
    }

    cargarCarrito();

    

    $(document).ready(function () {
        $(document).on("click", ".añadir", function () {
            let card = $(this).closest(".targetaProducto");
            let productId = card.data("codigo");
            let nombre = card.find("h5").text();
            let precio = card.find(".precio").text().replace('€', '').trim();
            let imgSrc = card.find("img").attr("src");
            let stockMax = parseInt(card.find(".stock").text().replace("Stock:", "").trim());
            // Verificar si ya está en el carrito
            let itemExistente = $(".listaCarrito").find(`[data-codigo="${productId}"]`);

            // Si el producto ya está en el carrito, no hacer nada (evitar sumar más cantidad)
            if (itemExistente.length > 0) {
                return;
            }

            // Si no está en el carrito, lo agregamos
            let itemCarrito = `
                <section class="item-carrito d-flex" data-codigo="${productId}">
                    <section class="rigth">
                        <img src="${imgSrc}" alt="${nombre}" width="50">
                    </section>
                    <section class="left d-flex flex-column w-100">
                        <section class="arriba">
                            <p>${nombre}</p>
                            <p class="precioUND">${precio}€</p>  
                        </section>
                        <section class="abajo d-flex align-items-center gap-2">
                            <section class="canti d-flex align-items-center gap-2">
                                <input type="number" class="cantidad-input" value="1" min="1" max="${stockMax}">
                            </section>
                            <section class="trash">
                                <i class='bx bx-trash'></i>
                            </section>
                        </section>
                    </section>
                </section>
            `;

            $(".listaCarrito").append(itemCarrito);

            // Enviar la solicitud para agregar el producto al carrito en la base de datos
            $.ajax({
                url: '../php/actualizarCarrito.php',
                method: 'POST',
                data: {
                    codigo: productId,
                    nombre: nombre,
                    precio: precio,
                    cantidad: 1,
                    imagen: imgSrc

                },
                success: function (response) {
                    console.log(response);
                    calcularTotal()
                },
                error: function (xhr, status, error) {
                    console.error("Error al agregar el producto:", error);
                }
            });
        });

        $(document).on("input", ".cantidad-input", function () {
            let item = $(this).closest(".item-carrito");
            let stockMaximo = parseInt(item.find(".cantidad-input").attr("max"));
            let nuevaCantidad = parseInt($(this).val());
        
            // Validar que la cantidad no supere el stock disponible
            if (nuevaCantidad > stockMaximo) {
                $(this).val(stockMaximo);
                nuevaCantidad = stockMaximo;
            } else if (nuevaCantidad < 1 || isNaN(nuevaCantidad)) {
                $(this).val(1);
                nuevaCantidad = 1;
            }
        
            let productId = item.data("codigo");
            let precioUnitario = parseInt(item.find(".precioUND").text().trim().replace('€', '')); // Obtener precio
        
            // Enviar la solicitud con la cantidad y el precio unitario
            $.ajax({
                url: '../php/actualizarCarrito.php',
                method: 'POST',
                data: {
                    codigo: productId,
                    cantidad: nuevaCantidad,
                    precio: precioUnitario
                },
                success: function (response) {
                    calcularTotal();
                },
                error: function (xhr, status, error) {
                    console.error("Error al actualizar la cantidad en el carrito:", error);
                }
            });
        });
        




        $(document).on("click", ".bx-trash", function () {
            let item = $(this).closest(".item-carrito");
            let productId = item.data("codigo");

            $.ajax({
                url: '../php/eliminarProduct.php',
                method: 'POST',
                data: { codigo: productId },
                success: function (response) {
                    console.log(response);
                    item.remove();
                    calcularTotal();
                }
            });
        });

    });
    //parte deprocesar los pedidos cunado en el carrrito le das realizar pedido
    $(document).ready(function () {
        $(".realizarPedido").on("click", function () {
            let carrito = [];

            $(".listaCarrito .item-carrito").each(function () {
                let codigo = $(this).data("codigo");
                let cantidad = parseInt($(this).find(".cantidad-input").val().trim());

                carrito.push({ codigo, cantidad });
                //console.log(carrito);
            });

            if (carrito.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }

            // Enviar carrito al servidor
            $.ajax({
                url: "../php/procesarPedido.php",
                type: "POST",
                data: { carrito: carrito },
                success: function (respuesta) {
                    location.reload(); // Recargar la página
                },
                error: function () {
                    //alert("Hubo un error al procesar el pedido.");
                }
            });
        });
    });

    //cargar productos para rellernar
    function cargarProductos2() {
        $.ajax({
            url: '../php/cargarProductos.php',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    const ActuProductos = $('.restoProductos');
                    ActuProductos.empty(); // Limpiar contenido previo
    
                    data.productos.forEach(function (producto) {
                        // Crear la tarjeta del producto
                        const targetaProducto = `
                            <section class="targetaProducto" data-codigo="${producto.codigo}">
                                <div class="targ-img">
                                    <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto img-fluid">
                                </div>
                                <div class="info">
                                    <h5 class="nombre">${producto.nombre}</h5>
                                    <p class="descripcion">${producto.descripcion}</p>
                                    <p class="precio">${producto.precio}€</p>
                                    <p class="stock"><strong>Stock:</strong> ${producto.stok}</p>
                                </div>
                                <div class="button">
                                    <button class="editar">Editar</button>
                                </div>
                            </section>
                        `;
                        ActuProductos.append(targetaProducto);
                    });
    
                    // Evento para editar
                    $('.editar').on('click', function () {
                        const targetaRellenar = $(this).closest('.targetaProducto');
                        const codigo = targetaRellenar.data('codigo');
                        const nombreActual = targetaRellenar.find('h5').text();
                        const descripcionActual = targetaRellenar.find('.descripcion').text();
                        const precioActual = targetaRellenar.find('.precio').text().replace('€', '');
                        const stockActual = targetaRellenar.find('.stock').text().replace('Stock:', '').trim();
                        const imagenActual = targetaRellenar.find('.imagen-producto').attr('src').split('/').pop(); // Obtener solo el nombre de la imagen
    
                        // Lista de imágenes disponibles que tengo en mi carpeta de src.
                        const imagenesDisponibles = [
                            "gato1.jpg", "gato2.jpg", "gato3.jpg", "gato4.jpg",
                            "gato4.png", "gato6.png", "gato7.jpg", "gatonaranja.jpg"
                        ];
    
                        // Crear select de imágenes
                        let opcionesImagenes = imagenesDisponibles.map(img =>
                            `<option value="../src/${img}" ${img === imagenActual ? 'selected' : ''}>${img}</option>`
                        ).join('');
    
                        // Formulario de edición
                        //me cago en el text area.
                        const formularioEdicion = `
                            <div class="formulario-edicion">
                                <div class="campo-edicion">
                                    <label for="nombre">Nombre del producto:</label>
                                    <input type="text" class="nombre" value="${nombreActual}">
                                </div>
                                <div class="campo-edicion">
                                    <label for="descripcion">Descripción del producto:</label>
                                    <input type="text" class="descripcion" value="${descripcionActual}">
                                </div>
                                <div class="campo-edicion">
                                    <label for="precio">Precio del producto:</label>
                                    <input type="number" class="precio2" value="${precioActual}">
                                </div>
                                <div class="campo-edicion">
                                    <label for="stock">Cantidad en stock:</label>
                                    <input type="number" class="stock" value="${stockActual}">
                                </div>
                                <div class="campo-edicion">
                                    <label for="imagen">Seleccionar imagen:</label>
                                    <select class="imagen">${opcionesImagenes}</select>
                                </div>
                                <div class="bototo">
                                    <button class="guardar">Guardar</button>
                                    <button class="cancelar">Cancelar</button>
                                </div>
                            </div>
                        `;
    
                        targetaRellenar.html(formularioEdicion);
    
                        // Evento para guardar cambios
                        $('.guardar').on('click', function () {
                            const nuevaImagen = targetaRellenar.find('.imagen').val(); // Se guarda con ../src/
                            const nuevoNombre = targetaRellenar.find('.nombre').val();
                            const nuevaDescripcion = targetaRellenar.find('.descripcion').val();
                            const nuevoPrecio = targetaRellenar.find('.precio2').val();
                            const nuevoStock = targetaRellenar.find('.stock').val();
    
                            $.ajax({
                                url: '../php/actualizarProducto.php',
                                method: 'POST',
                                data: {
                                    codigo: codigo,
                                    nombre: nuevoNombre,
                                    descripcion: nuevaDescripcion,
                                    precio: nuevoPrecio,
                                    stock: nuevoStock,
                                    imagen: nuevaImagen
                                },
                                success: function (response) {
                                    cargarProductos2(); // Recargar productos
                                },
                                error: function (xhr, status, error) {
                                    console.error('Error al actualizar producto:', error);
                                }
                            });
                        });
    
                        // Evento para cancelar
                        $('.cancelar').on('click', function () {
                            cargarProductos2(); // Restaurar la tarjeta original sin cambios
                        });
                    });
                } else {
                    alert('Error al cargar los productos: ' + data.error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error en la solicitud AJAX:', error);
            }
        });
    }
    
    cargarProductos2();
    





    //cargar PETICIONES DE COMPRA

    function cargarPeticiones() {
        $.ajax({
            url: '../php/cargarPeticiones.php',
            method: 'GET',
            dataType: 'json',

            success: function (data) {
                if (data.success) {
                    const peticiones = $('.peticiones');
                    peticiones.empty(); // Limpiar el contenido previo

                    // Recorrer las peticiones y mostrarlas.
                    data.peticiones.forEach(function (peticion) {
                        let productosHTML1 = "";
                        let productosHTML2 = "";

                        // Recorrer los productos dentro del carrito
                        peticion.carrito.forEach(function (producto) {
                            productosHTML1 += `
                                <p class="codigo">${producto.codigo}</p>
                            `;
                            productosHTML2 += `
                                <p class="cantidadPeti">${producto.cantidad}</p>
                            `;
                        });

                        // Crear la fila con los datos de la petición
                        const peticionHTML = `
                            <tr data-nombre="${peticion.nombre_usuario}">
                                <td>${peticion.nombre_usuario}</td>
                                <td>${productosHTML1}</td>
                                <td>${productosHTML2}</td>
                                <td>
                                    <button class="btn btn-success aceptarPeti" data-id="${peticion.id}">Aceptar</button>
                                    <button class="btn btn-danger rechazarPeti" data-id="${peticion.id}">Rechazar</button>
                                </td>
                            </tr>
                        `;

                        peticiones.append(peticionHTML);
                        //console.log(peticionHTML);


                    });


                    // Manejar clic en el botón de actualización
                    $('.aceptarPeti').on('click', function () {
                        let id = $(this).data('id');

                        $.ajax({
                            url: '../php/aceptarPeti.php',
                            method: 'POST',
                            data: {
                                codigo: id, estado: "aceptada"
                            },
                            success: function (response) {
                                //alert('okok');
                                cargarPeticiones(); // Recargar los productos después de la actualización
                            },
                            error: function (xhr, status, error) {
                                console.error('Error al actualizar stock:', error);
                                //alert('nonono');
                            }
                        });
                    });


                    $('.rechazarPeti').on('click', function () {
                        let id = $(this).data('id');
                        let productosPeti = []; // Para almacenar las cantidades de los productos

                        // Encontrar todos los productos dentro de la petición
                        $(this).closest('tr').find('.cantidadPeti').each(function (index) {

                            let cantidad = $(this).text().replace("Cantidad: ", "");
                            let codigo = $(this).closest('tr').find('.codigo').eq(index).text();
                            productosPeti.push({ codigo: codigo, cantidad: cantidad });


                        });
                        console.log(productosPeti);

                        $.ajax({
                            url: '../php/rechazarPeti.php',
                            method: 'POST',
                            data: {
                                codigo: id,
                                estado: "rechazada",
                                productos: productosPeti // Pasar el array de productos con sus cantidades
                            },
                            success: function (response) {
                                alert('yesyes');
                                cargarPeticiones(); // Recargar las peticiones después de la actualización
                            },
                            error: function (xhr, status, error) {
                                console.error('Error al actualizar stock:', error);
                                alert('nonon');
                            }
                        });
                    });

                } else {
                    alert('Error al cargar las peticiones: ' + data.error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error en la solicitud AJAX:', error);
            }
        });
    }

    cargarPeticiones();

    function cargarHistorial() {
        $.ajax({
            url: '../php/cargarHistorial.php',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    const historial = $('.historialWrap'); // Contenedor donde se insertará el historial
                    historial.empty(); // Limpiar el contenido previo

                    data.historialPeticiones.forEach(function (cosa) {
                        // Crear una clase que se asignará según el estado
                        let estadoColorClass = '';
                        if (cosa.estado === 'aceptada') {
                            estadoColorClass = 'colorAceptada';
                        } else if (cosa.estado === 'rechazada') {
                            estadoColorClass = 'colorRechazada';
                        }

                        // Crear la fila con los datos de la petición
                        const historialHTML = `
                            <section class="targetHistorial" data-user='${cosa.nombre_usuario}' data-estado='${cosa.estado}' data-carrito='${JSON.stringify(cosa.carrito)}'>
                                <p><strong>Nombre Solicitante:</strong> ${cosa.nombre_usuario}</p>
                                <p><strong>Estado:</strong> <span class="${estadoColorClass}">${cosa.estado}</span></p>
                            </section>
                        `;

                        historial.append(historialHTML);
                    });


                    $(".targetHistorial").on("click", function () {
                        const usuario = $(this).data("user");
                        const estado = $(this).data("estado");
                        const carrito = $(this).data("carrito");

                        // Construir la lista de productos en el carrito
                        let productosHTML = '<ul>';
                        carrito.forEach(producto => {
                            productosHTML += `<li><strong>Código:</strong> ${producto.codigo}, <strong>Cantidad:</strong> ${producto.cantidad}</li>`;
                        });
                        productosHTML += '</ul>';

                        // Insertar los datos en el modal
                        $("#historialDetalles").html(`
                            <p><strong>Nombre Solicitante:</strong> ${usuario}</p>
                            <p><strong>Estado:</strong> ${estado}</p>
                            <p><strong>Productos en el carrito:</strong></p>
                            <section class="listaHistorialProductos">
                                ${productosHTML}
                            </section>
                            
                        `);

                        $("#historialModal").css("display", "block");
                    });
                } else {
                    alert('Error al cargar el historial de peticiones: ' + data.error);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error en la solicitud AJAX:', error);
            }
        });
    }
    
    cargarHistorial();

    // Cerrar modal al hacer clic en la "X"
    $(".btnclose").on("click", function () {
        $("#historialModal").css("display", "none");
    });
    $(document).ready(function () {
        $('#formNuevoProducto').on('submit', function (event) {
            event.preventDefault();
    
            // Recoger los datos del formulario
            const nuevaImagen = $('#imagen').val();
            const nuevoNombre = $('#nombre').val();
            const nuevaDescripcion = $('#descripcion').val();
            const nuevoPrecio = $('#precio').val();  // Precio
            const nuevoStock = $('#stock').val();  // Stock
    
            // Validación básica de los campos
            if (nuevoNombre === '' || nuevaDescripcion === '' || nuevoPrecio === '' || nuevoStock === '') {
                alert('Todos los campos son obligatorios.');
                return;
            }
    
            // Hacer la solicitud AJAX para crear el nuevo producto
            $.ajax({
                url: 'GuardarNuevoProducto.php',
                method: 'POST',
                data: {
                    nombre: nuevoNombre,
                    descripcion: nuevaDescripcion,
                    precio: nuevoPrecio,
                    stock: nuevoStock,
                    imagen: nuevaImagen
                },
                success: function (response) {
                    // Aquí se maneja la respuesta del servidor
                    var data = JSON.parse(response);  // Parsear la respuesta JSON
                    if (data.success) {
                        alert('Producto creado con éxito');
                        // Limpiar el formulario después de la creación exitosa
                        $('#formNuevoProducto')[0].reset();
                    } else {
                        alert('Error: ' + data.mensaje);
                    }
                },
                error: function () {
                    alert('Hubo un error en la solicitud.');
                }
            });
        });
    });


});
