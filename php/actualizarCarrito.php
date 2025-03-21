<?php
session_start();
require('../vendor/autoload.php');

if (!isset($_SESSION["usuario_id"])) {
    echo json_encode(["success" => false, "error" => "Usuario no autenticado."]);
    exit;
}

$usuario_id = $_SESSION["usuario_id"];
$codigo = $_POST["codigo"] ?? null;
$nombre = $_POST["nombre"] ?? null;
$precio = $_POST["precio"];
$cantidad = intval($_POST["cantidad"] ?? 1);  // Convertir cantidad a entero
$imagen = $_POST["imagen"] ?? null;
print($precio);
if (!$codigo) {
    echo json_encode(["success" => false, "error" => "Falta el ID del producto"]);
    exit;
}

try {
    $client = new MongoDB\Client('mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos');
    $db = $client->selectDatabase("Tienda");
    $collection = $db->selectCollection("login");

    $usuario = $collection->findOne(["_id" => new MongoDB\BSON\ObjectId($usuario_id)]);

    if (!$usuario) {
        echo json_encode(["success" => false, "error" => "Usuario no encontrado"]);
        exit;
    }

    $productos = $usuario["productos"] ?? [];
    $encontrado = false;
    foreach ($productos as &$producto) {
        if ($producto["codigo"] == $codigo) {
            $producto["precio"] = $precio;  // Guardar como número flotante
            $producto["cantidad"] = $cantidad;  // Guardar como entero
            $encontrado = true;
            break;
        }
    }

    if (!$encontrado) {
        $productos[] = [
            "codigo" => $codigo,
            "nombre" => $nombre,
            "precio" => $precio,  // Guardar como número flotante
            "cantidad" => $cantidad,  // Guardar como entero
            "imagen" => $imagen
        ];
    }

    $collection->updateOne(
        ["_id" => new MongoDB\BSON\ObjectId($usuario_id)],
        ['$set' => ["productos" => $productos]]
    );

    echo json_encode(["success" => true, "productos" => $productos]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

?>