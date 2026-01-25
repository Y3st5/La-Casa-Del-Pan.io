<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $email = $_POST['email'];
    $telefono = $_POST['telefono'];
    $mensaje = $_POST['mensaje'];

    $para = "juandiex2005@gmail.com";
    $asunto = "Nuevo mensaje de la panadería";
    $cuerpo = "Nombre: $nombre\nEmail: $email\nTeléfono: $telefono\nMensaje:\n$mensaje";
    $cabeceras = "From: $email";

    if (mail($para, $asunto, $cuerpo, $cabeceras)) {
        echo "Mensaje enviado con éxito.";
    } else {
        echo "Error al enviar el mensaje.";
    }
} else {
    echo "Método no permitido.";
}
?>