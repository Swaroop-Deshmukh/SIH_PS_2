"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Camera,
  ImagePlus,
  LoaderCircle,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FlaskConical,
  Eye,
  ShieldAlert,
} from "lucide-react";
import {
  API_BASE_URL,
  BatchImage,
  FeedVisionAnalysis,
  UreaStripAnalysis,
  getBatchImages,
  uploadBatchImage,
  analyzeUreaStripPhoto,
} from "../lib/api";
import { Language } from "../lib/dictionary";

interface Props {
  batchId: string;
  lang: Language;
}

export const CameraAttachment: React.FC<Props> = ({ batchId, lang }) => {
  const [activeTab, setActiveTab] = useState<"surface" | "urea">("surface");
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<BatchImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FeedVisionAnalysis | null>(null);
  const [ureaAnalysis, setUreaAnalysis] = useState<UreaStripAnalysis | null>(null);

  const mr = lang === "mr";
  const hi = lang === "hi";
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    let active = true;
    void getBatchImages(batchId)
      .then((items) => {
        if (active) {
          setImages(items);
          if (items.length > 0 && items[0].analysis) {
            setSelectedAnalysis(items[0].analysis);
          }
        }
      })
      .catch(() => { if (active) setImages([]); });
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
      if (activeTab === "surface") {
        const saved = await uploadBatchImage(batchId, file);
        setImages((prev) => [{ ...saved, url: `/batches/${batchId}/images/${saved.attachment_id}` }, ...prev]);
        if (saved.image_analysis || saved.analysis) {
          setSelectedAnalysis(saved.image_analysis || saved.analysis);
        }
        setFile(null);
        setMessage(
          mr
            ? "फोटो कॉम्प्युटर व्हिजनने तपासला गेला आणि बॅचसोबत जतन केला."
            : hi
            ? "फ़ोटो कंप्यूटर विज़न द्वारा जाँची गई और बैच के साथ सहेजी गई।"
            : "Photo analyzed via Computer Vision and attached to batch record."
        );
      } else {
        // Urea chemical strip mode
        const result = await analyzeUreaStripPhoto(file);
        setUreaAnalysis(result);
        setMessage(
          mr
            ? "युरिया चाचणी पट्टीचे रंग विश्लेषण पूर्ण झाले."
            : hi
            ? "यूरिया टेस्ट स्ट्रिप का रंग विश्लेषण पूरा हुआ।"
            : "Chemical strip colorimetric analysis complete."
        );
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Processing failed.");
    } finally {
      setUploading(false);
    }
  };

  const imageUrl = (image: BatchImage) => {
    if (image.url?.startsWith("http")) return image.url;
    if (image.url?.startsWith("/api/")) return new URL(API_BASE_URL).origin + image.url;
    return API_BASE_URL + (image.url ?? `/batches/${batchId}/images/${image.attachment_id}`);
  };

  return (
    <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900">
              {mr
                ? "कॅमेरा व कॉम्प्युटर व्हिजन विश्लेषण"
                : hi
                ? "कैमरा व कंप्यूटर विज़न विश्लेषण"
                : "Camera & Computer Vision Analysis"}
            </h3>
            <p className="text-xs text-stone-500">
              {mr
                ? "चाऱ्याचा पृष्ठभाग आणि युरिया चाचणी पट्टीचे जलद डिजिटल स्कॅनिंग"
                : hi
                ? "चारे की सतह और यूरिया टेस्ट स्ट्रिप की त्वरित डिजिटल जाँच"
                : "Rapid surface texture/mould screening & urea paper strip colorimetry"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab("surface"); setError(null); setMessage(null); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "surface"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {mr ? "चारा पृष्ठभाग स्कॅन" : hi ? "चारा सतह स्कैन" : "Feed Surface"}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("urea"); setError(null); setMessage(null); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "urea"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            {mr ? "युरिया पट्टी चाचणी" : hi ? "यूरिया स्ट्रिप टेस्ट" : "Urea Strip Test"}
          </button>
        </div>
      </div>

      {/* Upload & Capture Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 transition-colors">
          <ImagePlus className="w-4 h-4 text-emerald-700" />
          {activeTab === "surface"
            ? mr
              ? "चाऱ्याचा फोटो निवडा / कॅमेरा"
              : hi
              ? "चारे की फ़ोटो चुनें / कैमरा"
              : "Capture / Select Feed Photo"
            : mr
            ? "युरिया पट्टीचा फोटो निवडा"
            : hi
            ? "यूरिया स्ट्रिप की फ़ोटो चुनें"
            : "Capture / Select Test Strip"}
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError(null);
              setMessage(null);
              event.target.value = "";
            }}
          />
        </label>
        <span className="text-xs text-stone-400">JPEG, PNG, WebP (max 8MB)</span>
      </div>

      {/* Selected File Card */}
      {file && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-stone-50 border border-stone-200 p-3">
          {previewUrl && (
            <Image
              unoptimized
              width={72}
              height={72}
              src={previewUrl}
              alt="Selected feed"
              className="h-18 w-18 rounded-lg object-cover border border-stone-200"
            />
          )}
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-semibold text-stone-800 truncate">{file.name}</div>
            <div className="text-stone-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
          <button
            onClick={() => void submit()}
            disabled={uploading || file.size > 8 * 1024 * 1024}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
          >
            {uploading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {activeTab === "surface"
              ? mr
                ? "व्हिजन विश्लेषण करा"
                : hi
                ? "विज़न विश्लेषण करें"
                : "Analyze with CV"
              : mr
              ? "पट्टी तपासा"
              : hi
              ? "स्ट्रिप जाँचें"
              : "Read Strip Color"}
          </button>
        </div>
      )}

      {error && <p role="alert" className="text-xs font-medium text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>}
      {message && <p role="status" className="text-xs font-medium text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">{message}</p>}

      {/* Live Computer Vision Result Panel (Feed Surface Mode) */}
      {activeTab === "surface" && selectedAnalysis && (
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                {mr ? "व्हिजन स्क्रीनिंग निष्कर्ष" : hi ? "विज़न स्क्रीनिंग निष्कर्ष" : "Visual Screening Diagnostics"}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedAnalysis.mould_risk_level === "LOW"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedAnalysis.mould_risk_level === "LOW-MEDIUM"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                MOULD RISK: {selectedAnalysis.mould_risk_level ?? "LOW"}
              </span>
            </div>
            {selectedAnalysis.image_quality && (
              <span className="text-[11px] text-stone-500 font-medium">
                Sharpness: {selectedAnalysis.image_quality.sharpness_score ?? 0} ·{" "}
                {selectedAnalysis.image_quality.verdict === "PASSED" ? "✓ Focus OK" : "⚠ Check Light"}
              </span>
            )}
          </div>

          <p className="text-xs text-stone-700 font-medium leading-relaxed">
            {selectedAnalysis.screening_summary}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
              <div className="text-[10px] text-stone-500 font-semibold">{mr ? "टेक्सचर एकसारखेपणा" : "Texture Uniformity"}</div>
              <div className="text-sm font-extrabold text-stone-800">{selectedAnalysis.texture_uniformity ?? 0}%</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
              <div className="text-[10px] text-stone-500 font-semibold">{mr ? "रंग सुसंगतता" : "Color Consistency"}</div>
              <div className="text-sm font-extrabold text-stone-800">{selectedAnalysis.color_consistency_score ?? 0}%</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
              <div className="text-[10px] text-stone-500 font-semibold">{mr ? "असामान्य भाग" : "Anomaly Score"}</div>
              <div className="text-sm font-extrabold text-stone-800">{selectedAnalysis.anomaly_score ?? 0}/100</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
              <div className="text-[10px] text-stone-500 font-semibold">{mr ? "बुरशीसदृश क्षेत्र" : "Pale Coverage"}</div>
              <div className="text-sm font-extrabold text-stone-800">{selectedAnalysis.mould_coverage_pct ?? 0}%</div>
            </div>
          </div>

          {/* Color Breakdown Bar */}
          {selectedAnalysis.color_distribution && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-stone-600">
                {mr ? "रंग वितरण (Color Distribution):" : "Color Cluster Distribution:"}
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-200">
                <div
                  style={{ width: `${selectedAnalysis.color_distribution.green_foliage_pct}%` }}
                  className="bg-emerald-600"
                  title={`Green Foliage: ${selectedAnalysis.color_distribution.green_foliage_pct}%`}
                />
                <div
                  style={{ width: `${selectedAnalysis.color_distribution.golden_cured_pct}%` }}
                  className="bg-amber-400"
                  title={`Golden Cured: ${selectedAnalysis.color_distribution.golden_cured_pct}%`}
                />
                <div
                  style={{ width: `${selectedAnalysis.color_distribution.dark_spoilage_pct}%` }}
                  className="bg-stone-700"
                  title={`Dark Spoilage: ${selectedAnalysis.color_distribution.dark_spoilage_pct}%`}
                />
                <div
                  style={{ width: `${selectedAnalysis.color_distribution.pale_mould_like_pct}%` }}
                  className="bg-rose-300"
                  title={`Pale / Mould-like: ${selectedAnalysis.color_distribution.pale_mould_like_pct}%`}
                />
              </div>
              <div className="flex justify-between text-[9px] text-stone-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"/> Green: {selectedAnalysis.color_distribution.green_foliage_pct}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/> Golden: {selectedAnalysis.color_distribution.golden_cured_pct}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-700 inline-block"/> Dark: {selectedAnalysis.color_distribution.dark_spoilage_pct}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-300 inline-block"/> Pale: {selectedAnalysis.color_distribution.pale_mould_like_pct}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Urea Strip Colorimetry Result Panel */}
      {activeTab === "urea" && ureaAnalysis && (
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                {mr ? "युरिया पट्टी रंग निष्कर्ष" : "Urea Colorimetry Result"}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  ureaAnalysis.strip_status === "NEGATIVE"
                    ? "bg-emerald-100 text-emerald-800"
                    : ureaAnalysis.strip_status === "SUSPECTED_ADULTERATION"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {ureaAnalysis.strip_status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold">
              <span>Reaction Pad Color:</span>
              <span
                className="w-4 h-4 rounded-full border border-stone-300 inline-block shadow-2xs"
                style={{ backgroundColor: ureaAnalysis.colorimetric_data.pad_hex_color }}
              />
              <span className="font-mono text-[11px]">{ureaAnalysis.colorimetric_data.pad_hex_color}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-3 rounded-lg border border-stone-200">
              <div className="text-stone-500 font-medium">Estimated Urea Equivalent</div>
              <div className="text-sm font-bold text-stone-800">{ureaAnalysis.estimated_urea_equivalent}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200">
              <div className="text-stone-500 font-medium">Hue Angle / CIELab</div>
              <div className="text-sm font-bold text-stone-800">
                {ureaAnalysis.colorimetric_data.hsv.hue_deg}° Hue (L={ureaAnalysis.colorimetric_data.cielab.L})
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium">
            {ureaAnalysis.advisory}
          </div>
        </div>
      )}

      {/* Scientific Boundary Notice (Critical Requirement from User Spec) */}
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {mr ? "वैज्ञानिक मर्यादा सूचना:" : hi ? "वैज्ञानिक मर्यादा सूचना:" : "Scientific Boundary Notice:"}{" "}
          </span>
          {mr
            ? "कॅमेरा व व्हिजन अल्गोरिदम हे प्राथमिक स्क्रिनिंग साधन आहेत. हे ऍफ्लाटॉक्सिन किंवा आण्विक मायकोटॉक्सिन शोधत नाहीत. संशयास्पद दृश्य आढळल्यास प्रयोगशाळेत खात्री करा."
            : hi
            ? "कैमरा व विज़न एल्गोरिदम प्राथमिक स्क्रीनिंग साधन हैं। यह एफ़्लाटॉक्सिन या आणविक मायकोटॉक्सिन नहीं पहचानता। असामान्यता दिखने पर प्रयोगशाला में पुष्टि करें।"
            : "Camera visual screening and smartphone paper-strip colorimetry are rapid field triage tools. They do NOT detect aflatoxin or molecular mycotoxins. Any flagged anomaly warrants physical inspection or accredited laboratory confirmation."}
        </div>
      </div>

      {/* Previously Uploaded Batch Gallery */}
      {images.length > 0 && (
        <div className="border-t border-stone-100 pt-3">
          <p className="mb-2 text-xs font-bold text-stone-600">
            {mr ? "या बॅचसोबतचे फोटो (" + images.length + ")" : "Attached Batch Photos (" + images.length + ")"}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {images.map((img) => (
              <button
                key={img.attachment_id}
                type="button"
                onClick={() => {
                  if (img.analysis) setSelectedAnalysis(img.analysis);
                }}
                className="group relative rounded-xl border border-stone-200 overflow-hidden hover:ring-2 hover:ring-emerald-600 transition-all text-left"
              >
                <Image
                  unoptimized
                  width={68}
                  height={68}
                  src={imageUrl(img)}
                  alt={img.original_name}
                  className="h-17 w-17 object-cover"
                />
                {img.analysis && (
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    CV
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
