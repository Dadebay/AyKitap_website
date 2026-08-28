import type { BookLanguageFixture } from "@/lib/types";

export const bookLanguages: BookLanguageFixture[] = [
  {
    id: 1,
    code: "tk",
    name: { tk: "Türkmen dili", tr: "Türkmence", ru: "Туркменский" },
  },
  {
    id: 2,
    code: "tr",
    name: { tk: "Türk dili", tr: "Türkçe", ru: "Турецкий" },
  },
  {
    id: 3,
    code: "ru",
    name: { tk: "Rus dili", tr: "Rusça", ru: "Русский" },
  },
  {
    id: 4,
    code: "en",
    name: { tk: "Iňlis dili", tr: "İngilizce", ru: "Английский" },
  },
  {
    id: 5,
    code: "other",
    name: { tk: "Beýleki", tr: "Diğer", ru: "Другой" },
  },
];
