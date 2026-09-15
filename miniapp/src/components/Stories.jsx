import { useState } from "react";
import { haptic } from "../telegram.js";
import { useLang } from "../i18n.js";

export default function Stories() {
  const { t } = useLang();
  const [active, setActive] = useState(null);
  const [seen, setSeen] = useState([]);

  const stories = [
    { id: 1, emoji: "🔥", label: t("st1Label"), title: t("st1Title"), text: t("st1Text") },
    { id: 2, emoji: "🆕", label: t("st2Label"), title: t("st2Title"), text: t("st2Text") },
    { id: 3, emoji: "🚀", label: t("st3Label"), title: t("st3Title"), text: t("st3Text") },
    { id: 4, emoji: "🎁", label: t("st4Label"), title: t("st4Title"), text: t("st4Text") },
    { id: 5, emoji: "⭐", label: t("st5Label"), title: t("st5Title"), text: t("st5Text") },
  ];

  const open = (story) => {
    haptic();
    setActive(story);
    setSeen((s) => (s.includes(story.id) ? s : [...s, story.id]));
  };

  return (
    <>
      <div className="stories">
        {stories.map((s) => (
          <button key={s.id} className="story" onClick={() => open(s)}>
            <div
              className={
                "story__ring" + (seen.includes(s.id) ? " story__ring--seen" : "")
              }
            >
              <div className="story__inner">{s.emoji}</div>
            </div>
            <div className="story__label">{s.label}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="story-view" onClick={() => setActive(null)}>
          <button className="story-view__close">×</button>
          <div className="story-view__emoji">{active.emoji}</div>
          <div className="story-view__title">{active.title}</div>
          <p className="story-view__text">{active.text}</p>
        </div>
      )}
    </>
  );
}
