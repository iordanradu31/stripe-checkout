# Stripe Checkout — funcție serverless pentru Framer

Această funcție primește un `priceId` (ex: prețul pentru 40x60cm sau 50x70cm)
și returnează un URL Stripe către care trimiți clientul pentru plată.

## Pasul 1 — Deploy pe Vercel

1. Creează cont pe https://vercel.com (gratuit, te poți loga cu GitHub)
2. Instalează Vercel CLI local (dacă lucrezi din terminal):
   ```
   npm install -g vercel
   ```
3. Din folderul acestui proiect, rulează:
   ```
   vercel
   ```
   Urmează pașii (login, denumire proiect, etc.) — la final primești un URL,
   de exemplu: `https://stripe-checkout-function.vercel.app`

   Alternativ, fără terminal: încarci acest folder ca un repo pe GitHub,
   apoi din dashboard-ul Vercel dai "Import Project" și selectezi repo-ul.

## Pasul 2 — Adaugi cheia secretă Stripe

Cheia NU trebuie pusă în cod (e secretă). O adaugi din Vercel:

1. În dashboard-ul Vercel → proiectul tău → **Settings → Environment Variables**
2. Adaugi:
   - Key: `STRIPE_SECRET_KEY`
   - Value: cheia ta secretă din Stripe (o găsești în Stripe Dashboard →
     Developers → API keys → "Secret key", începe cu `sk_live_...` sau
     `sk_test_...` pentru testare)
3. Redeploy proiectul ca variabila să fie activă (Vercel îți va cere asta automat)

## Pasul 3 — Găsești price_id-urile din Stripe

Pentru fiecare mărime (40x60cm, 50x70cm), intri pe produsul respectiv din
Stripe Dashboard → Products, dai click pe preț, și copiezi ID-ul de tip
`price_1AbCdEfGhIjKlM...`. Ai nevoie de acest ID pentru fiecare variantă.

## Pasul 4 — Integrare în Framer

Pe pagina de produs (CMS collection), adaugi 2 butoane sau un mic selector
de mărime, fiecare declanșând acest cod (poți folosi un Code Override sau
o componentă custom React în Framer):

```javascript
async function checkout(priceId) {
  const response = await fetch('https://stripe-checkout-function.vercel.app/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  const data = await response.json();

  if (data.url) {
    window.location.href = data.url; // redirect către Stripe
  } else {
    alert('A apărut o eroare, te rugăm încearcă din nou.');
  }
}

// Exemplu de folosire pe butoane:
// <button onClick={() => checkout('price_XXXXXXXXXXXXXXXX')}>Comandă 40x60cm</button>
// <button onClick={() => checkout('price_YYYYYYYYYYYYYYYY')}>Comandă 50x70cm</button>
```

Dacă vrei ca price_id-ul să vină direct din CMS collection (recomandat,
ca să nu editezi cod pentru fiecare print nou), adaugi 2 câmpuri noi în
CMS: `price_id_40x60` și `price_id_50x70`, și le legi de butoanele
respective din designul paginii.

## Testare

Înainte să pui cheia `sk_live_...`, testează cu `sk_test_...` și carduri
de test Stripe (ex: 4242 4242 4242 4242, orice dată viitoare, orice CVC)
ca să confirmi că tot fluxul funcționează, apoi treci pe cheia live.
