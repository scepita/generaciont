# CineRuta 🎬

**Proyecto educativo de Generación T.** Aplicación web de descubrimiento de películas y series con recomendaciones personalizadas.

## Qué hace

- Registro e inicio de sesión.
- Catálogo ficticio con búsqueda, detalles y filtro por géneros.
- Control de edad a partir de la fecha de nacimiento.
- Selección de géneros favoritos.
- Registro de contenido visto y calificaciones de 1 a 5.
- Recomendaciones por géneros, calificaciones y popularidad, sin repetir contenido visto.
- Interfaz adaptable a celulares y computadoras.

## Tecnologías

Node.js 20+, HTTP y criptografía incorporados a Node; HTML, CSS y JavaScript en el navegador. **No usa React, PostgreSQL ni servicios de IA externos.** Se eligió una versión sin dependencias para facilitar la ejecución y presentación de una demostración académica. Los datos se guardan en un archivo JSON local (solo para desarrollo/demostración).

## Cómo ejecutar

1. Instalar [Node.js](https://nodejs.org/) versión 20 o superior.
2. Descargar este repositorio.
3. Abrir una terminal dentro de la carpeta.
4. Ejecutar:

```bash
npm start
```

5. Abrir `http://localhost:3000` en el navegador.

No hace falta instalar paquetes adicionales. Para ejecutar las pruebas:

```bash
npm test
```

## Configuración

Copiar `.env.example` a `.env` es opcional como referencia, **pero Node no lee el archivo `.env` automáticamente en esta versión**. Para configurar variables de entorno, cargarlas desde la terminal o usar Node 20.6+ con `node --env-file=.env src/server.js`. Para un servidor publicado, `SESSION_SECRET` debe ser largo, aleatorio y privado. La contraseña de cada usuario se guarda como hash con `scrypt` y una sal aleatoria.

## Estructura

```
CineRuta/
├── public/           # Interfaz web
├── src/              # Servidor, catálogo, autenticación y recomendaciones
├── tests/            # Tests automatizados
├── docs/             # Especificación, decisiones y tareas
├── .env.example      # Ejemplo de configuración
├── .gitignore        # Excluye datos de usuarios y secretos
├── package.json
└── README.md
```

## API principal

| Método | Ruta | Uso |
|---|---|---|
| GET | `/salud` | Estado del servidor |
| POST | `/api/usuarios` | Registro |
| POST | `/api/login` | Inicio de sesión |
| GET | `/api/yo` | Perfil autenticado |
| PUT | `/api/usuarios/:id` | Editar perfil |
| GET | `/api/peliculas` | Catálogo filtrado por edad |
| GET | `/api/peliculas/:id` | Detalle |
| GET | `/api/buscar?nombre=...` | Buscar y ofrecer alternativas |
| POST | `/api/usuarios/:id/historial` | Guardar visualización |
| POST | `/api/usuarios/:id/calificaciones` | Guardar o actualizar calificación |
| GET | `/api/usuarios/:id/recomendaciones` | Recomendaciones |

Las rutas de usuario requieren un token de sesión (header `Authorization: Bearer TOKEN`).

## Alcance y límites

Se trata de un **prototipo**, no de un servicio de streaming real. No reproduce videos, no tiene panel de administración, recuperación de contraseñas ni base de datos multiusuario robusta. La búsqueda sin coincidencias ofrece títulos populares compatibles con la edad, no semejanza semántica. Para uso real habría que sumar persistencia transaccional, limitación de intentos de login, HTTPS, validación avanzada y despliegue seguro.

## Autoría y referencia

Desarrollo adaptado para el trabajo final de Generación T. Se tomó como referencia conceptual la especificación abierta del proyecto [StreamFlix / AgenteIA-StreamFix](https://github.com/AlexisPradoC/AgenteIA-StreamFix) (catálogo, historial, calificaciones y recomendaciones). La implementación incluida en este repositorio fue desarrollada de forma independiente; revisar las condiciones de licencia antes de reutilizar documentos o archivos originales.
