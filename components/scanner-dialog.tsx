"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, AlertCircle, ScanLine } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (isbn: string) => void;
}

export function ScannerDialog({ open, onOpenChange, onDetected }: ScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      stopScanner();
      setCameraError(null);
      return;
    }

    let cancelled = false;
    setStarting(true);

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        if (cancelled || !videoRef.current) return;

        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result) {
              onDetected(result.getText());
              onOpenChange(false);
            }
          }
        );
        controlsRef.current = controls;
      } catch (err) {
        setCameraError(
          err instanceof Error
            ? err.message
            : "Could not access the camera. Check permissions or enter the ISBN manually."
        );
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open, onDetected, onOpenChange, stopScanner]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-[hsl(var(--burgundy))]" />
            Scan a barcode
          </DialogTitle>
        </DialogHeader>

        <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {starting && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {!cameraError && (
            <div className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2 h-16 border-2 border-[hsl(var(--gold))] rounded-md" />
          )}
        </div>

        {cameraError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-[hsl(var(--forest-light))] font-body">
          Point your camera at the ISBN barcode on the back of the book (the one starting with 978 or 979).
        </p>

        <div className="pt-2 border-t border-[hsl(var(--forest)/0.15)] space-y-2">
          <Label htmlFor="manual-isbn" className="text-xs uppercase tracking-wide text-[hsl(var(--forest-light))]">
            Or type the ISBN
          </Label>
          <div className="flex gap-2">
            <Input
              id="manual-isbn"
              value={manualIsbn}
              onChange={(e) => setManualIsbn(e.target.value)}
              placeholder="9780000000000"
              className="font-mono"
            />
            <Button
              onClick={() => {
                if (manualIsbn.trim()) {
                  onDetected(manualIsbn.trim());
                  onOpenChange(false);
                  setManualIsbn("");
                }
              }}
            >
              <Camera className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
