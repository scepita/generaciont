const $=s=>document.querySelector(s);
let sesion=null, catalogo=[], generos=[], busquedaActual='';
const guardado=()=>{try{return JSON.parse(sessionStorage.getItem('cineruta'))}catch{return null}};
function mensaje(t){const el=$('#toast');el.textContent=t;el.style.display='block';clearTimeout(mensaje.timer);mensaje.timer=setTimeout(()=>el.style.display='none',3300);}
async function api(ruta,opciones={}){
 const res=await fetch(ruta,{...opciones,headers:{'Content-Type':'application/json',...(sesion?{Authorization:'Bearer '+sesion.token}:{}),...opciones.headers}});
 let data;try{data=await res.json()}catch{throw Error('El servidor no respondió correctamente')}
 if(!res.ok)throw Error(data.error||'Error inesperado');return data;
}
function mostrarAcceso(modoRegistro){
 $('#camposRegistro').hidden=!modoRegistro;$('#tabLogin').classList.toggle('active',!modoRegistro);$('#tabRegistro').classList.toggle('active',modoRegistro);
 $('#tituloFormulario').textContent=modoRegistro?'Creá tu cuenta':'¡Qué bueno verte!';$('#submitAcceso').textContent=modoRegistro?'Crear cuenta':'Iniciar sesión';$('#errorAcceso').textContent='';
 $('#formAcceso').elements.password.autocomplete=modoRegistro?'new-password':'current-password';
 $('#formAcceso').elements.nombre.required=modoRegistro;$('#formAcceso').elements.fechaNacimiento.required=modoRegistro;
}
$('#tabLogin').onclick=()=>mostrarAcceso(false);$('#tabRegistro').onclick=()=>mostrarAcceso(true);
$('#formAcceso').onsubmit=async e=>{
 e.preventDefault();const f=new FormData(e.target);const registro=!$('#camposRegistro').hidden;
 const datos={email:f.get('email'),password:f.get('password')};if(registro){datos.nombre=f.get('nombre');datos.fechaNacimiento=f.get('fechaNacimiento')}
 try{sesion=await api(registro?'/api/usuarios':'/api/login',{method:'POST',body:JSON.stringify(datos)});sessionStorage.setItem('cineruta',JSON.stringify(sesion));await iniciar();}
 catch(err){$('#errorAcceso').textContent=err.message;}
};
function tarjeta(p){
 const boton=document.createElement('button');boton.className='movie';boton.type='button';boton.setAttribute('aria-label','Ver detalles de '+p.titulo);
 const poster=document.createElement('div');poster.className='poster';poster.textContent=p.emoji;
 const info=document.createElement('div');info.className='movie-info';
 const titulo=document.createElement('h3');titulo.textContent=p.titulo;
 const meta=document.createElement('div');meta.className='meta';meta.textContent=p.tipo+' · +'+p.edadMinima+' · '+p.duracion+' min';
 const generos=document.createElement('p');generos.textContent=p.generos.join(' · ');
 info.append(titulo,meta,generos);if(p.motivo){const motivo=document.createElement('p');motivo.textContent='✦ '+p.motivo;info.append(motivo)}
 boton.append(poster,info);boton.onclick=()=>detalle(p);return boton;
}
function pintar(contenedor,datos){const el=$(contenedor);el.replaceChildren(...datos.map(tarjeta));}
async function actualizar(){
 const [c,r]=await Promise.all([api('/api/peliculas'),api('/api/usuarios/'+sesion.usuario.id+'/recomendaciones')]);catalogo=c;pintar('#recomendados',r.slice(0,6));filtrar();
}
function filtrar(){const filtro=$('#filtro').value;const q=busquedaActual.toLocaleLowerCase('es');let datos=catalogo.filter(p=>(!filtro||p.generos.includes(filtro))&&(!q||p.titulo.toLocaleLowerCase('es').includes(q)));pintar('#catalogo',datos);$('#sinResultados').hidden=datos.length>0;}
async function iniciar(){
 try{const usuario=await api('/api/yo');sesion.usuario=usuario;sessionStorage.setItem('cineruta',JSON.stringify(sesion));
 $('#acceso').hidden=true;$('#app').hidden=false;$('#nav').hidden=false;$('#nombreUsuario').textContent='Hola, '+usuario.nombre.split(' ')[0];
 generos=await api('/api/generos');$('#filtro').replaceChildren(new Option('Todos los géneros',''),...generos.map(g=>new Option(g,g)));await actualizar();}
 catch(err){cerrarSesion();mensaje('Volvé a iniciar sesión');}
}
function cerrarSesion(){sesion=null;sessionStorage.removeItem('cineruta');$('#app').hidden=true;$('#nav').hidden=true;$('#acceso').hidden=false;$('#formAcceso').reset();}
$('#salir').onclick=cerrarSesion;
$('#filtro').onchange=filtrar;
async function buscar(){busquedaActual=$('#busqueda').value.trim();$('#tituloCatalogo').textContent=busquedaActual?'Resultados de búsqueda':'Todo el catálogo';
 if(!busquedaActual){filtrar();return}
 try{const r=await api('/api/buscar?nombre='+encodeURIComponent(busquedaActual));const filtro=$('#filtro').value;
 const datos=(r.resultado.length?r.resultado:r.alternativas).filter(p=>!filtro||p.generos.includes(filtro));
 pintar('#catalogo',datos);$('#sinResultados').hidden=datos.length>0;if(!r.resultado.length)mensaje(r.mensaje);}
 catch(err){mensaje(err.message)}
}
$('#buscar').onclick=buscar;$('#busqueda').onkeydown=e=>{if(e.key==='Enter')buscar()};$('#busqueda').oninput=()=>{if(!$('#busqueda').value.trim()){busquedaActual='';$('#tituloCatalogo').textContent='Todo el catálogo';filtrar()}};
function detalle(p){const c=$('#contenidoDetalle');c.replaceChildren();
 const poster=document.createElement('div');poster.className='detail-poster';poster.textContent=p.emoji;
 const titulo=document.createElement('h2');titulo.textContent=p.titulo;
 const informacion=document.createElement('p');informacion.className='detail-text';informacion.textContent=`${p.tipo} · ${p.duracion} minutos · Edad mínima ${p.edadMinima}`;
 const sinopsis=document.createElement('p');sinopsis.textContent=p.sinopsis;
 const creditos=document.createElement('p');creditos.className='detail-text';creditos.textContent=`Dirección: ${p.director} · Elenco: ${p.actores.join(', ')}`;
 c.append(poster,titulo,informacion,sinopsis,creditos);
 for(const g of p.generos){const tag=document.createElement('span');tag.className='tag';tag.textContent=g;c.append(tag)}
 const acciones=document.createElement('div');acciones.className='detail-actions';
 const visto=document.createElement('button');visto.className='primary';visto.textContent='✓ Marcar como vista';visto.onclick=async()=>{
 try{await api(`/api/usuarios/${sesion.usuario.id}/historial`,{method:'POST',body:JSON.stringify({contenidoId:p.id,progresoPct:100})});$('#detalle').close();mensaje('Agregada a tu historial');await actualizar();}catch(err){mensaje(err.message)}
 };
 const puntaje=document.createElement('select');puntaje.setAttribute('aria-label','Calificar contenido');puntaje.append(new Option('Calificar ★',''));
 for(let n=1;n<=5;n++)puntaje.append(new Option(n+' ★',String(n)));
 puntaje.onchange=async()=>{if(!puntaje.value)return;try{await api(`/api/usuarios/${sesion.usuario.id}/calificaciones`,{method:'POST',body:JSON.stringify({contenidoId:p.id,puntaje:Number(puntaje.value)})});mensaje('Calificación guardada');await actualizar();}catch(err){mensaje(err.message)}};
 acciones.append(visto,puntaje);c.append(acciones);$('#detalle').showModal();
}
$('#cerrarDetalle').onclick=()=>$('#detalle').close();
$('#editarGustos').onclick=()=>{
 $('#nombrePerfil').value=sesion.usuario.nombre;const lista=$('#listaGeneros');lista.replaceChildren();
 for(const genero of generos){const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.value=genero;input.checked=sesion.usuario.generos.includes(genero);label.append(input,document.createTextNode(genero));lista.append(label)}
 $('#preferencias').showModal();
};
$('#cerrarGustos').onclick=()=>$('#preferencias').close();
$('#formGustos').onsubmit=async e=>{e.preventDefault();const lista=[...$('#listaGeneros input:checked')].map(x=>x.value);
 try{const u=await api(`/api/usuarios/${sesion.usuario.id}`,{method:'PUT',body:JSON.stringify({nombre:$('#nombrePerfil').value,generos:lista})});sesion.usuario=u;sessionStorage.setItem('cineruta',JSON.stringify(sesion));$('#nombreUsuario').textContent='Hola, '+u.nombre.split(' ')[0];$('#preferencias').close();mensaje('Preferencias actualizadas');await actualizar();}
 catch(err){$('#errorGustos').textContent=err.message;}
};
sesion=guardado();if(sesion?.token)iniciar();
