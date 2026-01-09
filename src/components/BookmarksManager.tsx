import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bookmark, 
  Search,
  Folder,
  Star,
  MoreVertical,
  Plus,
  Heart,
  Clock,
  Tag,
  Loader2,
  Trash2,
  Edit
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BookmarksManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    surah_name: "",
    surah_number: 0,
    ayah_number: 0,
    ayah_text: "",
    notes: "",
    folder_id: "",
    tags: [] as string[]
  });
  const queryClient = useQueryClient();

  // Get current user
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // Fetch folders
  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ["bookmark_folders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("bookmark_folders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch bookmarks
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ["bookmarks", userId, activeFolder],
    queryFn: async () => {
      if (!userId) return [];
      let query = supabase
        .from("bookmarks")
        .select(`
          *,
          bookmark_tags(tag),
          bookmark_folders(name, icon, color)
        `)
        .eq("user_id", userId);
      
      if (activeFolder !== "all") {
        const folder = folders.find(f => f.id === activeFolder);
        if (folder) {
          query = query.eq("folder_id", activeFolder);
        }
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("bookmark_folders")
        .insert({
          user_id: userId,
          name,
          icon: "Folder",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmark_folders", userId] });
      toast.success("تم إنشاء المجلد بنجاح");
    },
    onError: (error: Error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Create bookmark mutation
  const createBookmarkMutation = useMutation({
    mutationFn: async (bookmark: typeof newBookmark) => {
      if (!userId) throw new Error("Not authenticated");
      
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from("bookmarks")
        .insert({
          user_id: userId,
          surah_name: bookmark.surah_name,
          surah_number: bookmark.surah_number,
          ayah_number: bookmark.ayah_number,
          ayah_text: bookmark.ayah_text,
          notes: bookmark.notes || null,
          folder_id: bookmark.folder_id || null,
        })
        .select()
        .single();
      
      if (bookmarkError) throw bookmarkError;

      // Insert tags
      if (bookmark.tags.length > 0) {
        const tagInserts = bookmark.tags.map(tag => ({
          bookmark_id: bookmarkData.id,
          tag: tag.trim(),
        }));
        
        const { error: tagsError } = await supabase
          .from("bookmark_tags")
          .insert(tagInserts);
        
        if (tagsError) throw tagsError;
      }

      return bookmarkData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      setIsAddDialogOpen(false);
      setNewBookmark({
        surah_name: "",
        surah_number: 0,
        ayah_number: 0,
        ayah_text: "",
        notes: "",
        folder_id: "",
        tags: [],
      });
      toast.success("تم إضافة العلامة بنجاح");
    },
    onError: (error: Error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Delete bookmark mutation
  const deleteBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      toast.success("تم حذف العلامة بنجاح");
    },
    onError: (error: Error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const filteredBookmarks = bookmarks.filter((bookmark: any) => {
    const matchesSearch = 
      bookmark.surah_name?.includes(searchQuery) || 
      bookmark.ayah_text?.includes(searchQuery) ||
      bookmark.bookmark_tags?.some((tag: any) => tag.tag.includes(searchQuery));
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "منذ يوم";
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    return `منذ ${Math.floor(diffDays / 30)} شهر`;
  };

  const defaultFolders = [
    { id: "all", name: "الكل", count: bookmarks.length, icon: Bookmark },
  ];

  const allFolders = [
    ...defaultFolders,
    ...folders.map(f => ({
      id: f.id,
      name: f.name,
      count: bookmarks.filter((b: any) => b.folder_id === f.id).length,
      icon: f.icon === "Star" ? Star : f.icon === "Heart" ? Heart : f.icon === "Clock" ? Clock : Folder,
    })),
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 mb-4">
              <Bookmark className="h-5 w-5 text-primary" />
              <Badge variant="secondary">العلامات المرجعية</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">علاماتك المرجعية</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نظم آياتك المفضلة في مجلدات واصل إليها بسهولة
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Folders Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">المجلدات</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة مجلد جديد</DialogTitle>
                        <DialogDescription>
                          أنشئ مجلداً جديداً لتنظيم علاماتك المرجعية
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="folder-name">اسم المجلد</Label>
                          <Input
                            id="folder-name"
                            placeholder="مثال: المفضلة"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                createFolderMutation.mutate(e.currentTarget.value.trim());
                              }
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.previousElementSibling?.querySelector("input") as HTMLInputElement;
                            if (input?.value.trim()) {
                              createFolderMutation.mutate(input.value.trim());
                            }
                          }}
                          disabled={createFolderMutation.isPending}
                        >
                          {createFolderMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                          إضافة
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2">
                  {foldersLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    allFolders.map((folder) => (
                      <Button
                        key={folder.id}
                        variant={activeFolder === folder.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveFolder(folder.id)}
                      >
                        <folder.icon className="h-4 w-4 ml-2" />
                        <span className="flex-1 text-right">{folder.name}</span>
                        <Badge variant="outline" className="mr-2">
                          {folder.count}
                        </Badge>
                      </Button>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Bookmarks List */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في العلامات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة علامة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>إضافة علامة مرجعية جديدة</DialogTitle>
                      <DialogDescription>
                        احفظ آية من القرآن الكريم مع ملاحظاتك
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="surah-name">اسم السورة</Label>
                          <Input
                            id="surah-name"
                            placeholder="مثال: البقرة"
                            value={newBookmark.surah_name}
                            onChange={(e) => setNewBookmark({ ...newBookmark, surah_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="surah-number">رقم السورة</Label>
                          <Input
                            id="surah-number"
                            type="number"
                            placeholder="2"
                            value={newBookmark.surah_number || ""}
                            onChange={(e) => setNewBookmark({ ...newBookmark, surah_number: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ayah-number">رقم الآية</Label>
                          <Input
                            id="ayah-number"
                            type="number"
                            placeholder="255"
                            value={newBookmark.ayah_number || ""}
                            onChange={(e) => setNewBookmark({ ...newBookmark, ayah_number: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="folder-select">المجلد</Label>
                          <Select value={newBookmark.folder_id} onValueChange={(value) => setNewBookmark({ ...newBookmark, folder_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مجلداً" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">بدون مجلد</SelectItem>
                              {folders.map((folder) => (
                                <SelectItem key={folder.id} value={folder.id}>
                                  {folder.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="ayah-text">نص الآية</Label>
                        <Textarea
                          id="ayah-text"
                          placeholder="اكتب نص الآية هنا..."
                          value={newBookmark.ayah_text}
                          onChange={(e) => setNewBookmark({ ...newBookmark, ayah_text: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea
                          id="notes"
                          placeholder="أضف ملاحظاتك الشخصية..."
                          value={newBookmark.notes}
                          onChange={(e) => setNewBookmark({ ...newBookmark, notes: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">العلامات (مفصولة بفواصل)</Label>
                        <Input
                          id="tags"
                          placeholder="حفظ, تدبر, مفضلة"
                          onChange={(e) => {
                            const tags = e.target.value.split(",").map(t => t.trim()).filter(t => t);
                            setNewBookmark({ ...newBookmark, tags });
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button
                        onClick={() => {
                          if (newBookmark.surah_name && newBookmark.ayah_text) {
                            createBookmarkMutation.mutate(newBookmark);
                          } else {
                            toast.error("يرجى ملء جميع الحقول المطلوبة");
                          }
                        }}
                        disabled={createBookmarkMutation.isPending}
                      >
                        {createBookmarkMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                        إضافة
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Bookmarks Grid */}
              {bookmarksLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredBookmarks.map((bookmark: any) => (
                    <Card key={bookmark.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {bookmark.surah_name} : {bookmark.ayah_number}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {bookmark.created_at ? formatDate(bookmark.created_at) : ""}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(bookmark.ayah_text);
                                toast.success("تم نسخ الآية");
                              }}
                            >
                              نسخ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذه العلامة؟")) {
                                  deleteBookmarkMutation.mutate(bookmark.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="quran-text text-lg mb-3 line-clamp-2">
                        {bookmark.ayah_text}
                      </p>

                      {bookmark.notes && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {bookmark.notes}
                        </p>
                      )}

                      {bookmark.bookmark_tags && bookmark.bookmark_tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {bookmark.bookmark_tags.map((tagItem: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tagItem.tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {filteredBookmarks.length === 0 && (
                <Card className="p-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">لا توجد علامات</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    لم تقم بإضافة أي علامات مرجعية بعد
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    أضف علامة جديدة
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookmarksManager;
