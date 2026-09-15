import { useState } from "react";
import { haptic } from "../telegram.js";
import { useLang, LANGS, MULTILANG } from "../i18n.js";

export default function Onboarding({ onFinish, onChangeLang }) {
  const { lang, t } = useLang();
  const [step, setStep] = useState(0);

  const slides = [
    { emoji: "🍕", title: t("onb1Title"), text: t("onb1Text") },
    { emoji: "🛵", title: t("onb2Title"), text: t("onb2Text") },
    { emoji: "🎉", title: t("onb3Title"), text: t("onb3Text") },
  ];

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const next = () => {
    haptic();
    if (isLast) onFinish();
    else setStep((s) => s + 1);
  };

  return (
    <div className="onb">
      <div className="onb__top">
        {MULTILANG ? (
          <div className="lang-switch lang-switch--sm">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={"lang-btn" + (lang === l.code ? " lang-btn--on" : "")}
                onClick={() => {
                  haptic();
                  onChangeLang(l.code);
                }}
              >
                {l.short}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}

        <button className="onb__skip" onClick={onFinish}>
          {isLast ? "" : t("skip")}
        </button>
      </div>

      <div className="onb__body">
        <div className="onb__art" key={step}>
          {slide.emoji}
        </div>
        <h1 className="onb__title">{slide.title}</h1>
        <p className="onb__text">{slide.text}</p>
      </div>

      <div className="onb__dots">
        {slides.map((_, i) => (
          <div key={i} className={"dot" + (i === step ? " dot--on" : "")} />
        ))}
      </div>

      <button className="btn" onClick={next}>
        {isLast ? t("start") : t("next")}
      </button>
    </div>
  );
}
