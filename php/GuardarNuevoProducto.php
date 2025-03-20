<?php
session_start();
require('../vendor/autoload.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nombre = $_POST["nombre"] ?? null;
    $descripcion = $_POST["descripcion"] ?? null;
    $precio = $_POST["precio"] ?? null;
    $cantidad = $_POST["stock"] ?? null;
    $imagen = $_POST["imagen"] ?? null; 

    // Conectar a MongoDB
    try {
        $uri = 'mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos';
        $client = new MongoDB\Client($uri);
        $db = $client->selectDatabase("Tienda");
        $productosCollection = $db->selectCollection("productos");

       //parte del codifo de producto dinamico.
        $totalProductos = $productosCollection->countDocuments();
        $codigo = "producto" . ($totalProductos + 1);

        // Crear un nuevo producto
        $nuevoProducto = [
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'precio' => (int)$precio,
            'cantidad_stock' => (int)$cantidad,
            'codigo' => $codigo,
            'imagen' => $imagen
        ];

        // Insertar el producto en la colección
        $insertResult = $productosCollection->insertOne($nuevoProducto);

        if ($insertResult->getInsertedCount() > 0) {
            echo json_encode(['success' => true, 'mensaje' => 'Producto creado con éxito']);
        } else {
            echo json_encode(['success' => false, 'mensaje' => 'No se pudo crear el producto']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'mensaje' => 'Error al crear el producto: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'mensaje' => 'Método no permitido']);
}
?>
