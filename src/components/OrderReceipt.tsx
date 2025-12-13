import { useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  type: string;
  name?: string;
  size?: string;
  flavors?: string[];
  quantity: number;
  price: number;
}

interface OrderReceiptProps {
  order: {
    id: string;
    created_at: string;
    status: string;
    total: number;
    subtotal: number;
    discount: number;
    delivery_fee: number;
    address: string;
    payment_method: string;
    items: OrderItem[];
    customer_name?: string;
  };
  open: boolean;
  onClose: () => void;
}

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  card: 'Cartão de Crédito/Débito',
  cash: 'Dinheiro',
};

export function OrderReceipt({ order, open, onClose }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprovante - Pedido #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; }
            .divider { 
              border-top: 1px dashed #ccc; 
              margin: 15px 0; 
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0;
              font-size: 12px;
            }
            .info-row.total { 
              font-weight: bold; 
              font-size: 16px;
              margin-top: 10px;
            }
            .items { margin: 15px 0; }
            .item { 
              display: flex; 
              justify-content: space-between;
              margin: 8px 0;
              font-size: 12px;
            }
            .item-name { max-width: 70%; }
            .footer { 
              text-align: center; 
              margin-top: 30px;
              font-size: 10px;
              color: #666;
            }
            .qr-placeholder {
              width: 100px;
              height: 100px;
              border: 1px solid #ccc;
              margin: 15px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #999;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const orderDate = new Date(order.created_at);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Comprovante de Pedido</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="bg-white text-black p-6 rounded-lg font-mono text-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">🍕 Pizzaria</h1>
            <p className="text-xs text-muted-foreground mt-1">
              CNPJ: 00.000.000/0001-00
            </p>
            <p className="text-xs text-muted-foreground">
              Rua da Pizza, 123 - Centro
            </p>
            <p className="text-xs text-muted-foreground">
              Tel: (11) 99999-9999
            </p>
          </div>

          <Separator className="border-dashed" />

          {/* Order Info */}
          <div className="my-4 space-y-2">
            {order.customer_name && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-bold">{order.customer_name}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pedido:</span>
              <span className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Data:</span>
              <span>{format(orderDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pagamento:</span>
              <span>{paymentLabels[order.payment_method] || order.payment_method}</span>
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Items */}
          <div className="my-4">
            <p className="text-xs font-bold mb-3">ITENS DO PEDIDO</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs mb-2">
                <div className="max-w-[70%]">
                  <span>{item.quantity}x </span>
                  {item.type === 'pizza' 
                    ? `Pizza ${item.size} (${item.flavors?.join(' + ')})`
                    : item.name}
                </div>
                <span>R$ {item.price.toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>

          <Separator className="border-dashed" />

          {/* Totals */}
          <div className="my-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span>Subtotal:</span>
              <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Desconto:</span>
                <span>-R$ {order.discount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span>Taxa de entrega:</span>
              <span>R$ {order.delivery_fee.toFixed(2).replace('.', ',')}</span>
            </div>
            <Separator className="border-dashed" />
            <div className="flex justify-between font-bold text-base pt-2">
              <span>TOTAL:</span>
              <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Delivery Address */}
          <div className="my-4">
            <p className="text-xs font-bold mb-2">ENDEREÇO DE ENTREGA</p>
            <p className="text-xs text-muted-foreground">{order.address}</p>
          </div>

          <Separator className="border-dashed" />

          {/* Footer */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-muted-foreground">
              Documento sem valor fiscal
            </p>
            <p className="text-xs text-muted-foreground">
              Comprovante gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p className="text-xs font-bold mt-4">
              Obrigado pela preferência! 🍕
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Salvar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
