import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Pencil, Trash2, Loader2, Image as ImageIcon, 
  Upload, X, GripVertical, Eye, EyeOff, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: 'Peça Agora 🍕',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners((data as Banner[]) || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image_url: banner.image_url,
        link_url: banner.link_url || '',
        button_text: banner.button_text || 'Peça Agora 🍕',
        is_active: banner.is_active
      });
      setImagePreview(banner.image_url);
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        image_url: '',
        link_url: '',
        button_text: 'Peça Agora 🍕',
        is_active: true
      });
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }
    if (!formData.image_url.trim()) {
      toast.error('A imagem é obrigatória');
      return;
    }

    setSaving(true);
    try {
      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        image_url: formData.image_url,
        link_url: formData.link_url || null,
        button_text: formData.button_text || null,
        is_active: formData.is_active
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast.success('Banner atualizado com sucesso!');
      } else {
        const maxOrder = banners.length > 0 
          ? Math.max(...banners.map(b => b.display_order)) + 1 
          : 0;
        
        const { error } = await supabase
          .from('banners')
          .insert({ ...bannerData, display_order: maxOrder });

        if (error) throw error;
        toast.success('Banner criado com sucesso!');
      }

      setIsDialogOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Banner excluído com sucesso!');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Erro ao excluir banner');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status atualizado!');
      fetchBanners();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const moveOrder = async (id: string, direction: 'up' | 'down') => {
    const index = banners.findIndex(b => b.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const currentBanner = banners[index];
    const swapBanner = banners[swapIndex];

    try {
      await supabase
        .from('banners')
        .update({ display_order: swapBanner.display_order })
        .eq('id', currentBanner.id);

      await supabase
        .from('banners')
        .update({ display_order: currentBanner.display_order })
        .eq('id', swapBanner.id);

      fetchBanners();
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Erro ao reordenar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-orange-400" />
            Gestão de Banners
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie os banners do carrossel da página inicial
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-4">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label className="text-zinc-300">Imagem do Banner *</Label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-zinc-700"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-48 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-zinc-500" />
                      </div>
                      <p className="text-sm text-zinc-400">Clique para enviar uma imagem</p>
                      <p className="text-xs text-zinc-500">Recomendado: 1920x600px, até 10MB</p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Imagem
                      </>
                    )}
                  </Button>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-zinc-300">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: PIZZA GRANDE"
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <Label htmlFor="subtitle" className="text-zinc-300">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Ex: A partir de R$ 35,90"
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <Label htmlFor="button_text" className="text-zinc-300">Texto do Botão</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Ex: Peça Agora 🍕"
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Link URL */}
                <div>
                  <Label htmlFor="link_url" className="text-zinc-300">Link (opcional)</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="Ex: /cardapio ou https://..."
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Active Switch */}
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-zinc-700">
                  <Label htmlFor="is_active" className="text-zinc-300">Banner ativo</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                {/* Save Button */}
                <Button 
                  onClick={handleSave} 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" 
                  disabled={saving || !formData.title || !formData.image_url}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Banner'
                  )}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card className="bg-black/40 border-zinc-800">
          <CardContent className="py-12">
            <div className="text-center text-zinc-500">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum banner cadastrado</p>
              <p className="text-sm mt-1">Clique em "Novo Banner" para adicionar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner, index) => (
            <Card 
              key={banner.id} 
              className={cn(
                "bg-zinc-900/90 border-zinc-800 overflow-hidden",
                !banner.is_active && "opacity-50"
              )}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Image Preview */}
                  <div className="relative w-full md:w-80 h-40 md:h-auto flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={cn(
                        "absolute top-2 left-2",
                        banner.is_active ? "bg-emerald-500" : "bg-zinc-500"
                      )}
                    >
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge className="absolute top-2 right-2 bg-black/60">
                      #{index + 1}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-zinc-400 mt-1">{banner.subtitle}</p>
                      )}
                      {banner.button_text && (
                        <Badge variant="outline" className="mt-2 border-orange-500/30 text-orange-400">
                          {banner.button_text}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(banner.id, banner.is_active)}
                        className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
                      >
                        {banner.is_active ? (
                          <><EyeOff className="h-4 w-4 mr-1" /> Desativar</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-1" /> Ativar</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(banner)}
                        className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveOrder(banner.id, 'up')}
                        disabled={index === 0}
                        className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveOrder(banner.id, 'down')}
                        disabled={index === banners.length - 1}
                        className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                        className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="bg-orange-500/10 border-orange-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-orange-300">
            💡 <strong>Dica:</strong> Use imagens de alta qualidade com proporção 16:9 (ex: 1920x600px) para melhor visualização no carrossel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
