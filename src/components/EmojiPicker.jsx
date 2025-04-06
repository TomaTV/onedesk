"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Smile,
  Heart,
  Dog,
  Apple,
  Clock,
  CookingPot,
  Trophy,
  Flag,
} from "lucide-react";

// Expanded and categorized emoji collection
const emojiCategories = [
  {
    icon: <Clock size={20} />,
    name: "Récents",
    emojis: [],
  },
  {
    icon: <Smile size={20} />,
    name: "Smileys & Émoticônes",
    emojis: [
      // Smileys & Emotion
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖",
      "😫",
      "😩",
      "🥺",
      "😢",
      "😭",
      "😤",
      "😠",
      "😡",
      "🤬",
      "🤯",
      "😳",
      "🥵",
      "🥶",
      "😱",
      "😨",
      "😰",
      "😥",
      "😓",
      "🤗",
      "🤔",
      "🤭",
      "🤫",
      "🤥",
      "😶",
      "😐",
      "😑",
      "😬",
      "🙄",
      "😯",
      "😦",
      "😧",
      "😮",
      "😲",
      "🥱",
      "😴",
      "🤤",
      "😪",
      "😵",
      "🤐",
      "🥴",
      "🤢",
      "🤮",
      "🤧",
      "😷",
      "🤒",
      "🤕",
      "🤑",
      "🤠",
      "😈",
      "👿",
      "👹",
      "👺",
      "🤡",
      "💩",
      "👻",
      "💀",
      "☠️",
      "👽",
      "👾",
      "🤖",
      "🎃",
      "😺",
      "😸",
      "😹",
      "😻",
      "😼",
      "😽",
      "🙀",
      "😿",
      "😾",
    ],
  },
  {
    icon: <Heart size={20} />,
    name: "Gestes & Corps",
    emojis: [
      // Gestures and Body Parts
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💅",
      "🤳",
      "💪",
      "🦾",
      "🦿",
      "👂",
      "🦻",
      "👃",
      "🧠",
      "🦷",
      "🦴",
      "👀",
      "👁️",
      "👄",
      "👅",
    ],
  },
  {
    icon: <Dog size={20} />,
    name: "Animaux & Nature",
    emojis: [
      // Animals & Nature
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐽",
      "🐸",
      "🐵",
      "🙈",
      "🙉",
      "🙊",
      "🐒",
      "🐔",
      "🐧",
      "🐦",
      "🐤",
      "🐣",
      "🐥",
      "🦆",
      "🦅",
      "🦉",
      "🦇",
      "🐺",
      "🐗",
      "🐴",
      "🦄",
      "🦓",
      "🦌",
      "🐝",
      "🦋",
      "🐌",
      "🐛",
      "🦟",
      "🦗",
      "🕷️",
      "🦂",
      "🥾",
      "🌵",
      "🎄",
      "🌲",
      "🌳",
      "🌴",
      "🌱",
      "🌿",
      "☘️",
      "🍀",
      "🌾",
      "🌺",
      "🌼",
      "🌷",
      "🌹",
      "🥀",
      "🍄",
      "🌞",
      "🌝",
      "🌙",
      "⭐",
      "🌟",
      "🌠",
      "☁️",
      "⛅",
      "❄️",
      "🌈",
      "💥",
      "💫",
      "✨",
    ],
  },
  {
    icon: <Apple size={20} />,
    name: "Nourriture & Boissons",
    emojis: [
      // Food & Drink
      "🍏",
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶️",
      "🌽",
      "🥕",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🥐",
      "🥯",
      "🍞",
      "🥖",
      "🥨",
      "🧀",
      "🥚",
      "🍳",
      "🧈",
      "🥞",
      "🧇",
      "🥩",
      "🍗",
      "🍖",
      "🥓",
      "🍔",
      "🍟",
      "🍕",
      "🌭",
      "🥪",
      "🌮",
      "🌯",
      "🫓",
      "🥙",
      "🧆",
      "🥘",
      "🍲",
      "🥣",
      "🥗",
      "🍿",
      "🧈",
      "🧂",
      "🥫",
      "🍱",
      "🍘",
      "🍙",
      "🍚",
      "🍛",
      "🍜",
      "🍝",
      "🍠",
      "🍢",
      "🍣",
      "🍤",
      "🍥",
      "🥮",
      "🍡",
      "🥟",
      "🥠",
      "🍦",
      "🍧",
      "🍨",
      "🍩",
      "🍪",
      "🎂",
      "🍰",
      "🧁",
      "🥧",
      "🍫",
      "🍬",
      "🍭",
      "🍮",
      "🍯",
      "🍼",
      "🥛",
      "☕",
      "🍵",
      "🍶",
      "🍾",
      "🍷",
      "🍸",
      "🍹",
      "🍺",
      "🍻",
      "🥂",
      "🥃",
      "🥄",
      "🍽️",
      "🥢",
    ],
  },
  {
    icon: <CookingPot size={20} />,
    name: "Activités",
    emojis: [
      // Activities
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🥅",
      "⛳",
      "🪁",
      "🏹",
      "🎣",
      "🤿",
      "🥊",
      "🥋",
      "🎽",
      "🛹",
      "🛷",
      "⛸️",
      "🥌",
      "🎿",
      "⛷️",
      "🏂",
      "🪂",
      "🏋️",
      "🤼",
      "🤸",
      "⛹️",
      "🤾",
      "🏌️",
      "🏄",
      "🏊",
      "🤽",
      "🚣",
      "🧗",
      "🚵",
      "🚴",
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "⚔️",
      "🏹",
      "🛡️",
      "🚀",
      "🛸",
      "🌋",
      "🏝️",
      "🏖️",
      "⛺",
      "🏕️",
      "🗻",
      "🏔️",
    ],
  },
  {
    icon: <Trophy size={20} />,
    name: "Objets",
    emojis: [
      // Objects
      "⌚",
      "📱",
      "📲",
      "💻",
      "⌨️",
      "🖥️",
      "🖨️",
      "🖱️",
      "🔌",
      "🔋",
      "📸",
      "💾",
      "💿",
      "📀",
      "🎥",
      "📹",
      "🎬",
      "📺",
      "📷",
      "📱",
      "🖲️",
      "🎮",
      "🎲",
      "🧩",
      "🧸",
      "🔊",
      "🎙️",
      "🎚️",
      "🎛️",
      "⏱️",
      "⏲️",
      "⌛",
      "⏰",
      "🕰️",
      "🌡️",
      "🧯",
      "🚪",
      "🛋️",
      "🪑",
      "🛏️",
      "🧸",
      "🛒",
      "🧱",
      "🔧",
      "🔨",
      "⛏️",
      "🛠️",
      "🧰",
      "🔩",
      "🧱",
      "⚙️",
      "🔬",
      "🔭",
      "🧯",
      "🧲",
      "🧪",
      "💉",
      "🩺",
      "🩹",
      "🧬",
      "🦠",
      "💊",
      "📡",
      "🛰️",
      "🚀",
    ],
  },
  {
    icon: <Flag size={20} />,
    name: "Drapeaux & Symboles",
    emojis: [
      // Flags and Symbols
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
      "⛎",
      "♈",
      "♉",
      "♊",
      "♋",
      "♌",
      "♍",
      "♎",
      "♏",
      "♐",
      "♑",
      "♒",
      "♓",
      "🆔",
      "🈳",
      "🈹",
      "🈲",
      "🉐",
      "🈶",
      "🈚",
      "🈸",
      "🈺",
      "🉑",
      "🈸",
      "🈴",
      "🈵",
      "🆚",
      "🆕",
      "🆙",
      "🆒",
      "🆓",
      "🆖",
      "🈁",
      "🔠",
      "🔡",
      "🔢",
      "🔣",
      "🔤",
      "🅰️",
      "🆎",
      "🅱️",
      "🆑",
      "🅾️",
      "🆘",
      "🚫",
      "⛔",
      "📛",
      "🚯",
      "🚱",
      "🚳",
      "🚷",
      "🚸",
      "⚠️",
      "🔞",
      "☢️",
      "☣️",
      "🛐",
      "⚛️",
      "🕎",
      "🔯",
      "🧡",
    ],
  },
];

const EmojiPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmojis, setFilteredEmojis] = useState([]);
  const [recentEmojis, setRecentEmojis] = useState([]);

  const searchInputRef = useRef(null);
  const categoryRefs = useRef({});

  useEffect(() => {
    const savedRecent = JSON.parse(
      localStorage.getItem("recentEmojis") || "[]"
    );
    setRecentEmojis(savedRecent);
    emojiCategories[0].emojis = savedRecent;
  }, []);

  const handleClickInside = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSelect = (emoji, e) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedRecent = [
      emoji,
      ...recentEmojis.filter((e) => e !== emoji),
    ].slice(0, 24);
    setRecentEmojis(updatedRecent);

    localStorage.setItem("recentEmojis", JSON.stringify(updatedRecent));
    emojiCategories[0].emojis = updatedRecent;

    onSelect(emoji);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredEmojis([]);
      return;
    }

    const results = [];
    const seenEmojis = new Set();

    emojiCategories.forEach((category) => {
      category.emojis.forEach((emoji) => {
        if (!seenEmojis.has(emoji)) {
          results.push(emoji);
          seenEmojis.add(emoji);
        }
      });
    });

    setFilteredEmojis(results.slice(0, 42));
  };

  const scrollToCategory = (categoryIndex) => {
    const categoryRef = categoryRefs.current[categoryIndex];
    if (categoryRef) {
      categoryRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-xl border border-gray-200 w-[440px] overflow-hidden"
      style={{ maxHeight: "400px" }}
      onClick={handleClickInside}
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900">
          Choisir un emoji
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Rechercher un emoji..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
      </div>

      <div className="relative">
        <div className="flex overflow-x-auto py-2 pl-2 border-b border-gray-200 no-scrollbar text-black">
          {emojiCategories.map((category, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToCategory(index);
              }}
              className={`flex-shrink-0 px-3 py-1 mr-1 text-xs rounded-md flex items-center space-x-1 text-gray-600 hover:bg-gray-50`}
            >
              {category.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 overflow-y-auto" style={{ maxHeight: "280px" }}>
        {searchTerm ? (
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2 px-1">
              {filteredEmojis.length > 0 ? "Résultats" : "Aucun résultat"}
            </h3>
            {filteredEmojis.length > 0 && (
              <div className="grid grid-cols-8 gap-0.5">
                {filteredEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-md text-xl"
                    onClick={(e) => handleSelect(emoji, e)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {emojiCategories.map(
              (category, catIndex) =>
                category.emojis.length > 0 && (
                  <div
                    key={catIndex}
                    ref={(el) => (categoryRefs.current[catIndex] = el)}
                    className="mb-4"
                  >
                    <div className="flex items-center mb-2 text-gray-700">
                      {category.icon}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-8 gap-0.5">
                      {category.emojis.map((emoji, emojiIndex) => (
                        <button
                          key={emojiIndex}
                          className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-md text-xl"
                          onClick={(e) => handleSelect(emoji, e)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;
