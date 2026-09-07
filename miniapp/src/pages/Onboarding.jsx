import { useState } from "react";
import { haptic } from "../telegram.js";

const SLIDES = [
  {
    emoji: "🍕",
    title: "Sizni ochlik qiynayaptimi?",
    text: "Biz issiqqina pizzalarni tezkor yetkazamiz.",
  },
  {
    emoji: "🛵",
    title: "Bu qanday ishlaydi?",
    text: "Tanlang, buyurtma bering va rohatlaning.",
  },
  {
    emoji: "🎉",
    title: "10,000+ odam",
    text: "allaqachon biz bilan. Siz ham qo'shiling!",
  },
];

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const next = () => {
    haptic();
    if (isLast) onFinish();
    else setStep((s) => s + 1);
  };

  return (
    <div className="onb">
      <button className="onb__skip" onClick={onFinish}>
        {isLast ? "" : "O'tkazib yuborish"}
      </button>

      <div className="onb__body">
        <div className="onb__art" key={step}>
          {slide.emoji}
        </div>
        <h1 className="onb__title">{slide.title}</h1>
        <p className="onb__text">{slide.text}</p>
      </div>

      <div className="onb__dots">
        {SLIDES.map((_, i) => (
          <div key={i} className={"dot" + (i === step ? " dot--on" : "")} />
        ))}
      </div>

      <button className="btn" onClick={next}>
        {isLast ? "Boshla" : "Keyingisi"}
      </button>
    </div>
  );
}
