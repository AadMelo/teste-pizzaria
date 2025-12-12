import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Clock, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PixPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onExpire: () => void;
  amount: number;
  orderId?: string;
  merchantName?: string;
  merchantCity?: string;
}

// PIX key for the pizzeria (change this to the real key)
const PIX_KEY = '11999999999';
const PIX_KEY_TYPE = 'phone'; // phone, cpf, cnpj, email, random

// Expiration time in minutes
const EXPIRATION_MINUTES = 15;

function generatePixCode(amount: number, merchantName: string, merchantCity: string): string {
  // EMV QR Code format for PIX
  // This is a simplified version - for production, use a proper PIX library
  
  const formatValue = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // Payload Format Indicator
  let payload = formatValue('00', '01');
  
  // Merchant Account Information (PIX)
  const gui = formatValue('00', 'br.gov.bcb.pix');
  const key = formatValue('01', PIX_KEY);
  const merchantAccountInfo = gui + key;
  payload += formatValue('26', merchantAccountInfo);
  
  // Merchant Category Code
  payload += formatValue('52', '0000');
  
  // Transaction Currency (986 = BRL)
  payload += formatValue('53', '986');
  
  // Transaction Amount
  payload += formatValue('54', amount.toFixed(2));
  
  // Country Code
  payload += formatValue('58', 'BR');
  
  // Merchant Name
  payload += formatValue('59', merchantName.substring(0, 25));
  
  // Merchant City
  payload += formatValue('60', merchantCity.substring(0, 15));
  
  // Additional Data Field (transaction ID)
  const txId = formatValue('05', `PIX${Date.now().toString().slice(-8)}`);
  payload += formatValue('62', txId);
  
  // CRC16 placeholder
  payload += '6304';
  
  // Calculate CRC16
  const crc = calculateCRC16(payload);
  payload = payload.slice(0, -4) + formatValue('63', crc);
  
  return payload;
}

function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export default function PixPaymentModal({
  open,
  onClose,
  onConfirm,
  onExpire,
  amount,
  orderId,
  merchantName = 'EXPRESSO PIZZA',
  merchantCity = 'SAO PAULO',
}: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXPIRATION_MINUTES * 60);
  const [pixCode, setPixCode] = useState('');
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);
  const hasExpired = useRef(false);

  useEffect(() => {
    if (open) {
      setTimeLeft(EXPIRATION_MINUTES * 60);
      setPixCode(generatePixCode(amount, merchantName, merchantCity));
      setShowExpiredWarning(false);
      hasExpired.current = false;
    }
  }, [open, amount, merchantName, merchantCity]);

  useEffect(() => {
    if (!open || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasExpired.current) {
            hasExpired.current = true;
            setShowExpiredWarning(true);
            toast.error('Tempo esgotado! O pedido será cancelado.', {
              description: 'O pagamento não foi confirmado a tempo.',
              duration: 5000,
            });
            // Call the expire callback to cancel the order
            setTimeout(() => {
              onExpire();
              onClose();
            }, 2000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeLeft, onClose, onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  const handleConfirmPayment = () => {
    toast.success('Pagamento confirmado! Processando pedido...');
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">💳</span>
            Pagamento via PIX
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Expired Warning */}
          {showExpiredWarning && (
            <div className="w-full p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Tempo esgotado!</p>
                <p className="text-sm text-destructive/80">O pedido está sendo cancelado...</p>
              </div>
            </div>
          )}

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft < 120
                ? 'bg-destructive/10 text-destructive animate-pulse'
                : timeLeft < 300
                ? 'bg-amber-100 text-amber-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono font-medium">
              {timeLeft <= 0 ? 'Expirado' : `Expira em: ${formatTime(timeLeft)}`}
            </span>
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor a pagar</p>
            <p className="text-3xl font-bold text-primary">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* QR Code */}
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <QRCodeSVG
              value={pixCode}
              size={200}
              level="M"
              includeMargin
              className="rounded-lg"
            />
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code com o app do seu banco
            </p>
            <p className="text-xs text-muted-foreground">
              ou copie o código PIX abaixo
            </p>
          </div>

          {/* Copy Code Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Código copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar código PIX
              </>
            )}
          </Button>

          {/* PIX Code Preview */}
          <div className="w-full p-3 bg-muted rounded-lg">
            <p className="text-xs font-mono text-muted-foreground break-all line-clamp-2">
              {pixCode}
            </p>
          </div>

          {/* Confirm Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            onClick={handleConfirmPayment}
            disabled={showExpiredWarning || timeLeft <= 0}
          >
            {showExpiredWarning ? 'Pedido cancelado' : 'Já fiz o pagamento'}
          </Button>

          {/* Warning about auto-cancel */}
          <p className="text-xs text-center text-muted-foreground">
            ⚠️ O pedido será <strong>cancelado automaticamente</strong> se o pagamento não for confirmado em {EXPIRATION_MINUTES} minutos
          </p>

          {/* Cancel */}
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={onClose}
            disabled={showExpiredWarning}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar pagamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
