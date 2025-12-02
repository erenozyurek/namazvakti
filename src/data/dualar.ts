export type Dua = {
  id: string;
  name: string;
  arabic: string;
  turkish: string;
  meaning: string;
};

export const DUALAR: Dua[] = [
  // --- ÖNCEKİLER ---
  {
    id: 'nazar',
    name: 'Nazar Ayeti (Kalem Suresi)',
    arabic: 'وَإِن يَكَادُ الَّذِينَ كَفَرُوا لَيُزْلِقُونَكَ بِأَبْصَارِهِمْ لَمَّا سَمِعُوا الذِّكْرَ وَيَقُولُونَ إِنَّهُ لَمَجْنُونٌ وَمَا هُوَ إِلَّا ذِكْرٌ لِّلْعَالَمِينَ',
    turkish: 'Ve in yekâdullezîne keferû leyuzlikûneke bi ebsârihim lemmâ semiûz zikra ve yekûlûne innehu le mecnûn. Ve mâ huve illâ zikrun lil âlemîn.',
    meaning: 'O inkâr edenler Zikr’i (Kur’an’ı) işittikleri zaman, neredeyse seni gözleriyle devireceklerdi. Hâlâ da (kin ve hasetlerinden): “Hiç şüphe yok o bir delidir” derler. Oysa o (Kur’an), âlemler için ancak bir öğüttür.'
  },
  {
    id: 'ayetel-kursi',
    name: 'Ayetel Kürsi (Koruyucu Dua)',
    arabic: 'اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    turkish: 'Allâhü lâ ilâhe illâ hüvel hayyül kayyûm, lâ te’huzühu sinetün velâ nevm, lehu mâ fissemâvâti ve mâ fil ard, men zellezî yeşfeu indehu illâ bi iznih, ya’lemü mâ beyne eydîhim ve mâ halfehüm, velâ yuhîtûne bi şey’in min ilmihi illâ bimâ şâe vesia kürsiyyühüs semâvâti vel ard, velâ yeûdühü hıfzuhümâ ve hüvel aliyyül azîm.',
    meaning: 'Allah, O’ndan başka ilah yoktur; O, Hayy’dır ve Kayyûm’dur. O’nu ne bir uyuklama ne de bir uyku tutar. Göklerde ve yerde ne varsa O’nundur. İzni olmadan O’nun katında kim şefaat edebilir? O, kullarının yaptıklarını ve yapacaklarını bilir. O’nun kürsüsü gökleri ve yeri kaplamıştır. Onları koruyup gözetmek O’na ağır gelmez. O, Aliyy’dir, Azîm’dir.'
  },
  {
    id: 'yemek',
    name: 'Sofra (Yemek) Duası',
    arabic: 'الْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ، اللّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
    turkish: 'Elhamdülillâhillezî et’amenâ ve sekânâ ve cealenâ minel müslimîn. Allahümme bârik lenâ fîmâ razaktenâ ve kınâ azâben-nâr.',
    meaning: 'Bizi yediren, içiren ve bizi Müslümanlardan kılan Allah’a hamdolsun. Allah’ım! Bize verdiğin rızkı bereketli kıl ve bizi cehennem azabından koru.'
  },
  {
    id: 'bereket',
    name: 'Bereket (Karınca) Duası',
    arabic: 'اللّهُمَّ يَا رَبِّ جَبْرَائِيلَ وَمِيكَائِيلَ وَإِسْرَافِيلَ وَعَزْرَائِيلَ وَإِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ وَيَعْقُوبَ وَمُنْزِلَ الْبَرَكَاتِ وَالتَّوْرَاةِ وَالزَّبُورِ وَالْإِنْجِيلِ وَالْفُرْقَانِ',
    turkish: 'Allahümme yâ Rabbi Cebrâîle ve Mîkâîle ve İsrâfîle ve Azrâîle ve İbrâhîme ve İsmâîle ve İshâka ve Ya’kûbe ve münzilel berakâti vet Tevrâti vez Zebûri vel İncîli vel Furkân.',
    meaning: 'Ey dört büyük meleğin ve peygamberlerin Rabbi olan Allah’ım! Ey bereketleri ve kutsal kitapları indiren Rabbim! (Bana hayırlı rızık ver.)'
  },
  {
    id: 'uyku',
    name: 'Uyku Duası (Teslimiyet)',
    arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ',
    turkish: 'Allahümme eslemtü nefsî ileyke ve fevvadtu emrî ileyke ve elce’tü zahrî ileyke, rağbeten ve rahbeten ileyke, lâ melcee ve lâ mencâ minke illâ ileyke.',
    meaning: 'Allah’ım! Kendimi sana teslim ettim. İşimi sana havale ettim. Senden başka sığınacak ve kurtulacak hiçbir yer yoktur.'
  },
  {
    id: 'sabah',
    name: 'Sabah Duası (Korunma)',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    turkish: 'Asbahnâ ve asbahal mülkü lillâhi velhamdülillâhi lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehül mülkü ve lehül hamdü ve hüve alâ külli şey’in kadîr.',
    meaning: 'Sabaha kavuştuk, mülk de Allah’ın olarak sabaha ulaştı. Hamd Allah’a mahsustur. O tektir, ortağı yoktur. Mülk O’nundur. O’nun her şeye gücü yeter.'
  },

  // --- YENİ EKLENENLER ---

  {
    id: 'sifa',
    name: 'Şifa Duası',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',
    turkish: 'Allahümme rabben-nâsi ezhibil-be’se işfi ente’ş-şâfî lâ şifâe illâ şifâuke şifâen lâ yugâdiru sekamen.',
    meaning: 'Ey insanların Rabbi olan Allah’ım! Bu hastalığı gider. Şifa ver, çünkü şifa veren sensin. Senin vereceğin şifadan başka şifa yoktur. Öyle bir şifa ver ki hiç hastalık izi bırakmasın.'
  },
  {
    id: 'sikinti',
    name: 'Sıkıntı Duası (Hz. Yunus)',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    turkish: 'Lâ ilâhe illâ ente sübhâneke innî küntü minez-zâlimîn.',
    meaning: 'Senden başka ilah yoktur. Seni tenzih ederim. Muhakkak ki ben (nefsime) zulmedenlerden oldum.'
  },
  {
    id: 'basari',
    name: 'Zihin Açıklığı ve Başarı (Taha Suresi)',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    turkish: 'Rabbişrah lî sadrî ve yessir lî emrî vahlul ukdeten min lisânî yefkahû kavlî.',
    meaning: 'Rabbim! Göğsümü genişlet, işimi kolaylaştır. Dilimdeki düğümü çöz ki sözümü iyice anlasınlar.'
  },
  {
    id: 'yolculuk',
    name: 'Yolculuk Duası',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
    turkish: 'Sübhanellezî sahhara lenâ hâzâ ve mâ künnâ lehû mukrinîn. Ve innâ ilâ Rabbinâ le münkalibûn.',
    meaning: 'Bunu bizim hizmetimize veren Allah’ı tesbih ederiz; yoksa biz buna güç yetiremezdik. Muhakkak ki biz Rabbimize döneceğiz.'
  }
];