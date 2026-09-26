"use client";

import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";

type EducationMascotProps = {
  className?: string;
};

export function EducationMascot({ className }: EducationMascotProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/lottie/education-mascot.json")
      .then((response) => {
        if (!response.ok) throw new Error("Không tải được animation");
        return response.json() as Promise<object>;
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!animationData) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <Lottie
      src={animationData}
      loop
      autoplay
      className={className}
      style={{ background: "transparent" }}
      aria-hidden
    />
  );
}
