/* ===== Galería ===== */
const FOTOS=[
 {src:'img/salon.jpg',w:1200,h:1600,alt:'Sala de Copilates con reformers de madera frente a una pared de piedra'},
 {src:'img/galeria/sala-clase-completa.jpg',w:720,h:960,alt:'Alumnas recostadas en los reformers durante una clase, en una sala luminosa'},
 {src:'img/galeria/clase-reformer-1.jpg',w:720,h:1172,alt:'Alumnas realizando un ejercicio de flexión en el reformer, con luces celestes de fondo'},
 {src:'img/galeria/sala-estiramiento.jpg',w:720,h:540,alt:'Grupo de alumnas estirando en los reformers con el cartel de Co Pilates al fondo'},
 {src:'img/galeria/clase-profesora.jpg',w:720,h:1276,alt:'Profesora guiando un ejercicio de piernas en el reformer'},
 {src:'img/galeria/clase-pelota.jpg',w:720,h:405,alt:'Alumnas trabajando con pelotas sobre los reformers'}
];
const gal=document.getElementById('gal'),lb=document.createElement('dialog');
lb.className='lb';lb.innerHTML='<form method="dialog"><button class="x">Cerrar</button></form><img alt="">';
document.body.appendChild(lb);
FOTOS.forEach(f=>{
 const b=document.createElement('button'),i=document.createElement('img');
 b.type='button';b.setAttribute('aria-label','Ampliar: '+f.alt);i.src=f.src;i.alt=f.alt;i.width=f.w;i.height=f.h;i.loading='lazy';
 b.appendChild(i);b.onclick=()=>{const im=lb.querySelector('img');im.src=f.src;im.alt=f.alt;lb.showModal()};
 gal.appendChild(b);
});
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
const paso=()=>Math.max(260,gal.clientWidth*.8);
document.getElementById('g-prev').onclick=()=>gal.scrollBy({left:-paso(),behavior:'smooth'});
document.getElementById('g-next').onclick=()=>gal.scrollBy({left:paso(),behavior:'smooth'});

/* ===== Clases / servicios ===== */
const SERVICIOS_BASE=[
 {
  titulo:'Pilates Reformer',
  descripcion:'Clases en máquina con grupos reducidos para corregir postura, ganar fuerza y aliviar dolores de espalda.',
  icono: '<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>'
 },
 {
  titulo:'Pilates Mat',
  descripcion:'Trabajo en colchoneta con pelotas y accesorios. Ideal para empezar y sumar flexibilidad.',
  icono: '<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>'
 },
 {
  titulo:'Pilates terapéutico',
  descripcion:'Para quienes vienen con dolor o lesiones. Avanzamos de a poco, con seguimiento personalizado.',
  icono: '<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
 }
];

function renderServicios(lista){
 const c=document.getElementById('serv');c.innerHTML='';
 lista.forEach(x=>{
  const a=document.createElement('article');a.className='card';
  if(x.icono){
   const ic=document.createElement('div');ic.className='card-icon';ic.innerHTML=x.icono;
   a.appendChild(ic);
  }
  const h=document.createElement('h3');h.textContent=x.titulo;
  const p=document.createElement('p');p.textContent=x.descripcion||'';
  a.append(h,p);
  if(x.para_quien){const f=document.createElement('div');f.className='for';f.textContent=x.para_quien;a.appendChild(f)}
  c.appendChild(a);
 });
}

/* ===== Opiniones (Supabase) ===== */
const ops=document.getElementById('ops');
async function cargarOpiniones(){
 if(!db)return;
 const {data,error}=await db.from('opiniones').select('nombre,estrellas,comentario,created_at').eq('aprobada',true).order('created_at',{ascending:false}).limit(30);
 ops.innerHTML='';
 if(error||!data||!data.length){ops.hidden=true;return}
 ops.hidden=false;
 data.forEach(o=>{
  const d=document.createElement('article');d.className='op';
  const st=document.createElement('div');st.className='st';st.setAttribute('aria-label',o.estrellas+' de 5 estrellas');
  st.textContent='★'.repeat(o.estrellas)+'☆'.repeat(5-o.estrellas);
  const p=document.createElement('p');p.textContent=o.comentario;
  const n=document.createElement('b');n.textContent=o.nombre;
  const f=document.createElement('small');f.textContent=new Date(o.created_at).toLocaleDateString('es-AR',{month:'long',year:'numeric'});
  d.append(st,p,n,f);ops.appendChild(d);
 });
}

const opform = document.getElementById('opform');
if (opform) {
    opform.addEventListener('submit',async e=>{
     e.preventDefault();
     const msg=document.getElementById('op-msg'),btn=document.getElementById('op-btn');
     if(document.getElementById('op-web').value)return;
     if(!db){msg.textContent='Las opiniones todavía no están habilitadas.';return}
     btn.disabled=true;msg.textContent='Enviando…';
     const {error}=await db.from('opiniones').insert({
      nombre:document.getElementById('op-nombre').value.trim(),
      estrellas:parseInt(document.querySelector('input[name=est]:checked').value),
      comentario:document.getElementById('op-texto').value.trim()
     });
     btn.disabled=false;
     if(error){msg.textContent='No pudimos enviar tu opinión. Probá de nuevo en unos minutos.';return}
     e.target.reset();
     msg.textContent='¡Gracias! Tu opinión se va a publicar después de que la revisemos.';
    });
}

async function cargarServicios(){
 renderServicios(SERVICIOS_BASE);
 if(!db)return;
 const {data,error}=await db.from('servicios').select('id,titulo,descripcion,para_quien,orden,activo,icono').eq('activo',true).order('orden').order('id');
 if(!error&&data&&data.length)renderServicios(data);
}

/* ===== Opiniones propias CSV ===== */
const OPINIONES_URL='opiniones.csv';
function leerCSV(texto){
 texto=texto.replace(/^﻿/,'');
 const primera=texto.split(/\r?\n/)[0]||'';
 const sep=(primera.split(';').length>primera.split(',').length)?';':',';
 const filas=[];let fila=[],cel='',q=false;
 for(let k=0;k<texto.length;k++){
  const c=texto[k];
  if(q){ if(c==='"' ){ if(texto[k+1]==='"' ){cel+='"';k++} else q=false } else cel+=c }
  else if(c==='"' )q=true;
  else if(c===sep){fila.push(cel);cel=''}
  else if(c==='\n'||c==='\r'){ if(c==='\r'&&texto[k+1]==='\n')k++; fila.push(cel);cel='';filas.push(fila);fila=[] }
  else cel+=c;
 }
 if(cel!==''||fila.length){fila.push(cel);filas.push(fila)}
 const enc=(filas.shift()||[]).map(x=>x.trim().toLowerCase());
 return filas.filter(f=>f.some(x=>x.trim())).map(f=>Object.fromEntries(enc.map((h,n)=>[h,(f[n]||'').trim()])));
}
async function traerCSV(url){
 try{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)return [];return leerCSV(await r.text())}catch(e){return []}
}

const pintarEstrellas=n=>{n=Math.max(0,Math.min(5,parseInt(n)||0));return '★'.repeat(n)+'☆'.repeat(5-n)};
function tarjetaOpinion(cont,o){
 const a=document.createElement('article');a.className='op';
 const st=document.createElement('div');st.className='st';st.setAttribute('aria-label',o.rating+' de 5 estrellas');st.textContent=pintarEstrellas(o.rating);
 const p=document.createElement('p');p.textContent=o.texto;
 const n=document.createElement('b');n.textContent=o.autor;
 const f=document.createElement('small');f.textContent=o.cuando||'';
 a.append(st,p,n,f);cont.appendChild(a);
}
async function cargarOpinionesCSV(){
 const filas=await traerCSV(OPINIONES_URL);
 const cont=document.getElementById('g-reviews');
 if(!cont) return;
 filas.filter(f=>f.texto).forEach(f=>tarjetaOpinion(cont,{autor:f.autor||'',rating:f.estrellas||5,texto:f.texto,cuando:f.fecha||''}));
 cont.hidden=!cont.children.length;
}
async function cargarStats(){
 let d;
 try{const r=await fetch('/.netlify/functions/stats');if(!r.ok)return;d=await r.json()}catch(e){return}
 if(d.instagram&&typeof d.instagram.followers==='number'){
  const n=d.instagram.followers;
  const st_ig = document.getElementById('st-ig');
  if(st_ig) st_ig.textContent=(n>=1000?'+':'')+(n>=1000?Math.floor(n/100)*100:n).toLocaleString('es-AR');
 }
 const g=d.google;if(!g)return;
 const st_g = document.getElementById('st-g');
 if(g.rating && st_g) st_g.textContent='★ '+Number(g.rating).toFixed(1).replace('.',',');
 const sum=document.getElementById('g-sum');
 if(sum) {
     document.getElementById('g-score').textContent=g.rating?'★ '+Number(g.rating).toFixed(1).replace('.',','):'';
     document.getElementById('g-count').textContent=g.count?g.count+' opiniones':'';
     sum.hidden=false;
 }
 const w=document.getElementById('g-write');
 if(w){ w.href='https://search.google.com/local/writereview?placeid='+encodeURIComponent(g.placeId);w.hidden=false; }
 const glink=document.getElementById('g-link');
 if(glink) glink.href='https://search.google.com/local/reviews?placeid='+encodeURIComponent(g.placeId);
 const cont=document.getElementById('g-reviews');
 if(cont){
     cont.innerHTML='';
     (g.reviews||[]).filter(x=>x.texto).forEach(o=>tarjetaOpinion(cont,o));
     cont.hidden=!cont.children.length;
 }
}

/* Inicio */
if(!db){
 if(opform) opform.hidden=true;
}
cargarServicios();
Promise.all([cargarOpinionesCSV(),cargarOpiniones()]).then(()=>cargarStats()).then(()=>{
 const rev = document.getElementById('g-reviews'), opsDiv = document.getElementById('ops'), vacio = document.getElementById('op-vacio');
 if(vacio) {
     const hay=(rev && rev.children.length > 0) || (opsDiv && opsDiv.children.length > 0);
     vacio.hidden=hay;
 }
});

const b=document.querySelector('.burger'),m=document.getElementById('menu');
if(b && m) {
    b.addEventListener('click',()=>{const o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)});
    m.addEventListener('click',e=>{if(e.target.tagName==='A'){m.classList.remove('open');b.setAttribute('aria-expanded','false')}});
}