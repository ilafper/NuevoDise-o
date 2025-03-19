<?php
session_start();
require('../vendor/autoload.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $index = $_POST["codigo"];
    $estado = $_POST["estado"];

    if ($index === null || empty($estado)) {
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

        // Actualizar el estado de la petición a 'aceptada' en la lista de peticiones
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

        // Agregar la petición aceptada al historial de peticiones del admin
        $peticion["estado"] = "aceptada";  // Cambiar el estado
        $usuariosCollection->updateOne(
            ["_id" => $admin["_id"]],
            ['$push' => ["historialPeticiones" => $peticion]]
        );

        echo json_encode(["success" => true, "mensaje" => "Petición aceptada y productos eliminados del carrito"]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "mensaje" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
}
?>