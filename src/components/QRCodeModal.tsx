import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode, Phone, MessageSquare, Globe, Sparkles } from 'lucide-react';
import { SiteConfig } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, siteConfig }) => {
  const [activePreset, setActivePreset] = useState<'vcard' | 'whatsapp' | 'website' | 'custom'>('vcard');
  const [customText, setCustomText] = useState('');
  const [colorDark, setColorDark] = useState('#0f172a');
  const [colorLight, setColorLight] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate current payload based on active preset
  const getPayload = (): string => {
    switch (activePreset) {
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${siteConfig.companyName}
ORG:${siteConfig.companyName}
TITLE:Business Solutions & Corporate Growth Consultancy
EMAIL:sapotlokal.co@gmail.com
ADR;TYPE=WORK:;;50, Jln Budiman 3/2 Taman Putra Budiman;Balakong;Selangor;43200;Malaysia
NOTE:Video Editing, Social Content, Graphic Design, UGC, and Branding Strategies
URL:${window.location.origin}
END:VCARD`;

      case 'whatsapp':
        return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
          'Hello Sapotlokal Resources! I would like to inquire about your corporate consultancy and creative media services.'
        )}`;

      case 'website':
        return window.location.href;

      case 'custom':
        return customText || window.location.origin;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const payload = getPayload();

    // Generate PNG Data URL
    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));

    // Generate SVG string
    QRCode.toString(payload, {
      type: 'svg',
      margin: 2,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    })
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('QR svg generation error:', err));
  }, [isOpen, activePreset, customText, colorDark, colorLight, siteConfig]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `sapotlokal-qr-${activePreset}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sapotlokal-qr-${activePreset}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    const payload = getPayload();
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy payload:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
              <QrCode className="w-4 h-4" />
              <span>Smart QR Generator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mt-1">
              Quick Contact & Portfolio Access
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close QR Modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <button
            onClick={() => setActivePreset('vcard')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              activePreset === 'vcard'
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Phone className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-semibold">Save Contact</span>
            <span className="text-[10px] text-slate-500">vCard / Address</span>
          </button>

          <button
            onClick={() => setActivePreset('whatsapp')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              activePreset === 'whatsapp'
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-semibold">WhatsApp Chat</span>
            <span className="text-[10px] text-slate-500">0122118111</span>
          </button>

          <button
            onClick={() => setActivePreset('website')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              activePreset === 'website'
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Globe className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-semibold">Portfolio Site</span>
            <span className="text-[10px] text-slate-500">Direct Link</span>
          </button>

          <button
            onClick={() => setActivePreset('custom')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              activePreset === 'custom'
                ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-semibold">Custom Text</span>
            <span className="text-[10px] text-slate-500">Type Any URL</span>
          </button>
        </div>

        {/* Content body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
          {/* QR Display frame */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="p-3 bg-white rounded-xl shadow-lg relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code for Sapotlokal Resources"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Generating QR code...
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-slate-400 text-center font-mono">
              Scan with any mobile camera
            </p>
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Active Payload Preview
                </span>
                <p className="text-xs text-slate-200 font-mono break-all line-clamp-3">
                  {getPayload()}
                </p>
              </div>

              {activePreset === 'custom' && (
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Custom URL or Information
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="https://yourlink.com or contact note"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Color Palette Toggle */}
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1.5">
                  Code Style Accent
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Obsidian Slate', dark: '#020617' },
                    { label: 'Deep Blue', dark: '#1e3a8a' },
                    { label: 'Amber Gold', dark: '#78350f' },
                    { label: 'Forest Emerald', dark: '#064e3b' },
                  ].map((c) => (
                    <button
                      key={c.dark}
                      onClick={() => setColorDark(c.dark)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        colorDark === c.dark ? 'border-amber-400 scale-110' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c.dark }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadPng}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download SVG</span>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Encoded Payload / Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Corporate Address Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>{siteConfig.address}</span>
          <span className="font-mono text-slate-400">Tel: {siteConfig.phone}</span>
        </div>
      </div>
    </div>
  );
};
