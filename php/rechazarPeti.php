<?php
session_start();
require('../vendor/autoload.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $index = $_POST["codigo"];
    $estado = $_POST["estado"];
    $productos = $_POST["productos"];  // Ahora recibimos un array de productos con sus cantidades

    if ($index === null || empty($estado) || empty($productos)) {
        echo json_encode(["success" => false, "mensaje" => "Datos inválidos"]);
        exit;
    }

    try {
        $uri = 'mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos';
        $client = new MongoDB\Client($uri);
        $db = $client->selectDatabase("Tienda");
        $usuariosCollection = $db->selectCollection("login");
        $productosCollection = $db->selectCollection("productos");

        // Buscar el usuario admin
        $admin = $usuariosCollection->findOne(["rol" => "admin"]);

        if (!$admin) {
            echo json_encode(["success" => false, "mensaje" => "Admin no encontrado"]);
            exit;
        }

        // Buscar la petición del admin por id
        $peticion = null;
        foreach ($admin["peticiones"] as $p) {
            if (isset($p["id"]) && $p["id"] == $index) {
                $peticion = $p;
                break;
            }
        }

        if (!$peticion) {
            echo json_encode(["success" => false, "mensaje" => "Petición no encontrada"]);
            exit;
        }

        // Obtener el usuario que realizó la petición
        $usuario = $usuariosCollection->findOne(["nombre" => $peticion["nombre_usuario"]]);

        if (!$usuario) {
            echo json_encode(["success" => false, "mensaje" => "Usuario no encontrado"]);
            exit;
        }

        // Actualizar el estado de la petición a 'rechazada' o 'aceptada' en la lista de peticiones
        $usuariosCollection->updateOne(
            ["_id" => $admin["_id"]],
            ['$set' => [
                "peticiones.$[elem].estado" => $estado
            ]],
            ['arrayFilters' => [['elem.id' => $index]]]
        );

        // Remover la petición del array de peticiones del admin
        $usuariosCollection->updateOne(
            ["_id" => $admin["_id"]],
            ['$pull' => ["peticiones" => ["id" => $index]]]
        );

        // Agregar la petición al historial de peticiones del admin
        $peticion["estado"] = $estado;  // Cambiar el estado
        $usuariosCollection->updateOne(
            ["_id" => $admin["_id"]],
            ['$push' => ["historialPeticiones" => $peticion]]
        );

        // Reponer el stock en la colección de productos
        foreach ($productos as $producto) {
            $codigoProducto = $producto["codigo"];
            $cantidadProducto = (int)$producto["cantidad"];

            // Buscar el producto en la colección
            $productoDb = $productosCollection->findOne(["codigo" => $codigoProducto]);

            if ($productoDb) {
                // Aumentar la cantidad en el inventario
                $nuevaCantidad = $productoDb["cantidad_stock"] + $cantidadProducto;
                $productosCollection->updateOne(
                    ["codigo" => $codigoProducto],
                    ['$set' => ["cantidad_stock" => $nuevaCantidad]]
                );
            } else {
                echo json_encode(["success" => false, "mensaje" => "Producto no encontrado: " . $codigoProducto]);
                exit;
            }
        }

        echo json_encode(["success" => true, "mensaje" => "Petición procesada y stock actualizado"]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "mensaje" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
}
?>
