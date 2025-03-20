<?php
session_start();
require('../vendor/autoload.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $usuario = $_POST["username"] ?? null;
    $contra = $_POST["password"] ?? null;

    if (empty($usuario) || empty($contra)) {
        header("location:../html/login.html");
        exit;
    }

    try {
        $uri = 'mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/?retryWrites=true&w=majority&appName=alumnos';
        $client = new MongoDB\Client($uri);

        $db = $client->selectDatabase("Tienda");
        $collection = $db->selectCollection("login");

        $encontrado = $collection->findOne(["nombre" => $usuario]);

        if ($encontrado && $contra === $encontrado["password"]) {
            $_SESSION["usuario_id"] = (string) $encontrado["_id"];
            $_SESSION["usuario_nombre"] = $encontrado["nombre"];
            $_SESSION["rol"] = $encontrado["rol"] ?? 'usuario'; // Guardamos el rol en la sesión
            $_SESSION["apellidos"] = $encontrado["apellidos"] ?? '';
            $_SESSION["correo"] = $encontrado["correo"] ?? '';
            $_SESSION["carrito"] = $encontrado["productos"] ?? [];

            // Redirigir si es admin
            if ($_SESSION["rol"] === "admin") {
                header("location:admin.php");
                exit;
            }
        } else {
            header("location:../html/login.html");
            exit;
        }
    } catch (Exception $error) {
        http_response_code(500);
        echo "Error del servidor: " . $error->getMessage();
        exit;
    }
}



// Si el usuario no es admin, mostrar directamente la página de home
if (isset($_SESSION["usuario_id"])) {
    $usuario_nombre = $_SESSION["usuario_nombre"];
    ?>

    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
        <link rel="stylesheet" href="../css/styles.css">
    </head>
    <body>
    <nav class="navbar navbar-expand-md navbar-light bg-light shadow-sm">
        <div class="container-fluid">
            <section class="logo">
                <a class="navbar-brand" href="admin.php">
                    <img src="../src/adorable.png" alt="Logo del grupo" width="100" class="logito">
                </a>
            </section>

            <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto d-flex justify-content-end align-items-center w-100 gap-4">
                    <li class="nav-item">
                        <a href="#" class="bx bx-user icono-usuario" data-bs-toggle="modal" data-bs-target="#userModal"></a>
                        <span><?php echo htmlspecialchars($usuario_nombre); ?></span>
                    </li>

                    <li class="nav-item">
                        <a class="cerrar" href="cerrar.php">Cerrar sesión</a>
                    </li>
                    <li class="nav-item">
                        <a class="rellenar" href="rellenar.php">Rellenar</a>
                    </li>
                    <li class="nav-item">
                        <a class="historial" href="historial.php">Historial</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <section class="historialWrap">
        
    </section>

    <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-center w-100" id="userModalLabel">Información del Usuario</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Nombre:</strong> <?php echo htmlspecialchars($_SESSION["usuario_nombre"]); ?></p>
                    <p><strong>Rol:</strong> <?php echo htmlspecialchars($_SESSION["rol"] ?? ''); ?></p>
                    <p><strong>Correo:</strong> <?php echo htmlspecialchars($_SESSION["correo"] ?? ''); ?></p>
                    
                </div>
            </div>
        </div>
    </div>

    <!-- Modal HISTORIAL-->
    <div id="historialModal" class="modal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
        <div class="contentHistorial">
            <span class="btnclose">&times;</span>
            <h2>Detalles del Historial</h2>
            <div id="historialDetalles"></div>
        </div>
    </div>



    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="../js/app.js"></script>
    </body>
    </html>

    <?php
} else {
    header("location:../html/login.html");
    exit;
}
?>
