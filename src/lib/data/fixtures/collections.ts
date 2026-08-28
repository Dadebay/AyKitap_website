import type { CollectionFixture, SeriesFixture } from "@/lib/types";

export const collections: CollectionFixture[] = [
  {
    id: 1,
    name: { tk: "Film + Kitap", tr: "Film + Kitap", ru: "Фильм + Книга" },
    sub_title: {
      tk: "Ekranlaşdyrylan eserler",
      tr: "Beyaz perdeye uyarlanan eserler",
      ru: "Экранизированные произведения",
    },
    icon: "🎬",
    bookIds: [1, 3, 5, 9, 11, 12, 14, 16],
  },
  {
    id: 2,
    name: {
      tk: "Nobel baýrakly",
      tr: "Nobel ödüllü",
      ru: "Нобелевские лауреаты",
    },
    sub_title: {
      tk: "Dünýä edebiýatynyň naýbaşylary",
      tr: "Dünya edebiyatının zirvesi",
      ru: "Вершина мировой литературы",
    },
    icon: "🏅",
    bookIds: [2, 4, 6, 8, 10, 13, 15],
  },
];

export const series: SeriesFixture[] = [
  {
    id: 1,
    name: {
      tk: "Talisman Akademiýasy",
      tr: "Tılsım Akademisi",
      ru: "Академия Талисмана",
    },
    image: "/book-images/cover_10.jpg",
    bookIds: [5, 7, 10, 1, 3, 12, 16],
  },
  {
    id: 2,
    name: { tk: "Altyn kitaphana", tr: "Altın Kütüphane", ru: "Золотая библиотека" },
    image: "/book-images/cover_11.jpg",
    bookIds: [2, 4, 6, 8, 9, 11, 13, 14, 15],
  },
];
