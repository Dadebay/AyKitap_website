import type { BannerFixture } from "@/lib/types";

export const banners: BannerFixture[] = [
  {
    id: 1,
    title: {
      tk: "20% Arzanladyş Ýyllyk Abuna",
      tr: "%20 İndirim Yıllık Abonelik",
      ru: "Скидка 20% на годовую подписку",
    },
    subtitle: {
      tk: "Diňe şu hepde — pursatdan peýdalanyň",
      tr: "Sadece bu hafta — fırsatı kaçırmayın",
      ru: "Только на этой неделе — не упустите шанс",
    },
    badge: { tk: "Aksiýa", tr: "Kampanya", ru: "Акция" },
    website_image: "/banners/banner_01.jpg",
    link: "/books",
    book_id: null,
    order: 1,
  },
  {
    id: 2,
    title: {
      tk: "Synag kitaplary — mugt okaň",
      tr: "Deneme kitapları — ücretsiz okuyun",
      ru: "Пробные книги — читайте бесплатно",
    },
    subtitle: {
      tk: "Hasap açmazdan öň platformany synap görüň",
      tr: "Hesap açmadan önce platformu deneyin",
      ru: "Попробуйте платформу до регистрации",
    },
    badge: { tk: "Mugt", tr: "Ücretsiz", ru: "Бесплатно" },
    website_image: "/banners/banner_02.jpg",
    link: "/books?free=1",
    book_id: null,
    order: 2,
  },
  {
    id: 3,
    title: {
      tk: "Täze gelen kitaplar",
      tr: "Yeni gelen kitaplar",
      ru: "Новые поступления",
    },
    subtitle: {
      tk: "Iň täze eserler siziň üçin ýygnaldy",
      tr: "En yeni eserler sizin için derlendi",
      ru: "Самые свежие произведения — для вас",
    },
    badge: { tk: "Täze", tr: "Yeni", ru: "Новинки" },
    website_image: "/banners/banner_03.jpg",
    link: "/books?sort=yearNew",
    book_id: null,
    order: 3,
  },
  {
    id: 4,
    title: {
      tk: "Hepdäniň bestselleri",
      tr: "Haftanın çok satanı",
      ru: "Бестселлер недели",
    },
    subtitle: {
      tk: "«Garaşan gije» — okyjylaryň saýlany",
      tr: "«Bekleyen Gece» — okuyucuların seçimi",
      ru: "«Ночь ожидания» — выбор читателей",
    },
    badge: { tk: "Bestseller", tr: "Çok satan", ru: "Бестселлер" },
    website_image: "/banners/banner_04.jpg",
    link: null,
    book_id: 12,
    order: 4,
  },
];
