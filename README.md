# Copilates — sitio web

Web informativa de Copilates (pilates reformer, mat e hipopresivos): presentación del estudio, clases, galería, opiniones y venta de clases grabadas.
Es un sitio estático (HTML, CSS y JS, sin build). **No incluye turnero ni cuentas**: los botones "Reservar turno" llevan a la app de turnos, que funciona por separado.

## Estructura

```
index.html          Contenido de la página
css/styles.css      Estilos (colores en :root, basados en el logo)
js/supabase.js      Conexión a Supabase  <- acá se pegan la URL y la clave
js/main.js          Horarios, cifras en vivo, galería, clases, opiniones, clases grabadas y menú
netlify/functions/  stats.js: consulta Instagram y Google (las claves viven en Netlify)
netlify.toml        Configuración de Netlify
img/                Logo y foto del salón
img/galeria/        Fotos de la galería
sql/setup.sql       Tablas de Supabase (opiniones, clases grabadas y clases que se ofrecen)
```

El orden de los scripts al final de `index.html` importa: primero la librería de Supabase, después `js/supabase.js` y al final `js/main.js`.

## Funciones opcionales

La web funciona sin Supabase: si `js/supabase.js` no está configurado, se ocultan las clases grabadas y el formulario de opiniones, y las clases se muestran desde el texto base de `js/main.js`.

### Cifras en vivo (Instagram y Google)
La función `netlify/functions/stats.js` consulta las dos APIs y Netlify guarda la respuesta unas 6 horas. Mientras no esté configurada, la página muestra las cifras de respaldo escritas en `index.html` (`st-ig` y `st-g`).

Variables a cargar en Netlify (**Site configuration → Environment variables**):

| Variable | Qué es |
|---|---|
| `IG_USER_ID` | ID de la cuenta profesional de Instagram |
| `IG_ACCESS_TOKEN` | Token de acceso de la app de Meta |
| `GOOGLE_API_KEY` | Clave de Google Cloud con la API *Places API (New)* habilitada |
| `GOOGLE_PLACE_ID` | Place ID del perfil de Google Business del estudio |

- **Instagram:** la cuenta tiene que ser profesional (empresa o creador), vinculada a una app de Meta for Developers. Los tokens de acceso vencen, así que hay que renovarlo antes de su fecha de vencimiento.
- **Google:** hace falta un proyecto de Google Cloud con facturación activada. Revisá los precios y el uso gratuito vigentes. Google devuelve como máximo 5 reseñas.
- Las funciones solo andan si Netlify publica desde el repositorio (Git), no arrastrando la carpeta.

### Horarios
Se editan en la lista `HORARIOS` de `js/main.js` (sede, día, hora y clase). La reserva se hace desde la app de turnos.

## Puesta en marcha

### 1. Crear el Supabase nuevo
1. Entrá a supabase.com y creá un proyecto nuevo.
2. Abrí **SQL Editor → New query**, pegá todo `sql/setup.sql` y tocá **Run**.
3. Andá a **Project Settings → API** y copiá la **Project URL** y la clave **anon / publishable**.
   No uses nunca la clave `service_role`.
4. Pegalas en `js/supabase.js` (`SUPABASE_URL` y `SUPABASE_ANON_KEY`).

### 2. Subir al repositorio
```
git init
git add .
git commit -m "Primera versión de la web"
git branch -M main
git remote add origin <URL-DEL-REPOSITORIO-NUEVO>
git push -u origin main
```

### 3. Publicar
En Netlify (o Vercel): **Add new site → Import from Git**, elegí el repositorio.
No hace falta comando de build; el directorio a publicar es la raíz (`/`).
Cuando tengan dominio, se agrega desde la configuración del sitio.

Si después de un cambio no ves la novedad, recargá con Ctrl+F5: el navegador guarda CSS y JS.

## Mantenimiento (desde Supabase → Table Editor)

**Clases que se ofrecen.** Se editan en la tabla `servicios`: título, descripción, la línea chica (`para_quien`), `orden` y `activo`. Para agregar una clase nueva, insertá una fila; para ocultarla, `activo = false`.

**Opiniones.** Las opiniones nuevas llegan a `opiniones` con `aprobada = false`. Para publicar una, marcá `aprobada = true`. Para borrarla, eliminá la fila.

**Clases grabadas.**
1. Subí el video a YouTube (no listado) o Vimeo.
2. Cargá una fila en `clases_grabadas`: título, etiqueta (ej. "Clase simple 20 min", "Full body"), precio y `video_url`.
3. Cuando una alumna paga, creá su código en `clases_accesos` (el comando está al final de `sql/setup.sql`) y enviáselo por WhatsApp.
   - Sin `clase_id`: el código abre todas las clases.
   - Con `vence`: caduca en esa fecha.
   - `activo = false`: se desactiva.

**Galería.** Subí las fotos a `img/galeria/` y agregá una línea en la lista `FOTOS` de `js/main.js`, con el ancho y alto de la foto (`w` y `h`).

## Datos a completar
- En `index.html`, buscá los comentarios `EDITAR`: qué llevar a clase, etc.
- Los enlaces a la app de turnos, a WhatsApp (`+54 9 383 478-5722`) y a Instagram están escritos directamente en `index.html`.
