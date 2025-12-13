import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Loader2, Pizza, Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import adminMenuHero from '@/assets/admin-menu-hero.jpg';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  product_type: string;
  image_url: string | null;
  ingredients: string[] | null;
  size: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
}

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  product_type: z.string().min(1, 'Tipo é obrigatório'),
  image_url: z.string().url().optional().or(z.literal('')),
  ingredients: z.string().optional(),
  size: z.string().optional(),
  is_available: z.boolean()
});

const categories = [
  'Pizzas Tradicionais',
  'Pizzas Especiais',
  'Pizzas Premium',
  'Pizzas Doces',
  'Bebidas',
  'Sobremesas',
  'Porções'
];

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    product_type: 'product',
    image_url: '',
    ingredients: '',
    size: '',
    is_available: true
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProducts((data as unknown as Product[]) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category,
        product_type: product.product_type,
        image_url: product.image_url || '',
        ingredients: product.ingredients?.join(', ') || '',
        size: product.size || '',
        is_available: product.is_available
      });
      setImagePreview(product.image_url || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        product_type: 'product',
        image_url: '',
        ingredients: '',
        size: '',
        is_available: true
      });
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
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
    try {
      setSaving(true);
      
      const validatedData = productSchema.parse({
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        product_type: formData.product_type,
        image_url: formData.image_url || undefined,
        ingredients: formData.ingredients || undefined,
        size: formData.size || undefined,
        is_available: formData.is_available
      });

      const ingredientsArray = validatedData.ingredients 
        ? validatedData.ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0)
        : null;

      const productData = {
        name: validatedData.name,
        description: validatedData.description || null,
        price: validatedData.price,
        category: validatedData.category,
        product_type: validatedData.product_type,
        image_url: validatedData.image_url || null,
        ingredients: ingredientsArray,
        size: validatedData.size || null,
        is_available: validatedData.is_available
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData as any)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData as any);

        if (error) throw error;
        toast.success('Produto criado com sucesso!');
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error saving product:', error);
        toast.error('Erro ao salvar produto');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentStatus } as any)
        .eq('id', id);

      if (error) throw error;
      toast.success('Disponibilidade atualizada!');
      fetchProducts();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Erro ao atualizar disponibilidade');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden h-28 md:h-36 group">
        <img 
          src={adminMenuHero} 
          alt="Cardápio" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center px-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Pizza className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
              Gestão do Cardápio
            </h2>
            <p className="text-orange-200/80 text-sm mt-1">Adicione, edite ou remova produtos do menu</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md bg-zinc-900 border-zinc-700 max-h-[90vh] overflow-hidden p-4 sm:p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-white text-base sm:text-lg">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-zinc-300 text-xs sm:text-sm">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Pizza Margherita"
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="product_type" className="text-zinc-300 text-xs sm:text-sm">Tipo *</Label>
                    <Select
                      value={formData.product_type}
                      onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                    >
                      <SelectTrigger className="bg-black/40 border-zinc-700 text-white h-9 text-sm">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="pizza">Pizza</SelectItem>
                        <SelectItem value="product">Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-zinc-300 text-xs sm:text-sm">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="category" className="text-zinc-300 text-xs sm:text-sm">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-black/40 border-zinc-700 text-white h-9 text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-zinc-300 text-xs sm:text-sm">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do produto..."
                  rows={2}
                  className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
                />
              </div>
              
              {formData.product_type === 'pizza' && (
                <div>
                  <Label htmlFor="ingredients" className="text-zinc-300 text-xs sm:text-sm">Ingredientes (separados por vírgula)</Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="Molho de tomate, Mussarela, Manjericão..."
                    rows={2}
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
                  />
                </div>
              )}
              
              {formData.product_type === 'product' && (
                <div>
                  <Label htmlFor="size" className="text-zinc-300 text-xs sm:text-sm">Tamanho (opcional)</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="Ex: 350ml, 2L, 500g"
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs sm:text-sm">Imagem do Produto</Label>
                
                {/* Compact Image Preview for Mobile */}
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-24 sm:h-32 object-cover rounded-lg border border-zinc-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="w-full h-20 sm:h-28 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-5 w-5 text-zinc-500" />
                    <p className="text-xs text-zinc-400">Toque para enviar</p>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                
                {/* Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-8 border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white text-xs"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      {imagePreview ? 'Trocar imagem' : 'Enviar imagem'}
                    </>
                  )}
                </Button>

                {/* URL Input */}
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setImagePreview(e.target.value || null);
                  }}
                  placeholder="Ou cole a URL da imagem"
                  className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 h-8 text-xs"
                />
              </div>
              
              <div className="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-zinc-700">
                <Label htmlFor="is_available" className="text-zinc-300 text-xs sm:text-sm">Disponível para venda</Label>
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>
              
              <Button 
                onClick={handleSave} 
                className="w-full h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
              
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-black/40 border-zinc-700 text-white">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-2">
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-2 pr-1">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-black/40 border border-zinc-800 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover border border-zinc-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center border border-zinc-700 flex-shrink-0">
                      <Pizza className="h-5 w-5 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-emerald-400 font-semibold">
                      R$ {Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={product.is_available}
                      onCheckedChange={() => toggleAvailability(product.id, product.is_available)}
                      className="scale-75"
                    />
                    <span className="text-xs text-zinc-500">Ativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(product)}
                      className="h-7 px-3 text-xs border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Pizza className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Desktop View - Table */}
      <Card className="hidden md:block bg-black/40 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Produto</TableHead>
                  <TableHead className="text-zinc-400">Categoria</TableHead>
                  <TableHead className="text-zinc-400">Preço</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-zinc-800 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                            <Pizza className="h-6 w-6 text-zinc-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-zinc-500 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-400">
                      R$ {Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.is_available}
                        onCheckedChange={() => toggleAvailability(product.id, product.is_available)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                          className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Pizza className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum produto encontrado</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
