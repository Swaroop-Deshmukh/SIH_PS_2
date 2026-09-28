"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { API_BASE_URL, BatchImage, getBatchImages, uploadBatchImage } from "../lib/api";
import { Language } from "../lib/dictionary";

interface Props { batchId: string; lang: Language; }

export const CameraAttachment: React.FC<Props> = ({ batchId, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<BatchImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const mr = lang === "mr";
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    let active = true;
    void getBatchImages(batchId).then((items) => { if (active) setImages(items); }).catch(() => { if (active) setImages([]); });
    setFile(null);
    setError(null);
    setMessage(null);
    return () => { active = false; };
  }, [batchId]);

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await uploadBatchImage(batchId, file);
      setImages((previous) => [{ ...saved, url: `/batches/${batchId}/images/${saved.attachment_id}` }, ...previous]);
      setFile(null);
      setMessage(mr ? "फोटो या बॅचसोबत जतन झाला. AI ने फोटोचे विश्लेषण केलेले नाही." : "Photo attached to this batch. It was not analyzed by AI.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this photo.");
    } finally {
      setUploading(false);
    }
  };

  const imageUrl = (image: BatchImage) => {
    if (image.url?.startsWith("http")) return image.url;
    if (image.url?.startsWith("/api/")) return new URL(API_BASE_URL).origin + image.url;
    return API_BASE_URL + (image.url ?? `/batches/${batchId}/images/${image.attachment_id}`);
  };

  return <section className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center"><Camera className="w-5 h-5"/></div><div><h3 className="font-bold">{mr ? "चाऱ्याचा फोटो जोडा" : lang === "hi" ? "चारे की फ़ोटो जोड़ें" : "Add a feed photo"}</h3><p className="text-xs text-stone-600">{mr ? "मोबाइलवर कॅमेरा उघडेल. फोटो या बॅचसोबत जतन होईल." : lang === "hi" ? "मोबाइल पर कैमरा खुलेगा। फ़ोटो इस बैच के साथ सहेजी जाएगी।" : "On a phone, this opens the camera. The photo is saved with this batch."}</p></div></div>
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold text-[#1b4332] hover:bg-stone-50">
      <ImagePlus className="w-4 h-4"/>{mr ? "कॅमेरा उघडा / फोटो निवडा" : lang === "hi" ? "कैमरा खोलें / फ़ोटो चुनें" : "Open camera / choose photo"}
      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(null); setMessage(null); event.target.value = ""; }} />
    </label>
    {file && <div className="flex flex-wrap items-center gap-3 rounded-xl bg-stone-50 p-3">
      {/* Local preview only; the photo is uploaded after the user confirms. */}
      {previewUrl && <Image unoptimized width={80} height={80} src={previewUrl} alt={mr ? "निवडलेल्या चाऱ्याच्या फोटोचा पूर्वदृश्य" : "Preview of selected feed"} className="h-20 w-20 rounded-lg object-cover" />}
      <div className="min-w-0 flex-1 text-xs"><div className="font-semibold truncate">{file.name}</div><div className="text-stone-500">{(file.size / 1024 / 1024).toFixed(1)} MB · max 8 MB</div></div>
      <button onClick={() => void submit()} disabled={uploading || file.size > 8 * 1024 * 1024} className="inline-flex items-center gap-2 rounded-lg bg-[#1b4332] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{uploading ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}{mr ? "बॅचसोबत जतन करा" : lang === "hi" ? "बैच के साथ सहेजें" : "Attach to this batch"}</button>
    </div>}
    {file && file.size > 8 * 1024 * 1024 && <p role="alert" className="text-xs text-rose-700">Choose a photo smaller than 8 MB.</p>}
    {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">{message}</p>}
    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">{mr ? "महत्त्वाचे: हा फोटो फक्त जतन होतो. बुरशी, विषारी पदार्थ किंवा भेसळ शोधण्यासाठी AI विश्लेषण होत नाही." : lang === "hi" ? "ध्यान दें: फ़ोटो केवल सहेजी जाती है। फफूँद, विष या मिलावट पहचानने के लिए AI विश्लेषण नहीं होता।" : "Important: the photo is stored only. No AI analysis for mould, toxins or adulteration is performed."}</p>
    {images.length > 0 && <div><p className="mb-2 text-xs font-bold text-stone-600">{mr ? "या बॅचसोबतचे फोटो" : lang === "hi" ? "इस बैच की फ़ोटो" : "Photos attached to this batch"}</p><div className="flex flex-wrap gap-2">{images.map((image) => <a key={image.attachment_id} href={imageUrl(image)} target="_blank" rel="noreferrer" title={image.original_name}><Image unoptimized width={64} height={64} src={imageUrl(image)} alt={image.original_name} className="h-16 w-16 rounded-lg border object-cover"/></a>)}</div></div>}
  </section>;
};
