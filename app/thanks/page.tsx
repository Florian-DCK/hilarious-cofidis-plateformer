"use client";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import Input from "@/components/Input";
import ArrowYellow from "@/components/svg/ArrowYellow";
import Button from "@/components/Button";
import Image from "next/image";
import Footer from "@/components/Footer";

const Page: NextPage = () => {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subsidaryShown, setSubsidaryShown] = useState(false);
  useEffect(() => {
    fetch("/api/getProgress")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        try {
          const data = text ? JSON.parse(text) : [];
          console.log("API Response:", data);
          setProgress(data);
          // Check subsidary status from the actual data, not the state
          if (data && data.subsidary === null) {
            setSubsidaryShown(true);
          } else {
            setSubsidaryShown(false);
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          setProgress([]);
          setSubsidaryShown(false);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setProgress([]);
        setSubsidaryShown(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log("Progress state updated:", progress);
  }, [progress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch("/api/thanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subsidary: (e.target as any)[0].value }),
    });
    setSubsidaryShown(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {subsidaryShown && (
        <div className="flex flex-col justify-center items-center pt-10">
          <h2 className="decoratedYellow text-2xl mb-5">
            Question subsidiaire
          </h2>
          <p className=" font-light text-xl mb-10">
            Quel est le poids total des objets présents sur cette image ?
          </p>
          <div className=" size-96">
            <img
              src="/image/subsidary-question-image.jpg"
              alt="Subsidary Question"
              className="border-2 border-red rounded-full overflow-hidden"
            />
            <form onSubmit={handleSubmit}>
              <Input
                placeholder="Grammes"
                className="mt-5 mb-5 py-2 px-5 w-full"
                suffixe={<ArrowYellow />}
                suffixeIsSubmit
              />
            </form>
          </div>
        </div>
      )}
      {!subsidaryShown && (
        <div className="items-center justify-center font-sans">
          <div className="flex items-center justify-center font-sans">
            <section className="items-start flex flex-col mr-20">
              <h1 className="text-4xl font-medium mb-1 decoratedRed py-2">
                MERCI D'AVOIR PARTICIPE
              </h1>
              <h1 className="text-3xl font-medium mb-8 ml-16 decoratedYellow py-3">
                à cette aventure !
              </h1>
              <p className="text-lg font-light text-black max-w-md">
                Nous vous contacterons si vous faites partie des gagnants pour
                vous remettre le prix en main propre.
              </p>
              <Button redirect="" className="mt-4">
                Améliorer mon score
              </Button>
            </section>
            <section>
              <Image
                src="/image/homeHero.png"
                width={770}
                height={851}
                alt="appareil photo"
                className="w-[600px]"
              />
            </section>
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Page;
