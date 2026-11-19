const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const catalogo = require('./catalog');
const {leer,guardar} = require('./store');
const {hashPassword,validarPassword,token,verificar} = require('./auth');
const {edad,recomendar} = require('./recommend');
const generos = [...new Set(catalogo.flatMap(p=>p.generos))].sort();
const tipos = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
function fail(status,msg){const error = Error(msg); error.status=status;throw error;}
function publico(u){const {passwordHash,...datos}=u;return datos;}
async function body(req){
 let raw='';for await (const parte of req){raw+=parte;if(raw.length>100000)fail(413,'Solicitud demasiado grande');}
 try {return JSON.parse(raw || '{}');}catch{fail(400,'JSON inválido');}
}
const handler=async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');const ruta=url.pathname;const method=req.method;
  if(!ruta.startsWith('/api/') && ruta!=='/salud'){
   if(method!=='GET') return fail(405,'Método no permitido');
   const archivo=path.join(__dirname,'../public',ruta==='/'?'index.html':ruta.slice(1));
   const raiz=path.resolve(__dirname,'../public');
   if(!path.resolve(archivo).startsWith(raiz+path.sep)) fail(403,'Acceso denegado');
   const ext=path.extname(archivo);if(!tipos[ext] || !fs.existsSync(archivo)) fail(404,'No encontrado');
   res.writeHead(200,{'Content-Type':tipos[ext],'X-Content-Type-Options':'nosniff'});return fs.createReadStream(archivo).pipe(res);
  }
  if(ruta==='/salud' && method==='GET')return json(res,200,{estado:'ok',proyecto:'CineRuta'});
  if(ruta==='/api/generos' && method==='GET')return json(res,200,generos);
  const db=leer();
  if(ruta==='/api/usuarios' && method==='POST'){
   const p=await body(req);const nombre=String(p.nombre||'').trim();const email=String(p.email||'').trim().toLowerCase();
   if(nombre.length<2 || nombre.length>70 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>160 || typeof p.password!=='string' || p.password.length<8 || p.password.length>128 || edad(p.fechaNacimiento)===null || edad(p.fechaNacimiento)>120)fail(400,'Revisá nombre, email, contraseña (mínimo 8 caracteres) y fecha de nacimiento');
   if(db.usuarios.some(u=>u.email===email))fail(409,'Ese correo ya está registrado');
   const usuario={id:Math.max(0,...db.usuarios.map(u=>u.id))+1,nombre,email,passwordHash:hashPassword(p.password),fechaNacimiento:p.fechaNacimiento,generos:[]};
   db.usuarios.push(usuario);guardar(db);return json(res,201,{usuario:publico(usuario),token:token(usuario.id)});
  }
  if(ruta==='/api/login' && method==='POST'){
   const p=await body(req);const u=db.usuarios.find(u=>u.email===String(p.email||'').trim().toLowerCase());
   if(!u || typeof p.password!=='string' || !validarPassword(p.password,u.passwordHash))fail(401,'Correo o contraseña incorrectos');
   return json(res,200,{usuario:publico(u),token:token(u.id)});
  }
  const auth=String(req.headers.authorization||'');const id=verificar(auth.startsWith('Bearer ')?auth.slice(7):'');
  const usuario=db.usuarios.find(u=>u.id===id);
  if(!usuario) fail(401,'Iniciá sesión para continuar');
  if(ruta==='/api/yo' && method==='GET')return json(res,200,publico(usuario));
  if(ruta==='/api/peliculas' && method==='GET')return json(res,200,catalogo.filter(p=>p.edadMinima<=edad(usuario.fechaNacimiento)));
  const detail=ruta.match(/^\/api\/peliculas\/(\d+)$/);
  if(detail && method==='GET'){
   const p=catalogo.find(p=>p.id===Number(detail[1]) && p.edadMinima<=edad(usuario.fechaNacimiento));
   if(!p)fail(404,'Contenido no disponible');return json(res,200,p);
  }
  if(ruta==='/api/buscar' && method==='GET'){
   const q=String(url.searchParams.get('nombre')||'').trim();if(!q)fail(400,'Escribí algo para buscar');
   const disponibles=catalogo.filter(p=>p.edadMinima<=edad(usuario.fechaNacimiento));
   const resultado=disponibles.filter(p=>p.titulo.toLocaleLowerCase('es').includes(q.toLocaleLowerCase('es')));
   return json(res,200,{resultado,alternativas:resultado.length?[]:disponibles.slice().sort((a,b)=>b.popularidad-a.popularidad).slice(0,4),mensaje:resultado.length?'Resultados':'No encontramos ese título; probá estas alternativas'});
  }
  const perfil=ruta.match(/^\/api\/usuarios\/(\d+)(?:\/(historial|calificaciones|recomendaciones))?$/);
  if(perfil){
   if(Number(perfil[1])!==usuario.id)fail(403,'No podés acceder a los datos de otro usuario');
   const sub=perfil[2];
   if(!sub && method==='PUT'){
    const p=await body(req);if(typeof p.nombre!=='string'||p.nombre.trim().length<2||p.nombre.length>70||!Array.isArray(p.generos)||p.generos.length>8||p.generos.some(g=>!generos.includes(g)))fail(400,'Nombre o géneros inválidos');
    usuario.nombre=p.nombre.trim();usuario.generos=[...new Set(p.generos)];guardar(db);return json(res,200,publico(usuario));
   }
   if(sub==='historial' && method==='GET') return json(res,200,db.historial.filter(h=>h.usuarioId===id));
   if(sub==='calificaciones' && method==='GET') return json(res,200,db.calificaciones.filter(c=>c.usuarioId===id));
   if(sub==='recomendaciones' && method==='GET')return json(res,200,recomendar(usuario,catalogo,db.historial,db.calificaciones).slice(0,12));
   if((sub==='historial'||sub==='calificaciones') && method==='POST'){
    const p=await body(req);const contenidoId=Number(p.contenidoId);const disponible=catalogo.some(c=>c.id===contenidoId&&c.edadMinima<=edad(usuario.fechaNacimiento));
    if(!Number.isInteger(contenidoId)||!disponible)fail(404,'Contenido no disponible');
    if(sub==='historial'){
     if(!Number.isInteger(p.progresoPct)||p.progresoPct<0||p.progresoPct>100)fail(400,'El progreso debe ser de 0 a 100');
     const anterior=db.historial.find(h=>h.usuarioId===id&&h.contenidoId===contenidoId);
     if(anterior){anterior.progresoPct=p.progresoPct;anterior.fecha=new Date().toISOString();}else db.historial.push({usuarioId:id,contenidoId,progresoPct:p.progresoPct,fecha:new Date().toISOString()});
    }else{
     if(!Number.isInteger(p.puntaje)||p.puntaje<1||p.puntaje>5)fail(400,'La puntuación debe ser de 1 a 5');
     const anterior=db.calificaciones.find(c=>c.usuarioId===id&&c.contenidoId===contenidoId);
     if(anterior)anterior.puntaje=p.puntaje;else db.calificaciones.push({usuarioId:id,contenidoId,puntaje:p.puntaje});
    }
    guardar(db);return json(res,200,{ok:true});
   }
  }
  fail(404,'Ruta no encontrada');
 }catch(error){json(res,error.status||500,{error:error.status?error.message:'Error interno del servidor'});if(!error.status)console.error(error);}
};
const server=http.createServer(handler);
if(require.main===module){server.listen(Number(process.env.PORT)||3000,()=>console.log('CineRuta en http://localhost:'+(process.env.PORT||3000)));}
module.exports=server;
