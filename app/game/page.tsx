"use client";
import { NextPage } from "next";
import LevelCard from "@/components/LevelCard";
import RewardCard from "@/components/RewardCard";
import StarsCounter from "@/components/StarsCounter";
import Button from "@/components/Button";

const Page: NextPage = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <h2 className=" text-2xl font-medium mb-8 decoratedYellow px-10 decoratedYellow mt-15">
        Bonjour
      </h2>
      <p className="text-md text-black max-w-xl text-center">
        Embarquez dans un voyage à travers les 40 ans de Cofidis avec Sunny
        Marie et collectez un maximum de soleils.
      </p>
      <div className="flex gap-7">
        <LevelCard
          id="1"
          imageSrc="/image/level-1.jpg"
          year="1985"
          maxStars={9}
        />
        <LevelCard
          id="2"
          imageSrc="/image/level-2.png"
          year="1995"
          maxStars={3}
        />
        <LevelCard
          id="3"
          imageSrc="/image/level-3.png"
          year="2005"
          maxStars={3}
          next={true}
        />
        <LevelCard
          id="4"
          imageSrc="/image/level-4.png"
          year="2025"
          maxStars={3}
          disabled={true}
        />
        <RewardCard disabled={true} />
      </div>
      <StarsCounter className="mt-9 mb-9 w-1/2" max={40} count={13} />
      <Button redirect="" className="mt-10 mb-20">
        Continuer
      </Button>
    </div>
  );
};

export default Page;
