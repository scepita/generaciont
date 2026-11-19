const crypto = require('node:crypto');
const secret = process.env.SESSION_SECRET || 'solo-desarrollo-cambiar-antes-de-publicar';
if (process.env.NODE_ENV === 'production' && secret === 'solo-desarrollo-cambiar-antes-de-publicar') {
  throw Error('Configurá SESSION_SECRET antes de publicar.');
}
const b64 = v => Buffer.from(v).toString('base64url');
function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')) {
  return salt + ':' + crypto.scryptSync(password,salt,64).toString('hex');
}
function validarPassword(password,hash){
  const [salt,original] = (hash||'').split(':');
  if(!salt || !original || original.length !== 128) return false;
  const actual = crypto.scryptSync(password,salt,64);
  return crypto.timingSafeEqual(actual,Buffer.from(original,'hex'));
}
function token(usuarioId){
  const contenido = b64(JSON.stringify({sub:usuarioId,exp:Date.now()+1000*60*60*12}));
  const firma = crypto.createHmac('sha256',secret).update(contenido).digest('base64url');
  return contenido+'.'+firma;
}
function verificar(valor){
  try {
    const [contenido,firma] = valor.split('.');
    if(!contenido || !firma) return null;
    const esperada=crypto.createHmac('sha256',secret).update(contenido).digest();
    const recibida=Buffer.from(firma,'base64url');
    if(recibida.length!==esperada.length || !crypto.timingSafeEqual(recibida,esperada)) return null;
    const data=JSON.parse(Buffer.from(contenido,'base64url').toString('utf8'));
    return data.exp > Date.now() && Number.isInteger(data.sub) ? data.sub : null;
  } catch {return null;}
}
module.exports={hashPassword,validarPassword,token,verificar};
