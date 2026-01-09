import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  SortAsc, 
  BookOpen, 
  Clock,
  Star,
  Heart,
  MapPin,
  Volume2,
  Eye
} from "lucide-react";
import { useState } from "react";

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const searchResults = [
    {
      surah: "البقرة",
      surahNumber: 2,
      ayahNumber: 255,
      arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      translation: "الله لا إله إلا هو الحي القيوم",
      revelation: "مدنية",
      context: "آية الكرسي",
      tags: ["العقيدة", "التوحيد", "أعظم آية"],
      recitations: 45,
      bookmarks: 1250,
      relevance: 95
    },
    {
      surah: "الإخلاص", 
      surahNumber: 112,
      ayahNumber: 1,
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      translation: "قل هو الله أحد",
      revelation: "مكية",
      context: "سورة الإخلاص",
      tags: ["التوحيد", "الصفات"],
      recitations: 38,
      bookmarks: 890,
      relevance: 88
    },
    {
      surah: "الفاتحة",
      surahNumber: 1, 
      ayahNumber: 2,
      arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: "الحمد لله رب العالمين",
      revelation: "مكية",
      context: "فاتحة الكتاب",
      tags: ["الحمد", "الربوبية"],
      recitations: 52,
      bookmarks: 1180,
      relevance: 82
    }
  ];

  const filters = [
    { id: "all", label: "الكل", count: 6236 },
    { id: "meccan", label: "مكية", count: 4567 },
    { id: "medinan", label: "مدنية", count: 1669 },
    { id: "bookmarked", label: "المفضلة", count: 24 },
    { id: "recent", label: "الأخيرة", count: 12 }
  ];

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">البحث المتقدم في القرآن</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ابحث في آيات القرآن الكريم بالمعنى، الموضوع، أو النص مع نتائج فورية ومفصلة
            </p>
          </div>

          {/* Search Interface */}
          <Card className="p-6 mb-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث في القرآن الكريم... (مثال: آية الكرسي، التوبة، الصبر)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-12 text-lg bg-background border-2 focus:border-primary transition-colors"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="gap-2">
                  <Filter className="h-4 w-4" />
                  تصفية
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <SortAsc className="h-4 w-4" />
                  ترتيب
                </Button>
                <Button size="lg" className="px-8">
                  بحث
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="gap-2"
                >
                  {filter.label}
                  <Badge variant="secondary" className="text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </Card>

          {/* Search Results */}
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-islamic text-primary-foreground">
                      {result.surahNumber}:{result.ayahNumber}
                    </Badge>
                    <div>
                      <h3 className="font-semibold text-lg">{result.surah}</h3>
                      <p className="text-sm text-muted-foreground">{result.revelation} • {result.context}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {result.relevance}%
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.revelation}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="quran-text text-2xl mb-3 leading-relaxed text-center">
                    {result.arabic}
                  </p>
                  <p className="text-muted-foreground text-center">
                    {result.translation}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {result.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-4 w-4" />
                      {result.recitations} تلاوة
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {result.bookmarks} مفضلة
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <BookOpen className="h-4 w-4 ml-1" />
                      اقرأ
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Volume2 className="h-4 w-4 ml-1" />
                      استمع
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 ml-1" />
                      حفظ
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Search Statistics */}
          <Card className="p-6 mt-8 bg-gradient-card">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">6,236</div>
                <div className="text-sm text-muted-foreground">إجمالي الآيات</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">114</div>
                <div className="text-sm text-muted-foreground">السور</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">604</div>
                <div className="text-sm text-muted-foreground">الصفحات</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">30</div>
                <div className="text-sm text-muted-foreground">الأجزاء</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AdvancedSearch;