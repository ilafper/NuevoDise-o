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
$precio = floatval($_POST["precio"] ?? null); // Usamos floatval() para asegurar que el precio sea decimal
$cantidad = intval($_POST["cantidad"] ?? 1);

if (!$codigo) {
    echo json_encode(["success" => false, "error" => "Falta el ID del producto"]);
    exit;
}

try {
    $client = new MongoDB\Client('mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos');
    $db = $client->selectDatabase("Tienda");
    $collection = $db->selectCollection("login");

    // Buscar el usuario correctamente
    $usuario = $collection->findOne(["_id" => new MongoDB\BSON\ObjectId($usuario_id)]);

    if (!$usuario) {
        echo json_encode(["success" => false, "error" => "Usuario no encontrado"]);
        exit;
    }

    // Verificar si ya tiene productos en el carrito
    $productos = $usuario["productos"] ?? [];

    $encontrado = false;
    foreach ($productos as &$producto) {
        if ($producto["codigo"] == $codigo) {
            $producto["precio"] = intval($precio);
            $producto["cantidad"] = intval($cantidad);
            $encontrado = true;
            break;
        }
    }
    

    if (!$encontrado) {
        // Si el producto no estaba en el carrito, lo añadimos
        $productos[] = [
            "codigo" => $codigo,
            "nombre" => $nombre,
            "precio" => $precio,
            "cantidad" => $cantidad,
        ];
    }

    // Actualizar la base de datos correctamente
    $collection->updateOne(
        ["_id" => new MongoDB\BSON\ObjectId($usuario_id)],
        ['$set' => ["productos" => $productos]]
    );

    echo json_encode(["success" => true, "productos" => $productos]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
