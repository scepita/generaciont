const fs = require('node:fs');
const path = require('node:path');
const file = process.env.DATA_FILE || path.join(__dirname,'../data/database.json');
function leer(){
  if(!fs.existsSync(file)) return {usuarios:[],historial:[],calificaciones:[]};
  return JSON.parse(fs.readFileSync(file,'utf8'));
}
function guardar(db){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db,null,2));
  fs.renameSync(tmp,file);
}
module.exports = {leer,guardar};
