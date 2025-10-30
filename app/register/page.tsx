"use client";
import React from "react";
import { NextPage } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Input from "@/components/Input";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Success from "@/components/svg/Success";
import Error from "@/components/svg/Error";
import { useRouter } from "next/navigation";
import z from "zod";

const Page: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const firstnameSchema = z.string().min(1);
  const lastnameSchema = z.string().min(1);
  const emailSchema = z.string().email();
  const birthdateSchema = z
    .string()
    .transform((str) => {
      // Gère le format JJ/MM/AAAA
      const [day, month, year] = str.split(/[\/\-]/).map(Number);
      if (!day || !month || !year) return new Date("invalid");
      return new Date(year, month - 1, day);
    })
    .refine((date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      return age >= 18;
    }, "Must be at least 18 years old");

  const [validity, setValidity] = React.useState<{
    firstname?: boolean;
    lastname?: boolean;
    email?: boolean;
    birthdate?: boolean;
    civility?: boolean;
    accept?: boolean;
    offers?: boolean;
  }>({});
  const successSubmit = () => {
    setIsLoading(false);
    router.push("/game");
  };

  const errorSubmit = (error: Error) => {
    setIsLoading(false);
  };

  const userAlreadyFinished = () => {
    setIsLoading(false);
    router.push("/thanks");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formSchema = z.object({
      civility: z.enum(["madame", "monsieur"]),
      name: firstnameSchema,
      surname: lastnameSchema,
      email: emailSchema,
      birthdate: birthdateSchema,
      accept: z.literal(true, {
        message: "You must accept the terms",
      }),
      acceptNewsletter: z.boolean().optional(),
    });

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const data = {
      civility: formData.get("civility")?.toString() || "",
      name: formData.get("firstname")?.toString() || "",
      surname: formData.get("lastname")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      birthdate: formData.get("birthdate")?.toString() || "",
      accept: formData.get("accept") === "on",
      acceptNewsletter: formData.get("offers") === "on",
    };
    const result = formSchema.safeParse(data);
    if (!result.success) {
      console.error("Erreur de validation Zod:", result.error.flatten());
    }

    // Gestion de la validité champ par champ
    setValidity({
      firstname: firstnameSchema.safeParse(data.name).success,
      lastname: lastnameSchema.safeParse(data.surname).success,
      email: emailSchema.safeParse(data.email).success,
      birthdate: birthdateSchema.safeParse(data.birthdate).success,
      civility: ["madame", "monsieur"].includes(data.civility),
      accept: data.accept === true,
      offers: data.acceptNewsletter === true,
    });

    if (result.success) {
      setIsLoading(true);
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(async (response) => {
          const data = await response.json();
          if (response.status === 201 || response.status === 422) {
            successSubmit();
          } else if (response.status === 200) {
            userAlreadyFinished();
          } else {
            errorSubmit(
              new window.Error(data.message || "Erreur lors de l'inscription")
            );
          }
        })
        .catch((error) => errorSubmit(error));
    }
  };

  const t = useTranslations("Register");
  return (
    <div>
      <h1 className=" text-3xl font-sans text-center mt-15 mb-15">
        {t.rich("title", {
          br: () => <br />,
        })}
      </h1>
      <form
        className="max-w-7xl mx-auto p-16 bg-white rounded-lg shadow-[0_2px_20px_rgba(0,0,0,0.1)] flex flex-col gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-8">
          <label className="flex items-center gap-2 cursor-pointer relative">
            <input
              type="radio"
              name="civility"
              value="madame"
              className="custom-radio-input"
              onChange={() => setValidity((v) => ({ ...v, civility: true }))}
            />
            <span
              className={`custom-radio${
                validity.civility === false ? " border border-red-600" : ""
              }`}
            ></span>
            Madame
          </label>
          <label className="flex items-center gap-2 cursor-pointer relative">
            <input
              type="radio"
              name="civility"
              value="monsieur"
              className="custom-radio-input"
              onChange={() => setValidity((v) => ({ ...v, civility: true }))}
            />
            <span
              className={`custom-radio${
                validity.civility === false ? " border border-red-600" : ""
              }`}
            ></span>
            Monsieur
          </label>
        </div>
        <div className="flex gap-16">
          <Input
            placeholder="Prénom"
            name="firstname"
            required
            successIcon={<Success />}
            errorIcon={<Error />}
            zodSchema={firstnameSchema}
            valid={validity.firstname}
            className={validity.firstname === false ? "error-animate" : ""}
          />
          <Input
            placeholder="Nom"
            name="lastname"
            required
            successIcon={<Success />}
            errorIcon={<Error />}
            zodSchema={lastnameSchema}
            valid={validity.lastname}
            className={validity.lastname === false ? "error-animate" : ""}
          />
        </div>
        <div className="flex gap-16 items-end">
          <Input
            placeholder="E-mail"
            name="email"
            type="email"
            required
            successIcon={<Success />}
            errorIcon={<Error />}
            zodSchema={emailSchema}
            valid={validity.email}
            className={validity.email === false ? "error-animate" : ""}
          />
          <Input
            placeholder="Date de naissance"
            name="birthdate"
            type="date"
            suffixe="(+ de 18 ans)"
            required
            successIcon={<Success />}
            errorIcon={<Error />}
            zodSchema={birthdateSchema}
            valid={validity.birthdate}
            className={validity.birthdate === false ? "error-animate" : ""}
          />
        </div>
        <hr className=" border-copygray my-16" />
        <div className="flex gap-8 mt-4">
          <label className="flex items-start gap-2 flex-1 text-sm">
            <span
              className={`inline-flex items-center justify-center ${
                validity.accept === false
                  ? "border-2 border-red-600 rounded error-animate"
                  : ""
              }`}
              style={{
                width: 24,
                height: 24,
                minWidth: 24,
                minHeight: 24,
                marginTop: 2,
              }}
            >
              <input
                type="checkbox"
                name="accept"
                className="accent-red-600 size-6"
                style={{ width: 20, height: 20 }}
                onChange={(e) =>
                  setValidity((v) => ({ ...v, accept: e.target.checked }))
                }
              />
            </span>
            <span>
              En participant, je reconnais avoir lu et accepté le{" "}
              <a href="#" className="underline">
                règlement
              </a>{" "}
              du concours et la{" "}
              <a href="#" className="font-bold underline">
                politique de confidentialité
              </a>{" "}
              de Cofidis.
            </span>
          </label>
          <label className="flex items-start gap-2 flex-1 text-sm">
            <span
              className={`inline-flex items-center justify-center ${
                validity.offers === false
                  ? "border-2 border-red-600 rounded error-animate"
                  : ""
              }`}
              style={{
                width: 24,
                height: 24,
                minWidth: 24,
                minHeight: 24,
                marginTop: 2,
              }}
            >
              <input
                type="checkbox"
                name="offers"
                className="accent-red-600 size-6"
                style={{ width: 20, height: 20 }}
                onChange={(e) =>
                  setValidity((v) => ({ ...v, offers: e.target.checked }))
                }
              />
            </span>
            <span>
              Je confirme qu’il s’agit bien des moyens de contact sur lesquels
              Cofidis pourrait m’envoyer des offres commerciales.
            </span>
          </label>
        </div>
        <Button className="w-min mx-auto" type="submit">
          Valider
        </Button>
      </form>
      <Footer />
    </div>
  );
};

export default Page;
