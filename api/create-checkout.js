// api/create-checkout.js
// Funcție serverless pentru Vercel: creează o Stripe Checkout Session
// pe baza price_id-ului trimis de Framer (ex: 40x60cm sau 50x70cm)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Permite request-uri de pe orice domeniu (Framer). Poți restrânge mai târziu
  // la domeniul tău exact pentru mai multă siguranță.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Browserul trimite un request "preflight" OPTIONS înainte de POST — răspundem simplu la el
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Lipsește priceId' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Aici pui domeniul tău real de Framer, cu paginile de succes/anulare
      success_url: 'https://raduiordan.ro/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://raduiordan.ro/cancel',
      automatic_tax: { enabled: true },
      // Colectează adresa de livrare — util pentru printuri fizice
      shipping_address_collection: {
        allowed_countries: ['RO'],
      },
    });

    // Returnăm URL-ul Stripe către care Framer va face redirect
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
