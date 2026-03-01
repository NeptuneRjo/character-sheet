"use client";

import { Character } from "@/lib/types";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      fetch("/api/characters", { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          setCharacters(data as Character[]);
          setIsLoading(false);
        })
        .catch((err) => console.log(err));
    })();
  }, []);

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {characters.map(({ name, character_uid }, key) => (
        <a
          key={key}
          href={`/character/${character_uid}`}
          className="group flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#19130d] px-6 py-5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-[#8b6a3f] hover:bg-[#21180f] hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)]"
        >
          <div>
            <p className="text-lg font-semibold text-[#f0e4cf]">{name}</p>
            <p className="text-sm text-[#b7a387]">Open character sheet</p>
          </div>
          <span className="text-sm font-medium text-[#b08a5a] transition group-hover:text-[#f0d9a8]">
            View →
          </span>
        </a>
      ))}
    </div>
  );
};

export default Dashboard;
