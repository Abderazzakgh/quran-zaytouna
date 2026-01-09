import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GraduationCap,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar,
  MapPin,
  Mic
} from "lucide-react";

interface Scholar {
  id: number;
  name: string;
  title: string;
  birthYear: string;
  deathYear: string;
  birthPlace: string;
  era: string;
  specialty: string[];
  bio: string;
  contributions: string[];
  books: { title: string; description: string }[];
  quotes: string[];
  type: "scholar" | "reciter";
}

const scholars: Scholar[] = [
  {
    id: 1,
    name: "محمد الطاهر بن عاشور",
    title: "شيخ الإسلام",
    birthYear: "1879",
    deathYear: "1973",
    birthPlace: "تونس العاصمة",
    era: "العصر الحديث",
    specialty: ["التفسير", "أصول الفقه", "اللغة العربية", "مقاصد الشريعة"],
    bio: "الإمام محمد الطاهر بن عاشور، شيخ جامع الزيتونة ورئيس المفتين المالكيين بتونس. يُعدّ من أبرز علماء الإسلام في العصر الحديث، وصاحب تفسير التحرير والتنوير الذي يُعتبر من أهم التفاسير المعاصرة.",
    contributions: [
      "تجديد علم مقاصد الشريعة",
      "إصلاح التعليم الزيتوني",
      "تأسيس منهج جديد في التفسير",
      "الجمع بين الأصالة والمعاصرة"
    ],
    books: [
      { title: "التحرير والتنوير", description: "تفسير شامل للقرآن الكريم في 30 مجلداً" },
      { title: "مقاصد الشريعة الإسلامية", description: "كتاب أصولي في مقاصد الشريعة" },
      { title: "أصول النظام الاجتماعي في الإسلام", description: "دراسة في الفكر الاجتماعي الإسلامي" },
      { title: "أليس الصبح بقريب", description: "كتاب في إصلاح التعليم الإسلامي" }
    ],
    quotes: [
      "إن القرآن كتاب هداية للناس جميعاً وليس لفئة دون فئة",
      "العلم هو السبيل إلى معرفة الحق والعمل به"
    ],
    type: "scholar"
  },
  {
    id: 2,
    name: "إبراهيم الرياحي",
    title: "شيخ الإسلام",
    birthYear: "1766",
    deathYear: "1850",
    birthPlace: "تستور، تونس",
    era: "القرن التاسع عشر",
    specialty: ["الفقه المالكي", "الحديث", "التصوف"],
    bio: "الشيخ إبراهيم الرياحي، من أكابر علماء تونس وشيوخ جامع الزيتونة. كان عالماً موسوعياً جمع بين العلوم الشرعية والأدبية، وله مكانة كبيرة في تاريخ العلم التونسي.",
    contributions: [
      "تدريس العلوم الشرعية في الزيتونة",
      "تخريج أجيال من العلماء",
      "نشر المذهب المالكي",
      "الإصلاح الاجتماعي"
    ],
    books: [
      { title: "حاشية على شرح الخرشي", description: "شرح وتعليق على الفقه المالكي" },
      { title: "الديوان الشعري", description: "مجموعة قصائد في مدح النبي ﷺ" },
      { title: "رسائل في التصوف", description: "كتابات في السلوك والتزكية" }
    ],
    quotes: [
      "العلم نور يقذفه الله في قلب من يشاء من عباده",
      "التواضع رأس الفضائل"
    ],
    type: "scholar"
  },
  {
    id: 3,
    name: "محمد الخضر حسين",
    title: "شيخ الأزهر",
    birthYear: "1876",
    deathYear: "1958",
    birthPlace: "نفطة، تونس",
    era: "العصر الحديث",
    specialty: ["اللغة العربية", "الأدب", "الفكر الإسلامي"],
    bio: "الشيخ محمد الخضر حسين، عالم تونسي تولى مشيخة الأزهر الشريف. درس في جامع الزيتونة وأصبح من رموز الإصلاح والتجديد في العالم الإسلامي.",
    contributions: [
      "تولي مشيخة الأزهر الشريف",
      "الدفاع عن اللغة العربية",
      "مقاومة الاستعمار الفكري",
      "التجديد في الفكر الإسلامي"
    ],
    books: [
      { title: "نقض كتاب الإسلام وأصول الحكم", description: "رد على علي عبد الرازق" },
      { title: "الخيال في الشعر العربي", description: "دراسة أدبية نقدية" },
      { title: "رسائل الإصلاح", description: "مقالات في الإصلاح الديني والاجتماعي" }
    ],
    quotes: [
      "اللغة العربية أساس وحدة الأمة الإسلامية",
      "الإصلاح يبدأ من إصلاح النفوس"
    ],
    type: "scholar"
  },
  {
    id: 4,
    name: "محمد الفاضل بن عاشور",
    title: "شيخ جامع الزيتونة",
    birthYear: "1909",
    deathYear: "1970",
    birthPlace: "تونس العاصمة",
    era: "العصر الحديث",
    specialty: ["التفسير", "الفقه", "التاريخ الإسلامي"],
    bio: "الشيخ محمد الفاضل بن عاشور، نجل الإمام محمد الطاهر بن عاشور. تولى مشيخة جامع الزيتونة وكان من أبرز العلماء المجددين في تونس.",
    contributions: [
      "مشيخة جامع الزيتونة",
      "تطوير المناهج التعليمية",
      "التأليف في التاريخ الإسلامي",
      "نشر التراث التونسي"
    ],
    books: [
      { title: "الحركة الأدبية والفكرية في تونس", description: "دراسة تاريخية شاملة" },
      { title: "التفسير ورجاله", description: "دراسة في تاريخ التفسير" },
      { title: "أعلام الفكر الإسلامي في تاريخ المغرب العربي", description: "تراجم للعلماء" }
    ],
    quotes: [
      "التراث الإسلامي كنز يجب الحفاظ عليه وتجديده",
      "العلم أمانة في أعناق العلماء"
    ],
    type: "scholar"
  },
  {
    id: 5,
    name: "محمد البشير الإبراهيمي",
    title: "العلامة",
    birthYear: "1889",
    deathYear: "1965",
    birthPlace: "رأس الوادي، الجزائر",
    era: "العصر الحديث",
    specialty: ["اللغة العربية", "البلاغة", "الإصلاح"],
    bio: "العلامة محمد البشير الإبراهيمي، من تلاميذ جامع الزيتونة ورفيق الشيخ عبد الحميد بن باديس. كان من أبرز علماء الإصلاح في المغرب العربي.",
    contributions: [
      "تأسيس جمعية العلماء المسلمين",
      "الدفاع عن الهوية العربية الإسلامية",
      "محاربة الخرافات والبدع",
      "نشر التعليم العربي"
    ],
    books: [
      { title: "عيون البصائر", description: "مقالات إصلاحية" },
      { title: "آثار الإمام محمد البشير الإبراهيمي", description: "أعماله الكاملة" }
    ],
    quotes: [
      "الإسلام ديننا والعربية لغتنا والجزائر وطننا",
      "العلم سلاح الأمة في مواجهة التحديات"
    ],
    type: "scholar"
  },
  {
    id: 6,
    name: "علي البراق",
    title: "القارئ الشيخ",
    birthYear: "1930",
    deathYear: "2012",
    birthPlace: "صفاقس، تونس",
    era: "العصر الحديث",
    specialty: ["القراءات", "التجويد", "رواية قالون"],
    bio: "الشيخ علي البراق، من أشهر قراء القرآن الكريم في تونس برواية قالون عن نافع. تميز بصوته الخاشع وإتقانه لأحكام التجويد، وكان قارئ جامع الزيتونة لسنوات طويلة.",
    contributions: [
      "قراءة القرآن في جامع الزيتونة",
      "تعليم التجويد ورواية قالون",
      "تسجيل ختمات قرآنية كاملة",
      "تخريج أجيال من القراء"
    ],
    books: [],
    quotes: [
      "القرآن يُقرأ بالقلب قبل اللسان",
      "التجويد تعظيم لكلام الله"
    ],
    type: "reciter"
  },
  {
    id: 7,
    name: "محمد الهادي الدريدي",
    title: "القارئ الشيخ",
    birthYear: "1940",
    deathYear: "",
    birthPlace: "القيروان، تونس",
    era: "العصر الحديث",
    specialty: ["القراءات", "التجويد", "رواية قالون"],
    bio: "الشيخ محمد الهادي الدريدي، من أبرز قراء القرآن الكريم في تونس. حفظ القرآن في سن مبكرة وأتقن رواية قالون عن نافع، وتتلمذ على كبار شيوخ القراءات.",
    contributions: [
      "الإمامة في الجوامع الكبرى",
      "تعليم القرآن والتجويد",
      "المشاركة في المسابقات الدولية",
      "التسجيلات الإذاعية والتلفزيونية"
    ],
    books: [],
    quotes: [
      "حفظ القرآن شرف عظيم ومسؤولية كبيرة",
      "القراءة الصحيحة مفتاح الفهم"
    ],
    type: "reciter"
  },
  {
    id: 8,
    name: "محمد الطيب النيفر",
    title: "الشيخ العلامة",
    birthYear: "1920",
    deathYear: "2008",
    birthPlace: "تونس العاصمة",
    era: "العصر الحديث",
    specialty: ["الفقه المالكي", "أصول الفقه", "التربية الإسلامية"],
    bio: "الشيخ محمد الطيب النيفر، من علماء جامع الزيتونة البارزين. تميز بغزارة علمه وتواضعه، وكان له دور كبير في نشر العلم الشرعي في تونس.",
    contributions: [
      "التدريس في جامع الزيتونة",
      "الإفتاء والإرشاد",
      "التأليف في الفقه المالكي",
      "تربية الأجيال"
    ],
    books: [
      { title: "مختصر في الفقه المالكي", description: "كتاب تعليمي في الفقه" },
      { title: "دروس في أصول الفقه", description: "شرح لمبادئ الاستنباط" }
    ],
    quotes: [
      "الفقه فهم مراد الله من خلقه",
      "العلم بلا عمل كالشجر بلا ثمر"
    ],
    type: "scholar"
  }
];

const ZaytunaScholars = () => {
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);

  const filteredScholars = scholars.filter(s => s.type === "scholar");

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5" />
            <span className="font-semibold">تراث الزيتونة العلمي</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            علماء ومفكري جامع الزيتونة
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            تعرّف على أعلام جامع الزيتونة من العلماء والمفكرين الذين أثروا الحضارة الإسلامية
            بعلمهم وفضلهم ومؤلفاتهم العظيمة
          </p>
        </div>

        <div className="mt-0">
          {selectedScholar ? (
            <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                      {selectedScholar.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-foreground mb-1">
                        {selectedScholar.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mb-2">
                        {selectedScholar.title}
                      </Badge>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {selectedScholar.birthYear} - {selectedScholar.deathYear || "حي"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedScholar.birthPlace}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScholar(null)}
                    className="flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    رجوع
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        السيرة الذاتية
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedScholar.bio}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        التخصصات
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedScholar.specialty.map((spec, index) => (
                          <Badge key={index} variant="outline" className="bg-primary/5">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        الإسهامات العلمية
                      </h4>
                      <ul className="space-y-2">
                        {selectedScholar.contributions.map((contribution, index) => (
                          <li key={index} className="flex items-start gap-2 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {contribution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {selectedScholar.books.length > 0 && (
                      <div>
                        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          المؤلفات
                        </h4>
                        <ScrollArea className="h-48">
                          <div className="space-y-3 pr-4">
                            {selectedScholar.books.map((book, index) => (
                              <Card key={index} className="p-3 bg-muted/50">
                                <h5 className="font-semibold text-foreground mb-1">
                                  {book.title}
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  {book.description}
                                </p>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-foreground mb-3">من أقواله</h4>
                      <div className="space-y-3">
                        {selectedScholar.quotes.map((quote, index) => (
                          <blockquote
                            key={index}
                            className="border-r-4 border-primary pr-4 py-2 text-muted-foreground italic bg-muted/30 rounded-l-lg"
                          >
                            "{quote}"
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredScholars.map((scholar) => (
                <Card
                  key={scholar.id}
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
                  onClick={() => setSelectedScholar(scholar)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-bold mb-3 group-hover:scale-110 transition-transform shadow-md">
                      {scholar.name.charAt(0)}
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {scholar.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mx-auto">
                      {scholar.title}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      {scholar.birthYear} - {scholar.deathYear || "حي"}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                      {scholar.specialty.slice(0, 2).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      عرض التفاصيل
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ZaytunaScholars;
