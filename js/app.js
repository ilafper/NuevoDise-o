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
                                    <img src="../src/gatonaranja.jpg" alt="${producto.nombre}" class="img-fluid">
                                </div>
                                <div class="info">
                                    <h5>${producto.nombre}</h5>
                                    <p class="descripcion">${producto.descripcion}</p>
                                    <p class="precio">${producto.precio}€</p>
                                    <p class="stock">${producto.stok}</p>
                                </div>
                                <div class="button">
                                    <button class="añadir">AÑADIR CARRITO</button>
                                </div>
                            </section>
                        `;
                        productosWrap.append(productoHTML); // Agregar al contenedor

                        //console.log(producto);

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


                        const carritoHtml = `
                            <section class="item-carrito d-flex" data-codigo="${producto.codigo}">
                                <section class="rigth">
                                    <img src="../src/adorable.png" alt="${producto.nombre}" width="50">
                                </section>
                                <section class="left d-flex flex-column w-100">
                                    <section class="arriba">
                                        <p>${producto.nombre}</p>
                                        <p>${producto.precio}€</p>
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

    function calcularTotal() {
        let total = 0;
        $('.item-carrito').each(function () {
            let cantidad = parseInt($(this).find('.cantidad-input').val());
            let precio = parseFloat($(this).find('.arriba p:nth-child(2)').text().trim().replace('€', ''));
            total += cantidad * precio;
        });

        // Mostrar el total en el contenedor adecuado
        $('.total').text(total.toFixed(2) + '€');
    }

    $(document).ready(function () {
        $(document).on("click", ".añadir", function () {
            let card = $(this).closest(".targetaProducto");
            let productId = card.data("codigo");
            let nombre = card.find("h5").text();
            let precio = card.find(".precio").text().replace().trim();
            let imgSrc = card.find("img").attr("src");

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
                            <p class="precioUND">${precio}</p>  
                        </section>
                        <section class="abajo d-flex align-items-center gap-2">
                            <section class="canti d-flex align-items-center gap-2">
                                <input type="number" class="cantidad-input" value="1" min="1">
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
            url: '../php/cargarProductos.php', // Ruta al archivo PHP
            method: 'GET',
            dataType: 'json',

            success: function (data) {
                if (data.success) {
                    const ActuProductos = $('.restoProductos');
                    ActuProductos.empty(); // Limpiar el contenido previo

                    // Recorrer los productos y mostrarlos.
                    data.productos.forEach(function (producto) {
                        // Crear una fila con los campos correspondientes para cada producto
                        const productosRellenar = `
                            <tr classs="filaTabla" data-codigo="${producto.codigo}">
                                <td>${producto.codigo}</td>
                                <td>${producto.nombre}</td>
                                <td>${producto.stok}</td>
                                <td><input type="number" class="nueva-cantidad" min="0" value="0"></td>
                                <td><button class="btn actualizar">Actualizar</button></td>
                            </tr>
                        `;
                        ActuProductos.append(productosRellenar); // Agregar la fila al contenedor
                    });

                    // Manejar clic en el botón de actualización
                    $('.actualizar').on('click', function () {
                        const fila = $(this).closest('tr');
                        const codigo = fila.data('codigo');
                        const nuevaCantidad = fila.find('.nueva-cantidad').val();

                        if (nuevaCantidad > 0) {
                            // Enviar la actualización del stock al servidor
                            $.ajax({
                                url: '../php/actualizarStock.php',
                                method: 'POST',
                                data: {
                                    codigo: codigo,
                                    cantidad: nuevaCantidad
                                },
                                success: function (response) {
                                    //alert('okok');
                                    cargarProductos2(); // Recargar los productos después de la actualización
                                },
                                error: function (xhr, status, error) {
                                    console.error('Error al actualizar stock:', error);
                                    //alert('nonono');
                                }
                            });
                        } else {
                            alert('Por favor ingresa una cantidad válida.');
                        }
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
                        console.log(peticionHTML);
                        
                        
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




});
