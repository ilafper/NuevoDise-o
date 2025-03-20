<?php
session_start();
require('../vendor/autoload.php');

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        // Conexión con MongoDB Atlas
        $uri = 'mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos';
        $client = new MongoDB\Client($uri);

        // Seleccionar base de datos y colección
        $db = $client->selectDatabase("Tienda");
        $productosCollection = $db->selectCollection("productos");

        // Obtener el ID del usuario logueado (si lo necesitas)
        $usuarioId = $_SESSION["usuario_id"] ?? null;

        if (!$usuarioId) {
            echo json_encode(["success" => false, "error" => "Usuario no autenticado"]);
            exit;
        }

        // Obtener todos los productos (puedes agregar filtros si es necesario)
        $productos = $productosCollection->find();
 
        // Convertir el cursor a un array con los datos necesarios
        $productosArray = [];
        foreach ($productos as $producto) {
            $productosArray[] = [
                "codigo"=> $producto["codigo"],
                "nombre" => $producto["nombre"],
                "descripcion" => $producto["descripcion"],
                "precio" => intval($producto["precio"]),
                "stok" => intval($producto["cantidad_stock"]),
                "imagen" => $producto["imagen"],
            ];
        }

        // Retornar los productos en formato JSON
        echo json_encode([
            "success" => true,
            "productos" => $productosArray
        ]);
    } catch (Exception $error) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Error del servidor: " . $error->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Método no permitido"]);
}
?>
