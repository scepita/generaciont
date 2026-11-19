# Especificación de CineRuta

## Problema
Elegir una película o serie puede llevar demasiado tiempo. CineRuta propone mostrar un catálogo fácil de explorar y ordenar sugerencias según los gustos de cada persona.

## Funciones implementadas
1. Crear usuario con nombre, email, contraseña y fecha de nacimiento.
2. Ingresar con credenciales y sesión firmada de 12 horas.
3. Explorar y buscar títulos ficticios (películas y series).
4. Guardar preferencias por género (hasta 8).
5. Registrar contenido visto y calificarlo entre 1 y 5 estrellas.
6. Recomendar por géneros preferidos, géneros de títulos calificados con 4 o 5, y popularidad.

## Reglas
- El email de registro no se repite.
- Un usuario no puede modificar el perfil de otro.
- Solo se muestran títulos aptos para la edad del usuario.
- Cada usuario tiene una calificación por título; una nueva calificación reemplaza la anterior.
- Los títulos ya registrados como vistos no aparecen en recomendaciones.
- Si no existen preferencias, historial ni calificaciones, se prioriza la popularidad.
- La interfaz no reproduce películas: el botón «Marcar como vista» simula la visualización para permitir evaluar el sistema.

## Pruebas propuestas
- Registrar usuario y verificar que se pueda iniciar sesión.
- Intentar registrar dos cuentas con el mismo email y esperar error 409.
- Seleccionar «Aventura» y verificar recomendaciones de ese género.
- Marcar un título como visto y verificar que desaparezca de recomendaciones.
- Comprobar que una cuenta menor de 18 años no reciba títulos +18.
- Calificar dos veces un mismo título y comprobar que se actualice.

## Fuera de alcance
Reproducción de video, panel de administradores, IA externa, base de datos SQL y aplicación móvil nativa.
