export interface Prayer {
  id: string;
  title: string;
  content: string;
  arabic?: string;
  meaning?: string;
}

export const PRAYERS: Prayer[] = [
  {
    id: '1',
    title: 'Evden Çıkarken Okunacak Dua',
    content: 'Bismillâhi tevekkeltü alallâh, lâ havle ve lâ kuvvete illâ billâh.',
    meaning: 'Allah’ın adıyla. Allah’a tevekkül ettim. Güç ve kuvvet ancak Allah’tandır.',
  },
  {
    id: '2',
    title: 'Nazar Duası',
    content: 'Ve in yekâdullezîne keferû le yuzlikûneke bi ebsârihim lemmâ semiûz zikra ve yekûlûne innehu le mecnûn. Ve mâ huve illâ zikrun lil âlemîn.',
    meaning: 'Şüphesiz inkâr edenler Zikr’i (Kur’an’ı) duydukları zaman neredeyse seni gözleriyle devirecekler. (Senin için,) “Hiç şüphe yok o bir delidir” diyorlar. Oysa o (Kur’an), âlemler için ancak bir öğüttür.',
  },
  {
    id: '3',
    title: 'Uyku Duası',
    content: 'Bismike Allâhümme emûtü ve ahyâ.',
    meaning: 'Allah’ım! Senin isminle ölür, senin isminle dirilirim (uyur ve uyanırım).',
  },
  {
    id: '4',
    title: 'Yatmadan Önce Okunacaklar',
    content: 'Fatiha, İhlas, Felak ve Nas sureleri okunabilir. Ayrıca Ayetel Kürsi okunması tavsiye edilir.',
    meaning: 'Peygamber Efendimiz (s.a.v) yatmadan önce bu sureleri okuyup avuçlarına üfler ve vücuduna sürerdi.',
  },
  {
    id: '5',
    title: 'Zihin Açıklığı Duası',
    content: 'Rabbişrah lî sadrî. Ve yessir lî emrî. Vahlul ukdeten min lisânî. Yefkahû kavlî.',
    meaning: 'Rabbim! Göğsümü genişlet, işimi kolaylaştır, dilimdeki düğümü çöz ki sözümü anlasınlar.',
  },
].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
