"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useRef, useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { submitContactForm } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Loader } from "lucide-react";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="h-11 sm:h-12 md:h-14 px-6 sm:px-8 rounded-none border border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono tracking-widest backdrop-blur-sm transition-all duration-300 group text-sm sm:text-base"
    >
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          SENDING...
        </>
      ) : (
        <>
          SUBMIT
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
}

function ContactFormInternal() {
  const [state, formAction] = useActionState(
    submitContactForm,
    initialState,
  ) as unknown as [
    typeof initialState & { errors?: Record<string, string[]> },
    (payload: FormData) => void,
  ];
  const formRef = useRef<HTMLFormElement>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (state?.message?.includes("successfully")) {
      formRef.current?.reset();
    }
  }, [state?.message]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);

      if (executeRecaptcha) {
        const token = await executeRecaptcha("contact");
        formData.set("recaptchaToken", token);
      }

      formAction(formData);
    },
    [executeRecaptcha, formAction],
  );

  return (
    <section className="bg-black text-white py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl text-center mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: "spring", duration: 1 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Contact Us
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-400">
            Have a project in mind or just want to say hello? Drop us a line.
          </p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto mt-12 sm:mt-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative rounded-lg sm:rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-lg sm:rounded-2xl bg-gradient-to-br from-cyan-900/10 to-transparent" />
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="relative z-10 space-y-6 sm:space-y-8"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs sm:text-sm font-mono tracking-wider text-gray-400 mb-2"
                >
                  NAME
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  required
                />
                {state?.errors?.name && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2">
                    {state.errors.name.join(", ")}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-mono tracking-wider text-gray-400 mb-2"
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  required
                />
                {state?.errors?.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2">
                    {state.errors.email.join(", ")}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs sm:text-sm font-mono tracking-wider text-gray-400 mb-2"
                >
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="form-input"
                  required
                />
                {state?.errors?.message && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2">
                    {state.errors.message.join(", ")}
                  </p>
                )}
              </div>
              <div className="text-center pt-4">
                <SubmitButton />
              </div>
              {state?.message && (
                <p
                  className={`text-center mt-4 text-xs sm:text-sm font-mono ${state?.errors ? "text-red-400" : "text-green-400"}`}
                >
                  {state.message}
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.65rem 0.875rem;
          border-radius: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
          font-family: var(--font-mono);
          font-size: clamp(0.875rem, 2vw, 1rem);
          transition:
            border-color 0.3s,
            box-shadow 0.3s;
          min-height: 2.75rem;
        }
        .form-input:focus {
          outline: none;
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.1);
        }
      `}</style>
    </section>
  );
}

export function ContactForm() {
  return <ContactFormInternal />;
}
