'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCroppedImg } from '@/lib/cropImage';
import { HERO_BANNER_ASPECT, HERO_BANNER_SIZE_LABEL } from '@/lib/heroBannerConstants';

interface HeroImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onComplete: (blob: Blob) => void;
  isUploading?: boolean;
}

export default function HeroImageCropModal({
  open,
  imageSrc,
  onClose,
  onComplete,
  isUploading = false,
}: HeroImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onComplete(blob);
      onClose();
    } catch (e) {
      console.error('Crop failed:', e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Crop hero banner (3:1)</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fixed size: {HERO_BANNER_SIZE_LABEL}. Drag to reposition; use zoom if needed.
          </p>
        </DialogHeader>
        <div className="relative w-full h-[50vh] min-h-[280px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={HERO_BANNER_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            style={{ containerStyle: {}, cropAreaStyle: {}, mediaStyle: {} }}
            classes={{}}
            restrictPosition={true}
            mediaProps={{}}
            cropperProps={{}}
            cropShape="rect"
            showGrid={false}
            zoomSpeed={1}
            minZoom={1}
            maxZoom={3}
            rotation={0}
            onRotationChange={() => {}}
            keyboardStep={0.1}
          />
        </div>
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24"
            />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isUploading || !croppedAreaPixels}>
              {isUploading ? 'Uploading…' : 'Apply crop & upload'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
