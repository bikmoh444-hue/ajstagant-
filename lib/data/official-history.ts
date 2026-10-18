// Contenus fournis par l’association. Les données publiées restent éditables en base.
export const officialHistory = {
 fr: {
  hero: {badge:'NOTRE HISTOIRE',title:'AJT TAGANT — Une nouvelle génération, une même passion',subtitle:'Fondée en 2026 à Tagant, Guelmim, Maroc',arabicSubtitle:'',description:"Fondée en 2026 à Tagant, dans la région de Guelmim, l'Association des Jeunes de Tagant est née de l'initiative d'un groupe de jeunes passionnés par le sport et animés par une ambition commune : promouvoir le football en salle et valoriser les talents de leur région."},
  sportsNote:{title:'TAGANT · FUTSAL',text:'Tagant, Guelmim, Maroc · Jaune et bleu'},
  originTitle:'Une passion qui rassemble',
  paragraphs:[
   "AJT TAGANT est une jeune association sportive créée en 2026 à l'initiative de plusieurs jeunes de Tagant.",
   "Sous la présidence de M. Faycal Waarab, l'association ambitionne de construire un projet sportif durable, fondé sur la formation, la discipline, le respect et l'esprit d'équipe.",
   "À travers le football en salle, nous souhaitons offrir aux jeunes un environnement favorable au développement de leurs compétences et à l'expression de leur potentiel.",
   "Notre aventure ne fait que commencer, mais notre ambition est de représenter dignement Tagant et de bâtir une équipe unie et compétitive."
  ],
  quote:'Une nouvelle génération, une même passion.',
  vision:{title:'NOTRE VISION',description:'Construire un club de football en salle reconnu pour son engagement envers les jeunes, son esprit sportif et sa contribution au développement du sport local.'},
  mission:{title:'NOTRE MISSION',description:'Encourager la pratique du football en salle, accompagner les jeunes talents et promouvoir les valeurs de solidarité, de discipline, de respect et de dépassement de soi.'},
  statistics:[
   {id:'foundation',label:'Année de fondation',value:'2026',sort_order:0,is_visible:true,is_demo:false},
   {id:'origin',label:'Notre origine',value:'Tagant',sort_order:10,is_visible:true,is_demo:false},
   {id:'discipline',label:'Notre discipline',value:'Futsal',sort_order:20,is_visible:true,is_demo:false}
  ],
  timelineTitle:'LES GRANDES ÉTAPES DU CLUB',galleryTitle:'LA VIE DE L’ASSOCIATION',valuesTitle:'NOS VALEURS',
  future:{title:'NOTRE AVENTURE COMMENCE',text:'Rejoignez un groupe de jeunes de Tagant pour construire ensemble notre avenir sportif.',joinLabel:'REJOINDRE L’ASSOCIATION',statutesLabel:'CONSULTER LES STATUTS',unavailableLabel:'Document officiel à fournir'},
 },
 ar: {
  hero:{badge:'قصتنا',title:'الجمعية الشبابية لرياضة تكانت — جيل جديد وطموح مشترك',subtitle:'تأسست سنة 2026 بتكانت، كلميم، المغرب',arabicSubtitle:'',description:'تأسست الجمعية الشبابية لرياضة تكانت سنة 2026 بمنطقة تكانت بمدينة كلميم، بمبادرة من مجموعة من شباب المنطقة الذين يجمعهم الشغف بالرياضة والطموح إلى تطوير كرة القدم داخل القاعة وإبراز المواهب المحلية.'},
  sportsNote:{title:'تكانت · كرة القدم داخل القاعة',text:'تكانت، كلميم، المغرب · الأصفر والأزرق'},
  originTitle:'شغف يجمعنا وطموح يوحدنا',
  paragraphs:[
   'الجمعية الشبابية لرياضة تكانت هي جمعية رياضية فتية تأسست سنة 2026 بمبادرة من مجموعة من شباب منطقة تكانت.',
   'تحت رئاسة السيد فيصل وعراب، تطمح الجمعية إلى بناء مشروع رياضي قائم على التكوين والانضباط والاحترام وروح الفريق.',
   'ومن خلال كرة القدم داخل القاعة، نسعى إلى توفير بيئة رياضية مناسبة تساعد الشباب على تطوير مهاراتهم وإبراز قدراتهم.',
   'رحلتنا ما زالت في بدايتها، لكن طموحنا هو تمثيل تكانت أحسن تمثيل وبناء فريق متماسك وتنافسي.'
  ],
  quote:'جيل جديد وطموح مشترك.',
  vision:{title:'رؤيتنا',description:'بناء فريق لكرة القدم داخل القاعة يتميز بروحه الرياضية واهتمامه بالشباب ومساهمته في تطوير الرياضة المحلية.'},
  mission:{title:'رسالتنا',description:'تشجيع ممارسة كرة القدم داخل القاعة، ومواكبة المواهب الشابة، وترسيخ قيم التضامن والانضباط والاحترام والعمل الجماعي والطموح.'},
  statistics:[
   {id:'foundation',label:'سنة التأسيس',value:'2026',sort_order:0,is_visible:true,is_demo:false},
   {id:'origin',label:'موطن الفريق',value:'تكانت',sort_order:10,is_visible:true,is_demo:false},
   {id:'discipline',label:'رياضتنا',value:'كرة القدم داخل القاعة',sort_order:20,is_visible:true,is_demo:false}
  ],
  timelineTitle:'محطات الجمعية',galleryTitle:'حياة الجمعية',valuesTitle:'قيمنا',
  future:{title:'رحلتنا في بدايتها',text:'انضموا إلى شباب تكانت لبناء مستقبلنا الرياضي معا.',joinLabel:'انضم إلى الجمعية',statutesLabel:'القانون الأساسي',unavailableLabel:'الوثيقة الرسمية قيد الإعداد'},
 }
};

export const officialValues = [
 {id:'official-passion',title_fr:'Passion',title_ar:'الشغف',description_fr:'Le sport est notre passion et notre source de motivation.',description_ar:'الرياضة شغفنا ومصدر حماسنا وطموحنا.',icon:'passion' as const},
 {id:'official-respect',title_fr:'Respect',title_ar:'الاحترام',description_fr:'Le respect de nos coéquipiers, adversaires et supporters est essentiel.',description_ar:'احترام زملائنا ومنافسينا وجماهيرنا من أهم مبادئنا.',icon:'respect' as const},
 {id:'official-solidarity',title_fr:'Solidarité',title_ar:'التضامن',description_fr:'Ensemble, nous avançons vers nos objectifs.',description_ar:'بروح التعاون والتضامن نمضي نحو تحقيق أهدافنا.',icon:'solidarity' as const},
 {id:'official-ambition',title_fr:'Ambition',title_ar:'الطموح',description_fr:'Nous travaillons pour progresser et construire notre avenir sportif.',description_ar:'نعمل باستمرار على التطور وبناء مستقبلنا الرياضي.',icon:'rigor' as const}
];
