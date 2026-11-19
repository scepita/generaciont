function edad(fecha, ahora = new Date()) {
  const nacimiento = new Date(fecha + 'T00:00:00Z');
  if (Number.isNaN(nacimiento.getTime()) || nacimiento > ahora) return null;
  let n = ahora.getUTCFullYear() - nacimiento.getUTCFullYear();
  const mes = ahora.getUTCMonth() - nacimiento.getUTCMonth();
  if (mes < 0 || (mes === 0 && ahora.getUTCDate() < nacimiento.getUTCDate())) n--;
  return n;
}
function recomendar(usuario, catalogo, historial, calificaciones, ahora = new Date()) {
  const anos = edad(usuario.fechaNacimiento, ahora);
  if (anos === null) return [];
  const vistos = new Set(historial.filter(h => h.usuarioId === usuario.id).map(h => h.contenidoId));
  const propias = calificaciones.filter(c => c.usuarioId === usuario.id && c.puntaje >= 4);
  const favoritos = new Set(usuario.generos || []);
  for (const c of propias) {
    const pelicula = catalogo.find(p => p.id === c.contenidoId);
    if (pelicula) pelicula.generos.forEach(g => favoritos.add(g));
  }
  const sinDatos = vistos.size === 0 && propias.length === 0 && favoritos.size === 0;
  return catalogo.filter(p => p.edadMinima <= anos && !vistos.has(p.id))
    .map(p => ({...p, puntaje: (sinDatos ? 0 : p.generos.filter(g => favoritos.has(g)).length * 100) + p.popularidad,
      motivo: sinDatos ? 'Tendencia popular' : p.generos.some(g => favoritos.has(g)) ? 'Coincide con tus gustos' : 'Popular en CineRuta'}))
    .sort((a,b) => b.puntaje - a.puntaje || a.id - b.id);
}
module.exports = {edad,recomendar};
