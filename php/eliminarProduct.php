<?php
// Iniciar la sesión si aún no está iniciada
session_start();
require('../vendor/autoload.php'); // Asegúrate de tener el autoloader de MongoDB

// Conectar a MongoDB Atlas
$client = new MongoDB\Client('mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos');

// Seleccionar la base de datos y colección
$db = $client->selectDatabase("Tienda");
$collection = $db->selectCollection("login"); // Si 'login' es la colección donde están los usuarios

// Verificar que el producto ID esté disponible
if (isset($_POST['codigo'])) {
    $productId = $_POST['codigo'];

    // Verificar que el usuario esté autenticado
    if (isset($_SESSION['usuario_id'])) {
        $userId = $_SESSION['usuario_id']; // Obtener el ID del usuario desde la sesión

        // Eliminar el producto del carrito del usuario en la base de datos
        $result = $collection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($userId)], // Identificador único del usuario
            ['$pull' => ['productos' => ['codigo' => $productId]]] // Eliminar producto con el código dado del array 'carrito'
        );

        // Verificar si se realizó alguna modificación
        if ($result->getModifiedCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Producto eliminado del carrito.']);
        } else {
            echo json_encode(['success' => false, 'error' => 'No se pudo eliminar el producto del carrito.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró el ID del usuario en la sesión.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No se proporcionó el código del producto.']);
}
?>
