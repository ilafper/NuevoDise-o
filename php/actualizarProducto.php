<?php
session_start();
require('../vendor/autoload.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $codigo = $_POST["codigo"] ?? null;
    $cantidad = $_POST["stock"] ?? null;
    $nombre = $_POST["nombre"] ?? null;
    $descripcion = $_POST["descripcion"] ?? null;
    $precio = $_POST["precio"] ?? null;
    $imagen = $_POST["imagen"] ?? null;  // Imagen añadida

    // Validación de datos
    if (empty($codigo)) {
        echo json_encode(['success' => false, 'mensaje' => 'Código de producto requerido']);
        exit;
    }

    $actualizacion = [];
    //validar el numero para que no esta vacio, sea un numero y sea mayor que cero
    if (!empty($cantidad) && is_numeric($cantidad) && $cantidad >0) {
        $actualizacion['cantidad_stock'] = (int)$cantidad;
    }

    if (!empty($nombre)) {
        $actualizacion['nombre'] = $nombre;
    }

    if (!empty($descripcion)) {
        $actualizacion['descripcion'] = $descripcion;
    }

    if (!empty($precio) && is_numeric($precio) && $precio >= 0) {
        $actualizacion['precio'] = (int)$precio;
    }

    if (!empty($imagen)) {
        $actualizacion['imagen'] = $imagen;
    }

    if (empty($actualizacion)) {
        echo json_encode(['success' => false, 'mensaje' => 'No se proporcionaron datos válidos para actualizar']);
        exit;
    }

    try {
        $uri = 'mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos';
        $client = new MongoDB\Client($uri);
        $db = $client->selectDatabase("Tienda");
        $productosCollection = $db->selectCollection("productos");

        // Actualizar el producto con los nuevos valores.
        $updateResult = $productosCollection->updateOne(
            ['codigo' => $codigo],
            ['$set' => $actualizacion]
        );

        if ($updateResult->getModifiedCount() > 0) {
            echo json_encode(['success' => true, 'mensaje' => 'Producto actualizado con éxito']);
        } else {
            echo json_encode(['success' => false, 'mensaje' => 'No se encontró el producto o no hubo cambios']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'mensaje' => 'Error al actualizar el producto: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'mensaje' => 'Método no permitido']);
}
?>
