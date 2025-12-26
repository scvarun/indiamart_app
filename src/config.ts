const config = {
  apiHost: process.env.NEXT_PUBLIC_API_HOST,
  razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
  razorpaySecret: process.env.RAZORPAY_SECRET || '',
  razorpayPlanId: process.env.RAZORPAY_SUBSCRIPTION_PLAN_ID || '',
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
};

export default config;
