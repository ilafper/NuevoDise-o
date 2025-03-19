<?php
session_start();
session_unset(); // Elimina todas las variables de la sesión
session_destroy(); // Destruye la sesión
header("location:../html/login.html");
exit;
