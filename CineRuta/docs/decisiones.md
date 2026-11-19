# Decisiones técnicas

1. **Nombre CineRuta:** identidad propia para el prototipo.
2. **Catálogo ficticio:** evita depender de APIs de terceros y permite usar datos de prueba coherentes.
3. **Node.js sin dependencias:** simplifica la demostración en clase. El proyecto original proponía Express, React, TypeScript y PostgreSQL; esta versión no sigue esa pila completa.
4. **Persistencia JSON:** suficiente para pruebas locales pequeñas, no adecuada para un servicio con usuarios concurrentes.
5. **Recomendación determinista:** suma 100 puntos por género coincidente y la popularidad del contenido, filtra por edad y por historial.
6. **Sesión firmada:** token HMAC con expiración a 12 horas; no hay proveedor de identidad externo.
7. **Sin contenido audiovisual:** se implementa una simulación de visualización, no un reproductor.

Estas decisiones son propias de esta adaptación y no deben presentarse como requisitos textuales de la fuente original.
