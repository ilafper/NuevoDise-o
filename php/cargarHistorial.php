<?php
session_start();
require('../vendor/autoload.php');

if (!isset($_SESSION["usuario_id"])) {
    echo json_encode(["success" => false, "error" => "Usuario no autenticado."]);
    exit;
}

$usuario_id = $_SESSION["usuario_id"];

try {
    $client = new MongoDB\Client('mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos');
    $db = $client->selectDatabase("Tienda");
    $collection = $db->selectCollection("login");

    // Obtener los productos del carrito del usuario
    $usuario = $collection->findOne(["_id" => new MongoDB\BSON\ObjectId($usuario_id)]);

    if ($usuario && isset($usuario["historialPeticiones"])) {
        echo json_encode(["success" => true, "historialPeticiones" => $usuario["historialPeticiones"]]);
    } else {
        echo json_encode(["success" => true, "historialPeticiones" => []]); // Devuelve un array vacío si no hay productos
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>