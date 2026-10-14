/* Cifras en vivo: seguidores de Instagram y puntaje/reseñas de Google.
   Las claves viven en Netlify (Site configuration > Environment variables), nunca en la web.
   Si falta alguna, esa parte devuelve null y la página muestra sus valores de respaldo. */
const pedir = async (url, opciones) => {
  const r = await fetch(url, opciones);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
};

exports.handler = async () => {
  const { GOOGLE_API_KEY, GOOGLE_PLACE_ID, IG_USER_ID, IG_ACCESS_TOKEN } = process.env;
  const out = { instagram: null, google: null };

  await Promise.allSettled([
    (async () => {
      if (!IG_USER_ID || !IG_ACCESS_TOKEN) return;
      const d = await pedir(
        `https://graph.facebook.com/v21.0/${encodeURIComponent(IG_USER_ID)}?fields=followers_count&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`
      );
      if (typeof d.followers_count === 'number') out.instagram = { followers: d.followers_count };
    })(),
    (async () => {
      if (!GOOGLE_API_KEY || !GOOGLE_PLACE_ID) return;
      const d = await pedir(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(GOOGLE_PLACE_ID)}?languageCode=es`,
        { headers: { 'X-Goog-Api-Key': GOOGLE_API_KEY, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' } }
      );
      out.google = {
        rating: d.rating ?? null,
        count: d.userRatingCount ?? null,
        placeId: GOOGLE_PLACE_ID,
        reviews: (d.reviews || []).map(r => ({
          autor: (r.authorAttribution && r.authorAttribution.displayName) || '',
          rating: r.rating || 0,
          texto: (r.text && r.text.text) || (r.originalText && r.originalText.text) || '',
          cuando: r.relativePublishTimeDescription || ''
        }))
      };
    })()
  ]);

  const hayDatos = out.instagram || out.google;
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': hayDatos ? 'public, max-age=300' : 'no-store',
      // Netlify guarda la respuesta 6 horas: no se consulta a Google ni a Instagram en cada visita
      'Netlify-CDN-Cache-Control': hayDatos ? 'public, s-maxage=21600, stale-while-revalidate=86400' : 'no-store'
    },
    body: JSON.stringify(out)
  };
};
