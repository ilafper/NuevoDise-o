<?php
require '../vendor/autoload.php';

header('Content-Type: application/json');

$uri = 'mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos';
$client = new MongoDB\Client($uri);

$db = $client->selectDatabase("Tienda");
$collection = $db->selectCollection("login");

// Obtener los datos del formulario
$nombre = $_POST['nombre'] ?? '';
$apellido = $_POST['apellido'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($nombre) || empty($password)) {
    echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
    exit;
}
// Verificar si el usuario ya existe
$usuarioExistente = $collection->findOne(["nombre" => $nombre]);
if ($usuarioExistente) {
    echo json_encode(["success" => false, "error" => "El usuario ya existe"]);
    exit;
}

// Crear nuevo usuario con array vacío en "productos"
$nuevoUsuario = [
    "nombre" => $nombre,
    "password" => $password,
    "rol" => "user",
    "productos" => []   // Array vacío para almacenar productos en el carrito
];

$insertResult = $collection->insertOne($nuevoUsuario);

if ($insertResult->getInsertedCount() > 0) {
    header("location:../html/login.html");
} else {
    header("location:../html/registro.html");
}
?>
