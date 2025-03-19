<?php
session_start();
require('../vendor/autoload.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $codigo = $_POST["codigo"] ?? null;
    $cantidad = $_POST["cantidad"] ?? null;

    if (empty($codigo) || empty($cantidad) || !is_numeric($cantidad) || $cantidad <= 0) {
        echo json_encode(['success' => false, 'mensaje' => 'Cantidad inválida']);
        exit;
    }

    try {
        $uri = 'mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos';
        $client = new MongoDB\Client($uri);
        $db = $client->selectDatabase("Tienda");
        $productosCollection = $db->selectCollection("productos");

        // Actualizar el stock del producto.
        
        $productosCollection->updateOne(
            ['codigo' => $codigo],
            ['$inc' => ['cantidad_stock' => (int)$cantidad]]
        );

        echo json_encode(['success' => true, 'mensaje' => 'Stock actualizado con éxito']);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'mensaje' => 'Error al actualizar stock: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'mensaje' => 'Método no permitido']);
}
?>

