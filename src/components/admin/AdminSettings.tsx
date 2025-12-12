import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, Clock, Truck, Store, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface StoreSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  type: string;
  category: string;
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState<StoreSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings' as any)
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      
      const settingsData = data as unknown as StoreSetting[];
      setSettings(settingsData);
      
      // Initialize edited values
      const values: Record<string, string> = {};
      settingsData.forEach(setting => {
        values[setting.key] = setting.value;
      });
      setEditedValues(values);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    setEditedValues(prev => ({ ...prev, [key]: checked ? 'true' : 'false' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each changed setting
      for (const setting of settings) {
        if (editedValues[setting.key] !== setting.value) {
          const { error } = await supabase
            .from('store_settings' as any)
            .update({ value: editedValues[setting.key] } as any)
            .eq('key', setting.key);

          if (error) throw error;
        }
      }
      
      toast.success('Configurações salvas com sucesso!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hours': return <Clock className="h-5 w-5 text-orange-400" />;
      case 'delivery': return <Truck className="h-5 w-5 text-orange-400" />;
      case 'general': return <Store className="h-5 w-5 text-orange-400" />;
      default: return <Settings className="h-5 w-5 text-orange-400" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'hours': return 'Horário de Funcionamento';
      case 'delivery': return 'Configurações de Entrega';
      case 'general': return 'Informações Gerais';
      default: return 'Outras Configurações';
    }
  };

  const renderSettingInput = (setting: StoreSetting) => {
    const value = editedValues[setting.key] || '';

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-zinc-700">
            <Label htmlFor={setting.key} className="text-zinc-300">{setting.label}</Label>
            <Switch
              id={setting.key}
              checked={value === 'true'}
              onCheckedChange={(checked) => handleSwitchChange(setting.key, checked)}
            />
          </div>
        );
      
      case 'time':
        return (
          <div>
            <Label htmlFor={setting.key} className="text-zinc-300 text-sm">{setting.label}</Label>
            <Input
              id={setting.key}
              type="time"
              value={value}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              className="bg-black/40 border-zinc-700 text-white mt-1"
            />
          </div>
        );
      
      case 'number':
        return (
          <div>
            <Label htmlFor={setting.key} className="text-zinc-300 text-sm">{setting.label}</Label>
            <Input
              id={setting.key}
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              className="bg-black/40 border-zinc-700 text-white mt-1"
            />
          </div>
        );
      
      default:
        return (
          <div>
            <Label htmlFor={setting.key} className="text-zinc-300 text-sm">{setting.label}</Label>
            <Input
              id={setting.key}
              type="text"
              value={value}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              className="bg-black/40 border-zinc-700 text-white mt-1"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  const categories = ['general', 'hours', 'delivery'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-orange-400" />
            Configurações da Loja
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Gerencie horários, taxas e informações da pizzaria</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchSettings}
            className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map(category => {
          const categorySettings = getSettingsByCategory(category);
          if (categorySettings.length === 0) return null;

          const booleanSettings = categorySettings.filter(s => s.type === 'boolean');
          const otherSettings = categorySettings.filter(s => s.type !== 'boolean');

          return (
            <Card key={category} className="bg-black/40 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {getCategoryTitle(category)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Non-boolean settings in a grid */}
                {otherSettings.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherSettings.map(setting => (
                      <div key={setting.key}>
                        {renderSettingInput(setting)}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Boolean settings */}
                {booleanSettings.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {category === 'hours' && (
                      <p className="text-zinc-400 text-sm mb-3">Dias de funcionamento:</p>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {booleanSettings.map(setting => (
                        <div key={setting.key}>
                          {renderSettingInput(setting)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Card */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Store className="h-5 w-5 text-orange-400" />
            Pré-visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm">Nome da Loja</p>
              <p className="text-white font-semibold text-lg">{editedValues['store_name'] || '-'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm">Taxa de Entrega</p>
              <p className="text-emerald-400 font-semibold text-lg">
                R$ {parseFloat(editedValues['delivery_fee'] || '0').toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm">Tempo Estimado</p>
              <p className="text-orange-400 font-semibold text-lg">
                {editedValues['estimated_delivery_time'] || '0'} minutos
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm">Pedido Mínimo</p>
              <p className="text-white font-semibold">
                R$ {parseFloat(editedValues['min_order_value'] || '0').toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm">Frete Grátis Acima de</p>
              <p className="text-emerald-400 font-semibold">
                R$ {parseFloat(editedValues['free_delivery_above'] || '0').toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm">Horário (Seg-Sex)</p>
              <p className="text-white font-semibold">
                {editedValues['opening_time_weekday']} - {editedValues['closing_time_weekday']}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};