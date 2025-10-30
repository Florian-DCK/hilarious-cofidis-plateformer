"use client";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import LevelCard from "@/components/LevelCard";
import RewardCard from "@/components/RewardCard";
import StarsCounter from "@/components/StarsCounter";
import Button from "@/components/Button";

const Page: NextPage = () => {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          setProgress(data);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          setProgress([]);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setProgress([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-2xl font-medium mb-8">Chargement...</div>
      </div>
    );
  }

  // S'assurer que progress n'est pas null avant de rendre le contenu
  if (!progress || !progress.levels) {
    return (
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-2xl font-medium mb-8 decoratedYellow px-10 decoratedYellow mt-15">
          Erreur de chargement
        </h2>
        <p className="text-md text-black max-w-xl text-center">
          Impossible de charger vos progrès. Veuillez rafraîchir la page.
        </p>
      </div>
    );
  }

  // Calculer le total d'étoiles collectées
  const totalStars = progress.levels.reduce((total: number, level: any) => {
    const stars = level.numberOfStarsCollected;
    return total + (stars !== null ? stars : 0);
  }, 0);

  return (
    <div className="flex flex-col justify-center items-center">
      <h2 className=" text-2xl font-medium mb-8 decoratedYellow px-10 decoratedYellow mt-15">
        {progress && !progress.levels[0].completed ? `Bonjour` : "Bravo"}
      </h2>
      <p className="text-md text-black max-w-xl text-center">
        {progress && !progress.levels[0].completed
          ? `Embarquez dans un voyage à travers les 40 ans de Cofidis avec Sunny Marie et collectez un maximum de soleils.`
          : progress.nextLevel
          ? `Niveau ${
              parseInt(progress.nextLevel) - 1
            } terminé ! Continuez comme ça.`
          : `Félicitations ! Vous avez terminé tous les niveaux !`}
      </p>
      <div className="flex gap-7">
        <LevelCard
          id="1"
          imageSrc="/image/level-1.jpg"
          year="1985"
          maxStars={9}
          next={progress.nextLevel === "1"}
          disabled={
            progress.nextLevel ? parseInt(progress.nextLevel) < 1 : false
          }
        />
        <LevelCard
          id="2"
          imageSrc="/image/level-2.png"
          year="1995"
          maxStars={3}
          next={progress.nextLevel === "2"}
          disabled={
            progress.nextLevel ? parseInt(progress.nextLevel) < 2 : true
          }
        />
        <LevelCard
          id="3"
          imageSrc="/image/level-3.png"
          year="2005"
          maxStars={3}
          next={progress.nextLevel === "3"}
          disabled={
            progress.nextLevel ? parseInt(progress.nextLevel) < 3 : true
          }
        />
        <LevelCard
          id="4"
          imageSrc="/image/level-4.png"
          year="2025"
          maxStars={3}
          next={progress.nextLevel === "4"}
          disabled={
            progress.nextLevel ? parseInt(progress.nextLevel) < 4 : true
          }
        />
        <RewardCard disabled={progress.finished ? false : true} />
      </div>
      <StarsCounter className="mt-9 mb-9 w-1/2" max={40} count={totalStars} />
      <Button redirect={`game/${progress.nextLevel}`} className="mt-10 mb-20">
        Continuer
      </Button>
    </div>
  );
};

export default Page;
