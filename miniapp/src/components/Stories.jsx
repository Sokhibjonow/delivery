import { useState } from "react";
import { haptic } from "../telegram.js";

const STORIES = [
  {
    id: 1,
    emoji: "🔥",
    label: "Chegirma",
    title: "Bugun -30%",
    text: "Barcha klassik pizzalarga bugun kechgacha 30% chegirma amal qiladi.",
  },
  {
    id: 2,
    emoji: "🆕",
    label: "Yangi",
    title: "Qazi pizza",
    text: "Milliy ta'mdagi yangi pizzamizni birinchilardan bo'lib tatib ko'ring.",
  },
  {
    id: 3,
    emoji: "🚀",
    label: "Tezkor",
    title: "30 daqiqa",
    text: "Buyurtmangizni 30 daqiqa ichida issiqligicha yetkazib beramiz.",
  },
  {
    id: 4,
    emoji: "🎁",
    label: "Sovg'a",
    title: "Bepul ichimlik",
    text: "100 000 so'mdan yuqori buyurtmaga Coca-Cola bepul.",
  },
  {
    id: 5,
    emoji: "⭐",
    label: "Top",
    title: "Eng ko'p tanlangan",
    text: "Peperoni — mijozlarimiz eng ko'p buyurtma qiladigan pizza.",
  },
];

export default function Stories() {
  const [active, setActive] = useState(null);
  const [seen, setSeen] = useState([]);

  const open = (story) => {
    haptic();
    setActive(story);
    setSeen((s) => (s.includes(story.id) ? s : [...s, story.id]));
  };

  return (
    <>
      <div className="stories">
        {STORIES.map((s) => (
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
