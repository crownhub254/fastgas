import { loadStripe as stripeLoader } from '@stripe/stripe-js';

let stripePromise;

export const loadStripe = () => {
    if (!stripePromise) {
        stripePromise = stripeLoader(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};
