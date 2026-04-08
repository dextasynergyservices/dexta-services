"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  if (!recaptchaSiteKey) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
