import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream'
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false
  }
}

//o Set é parecido com um array só que não permite dados iguais
//aqui definimos os eventos relevantes

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const secret = req.headers['stripe-signature']

    //cria a variável event com o tipo event do stripe
    let event: Stripe.Event;

    try {
      //constrói um evento
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      return res.status(400).send(`Webhook error: ${error.message}`)
    }

    //pega o tipo do evento criado
    const { type } = event;

    if (relevantEvents.has(type)) {
      //verifica se o evento é o que eu quero
      try {
        switch (type) {
          case 'checkout.session.completed':

            const checkoutSession = event.data.object as Stripe.Checkout.Session;
            await saveSubscription(checkoutSession.subscription.toString(), checkoutSession.customer.toString(), true)
            break;
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false);

            break;
          default:
            throw new Error('Unhandled event.')
        }
      } catch (error) {
        return res.json({ error: 'Webhook handler failed.' })
      }
    }

    res.status(200).json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed.')
  }
}