"use client";

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, HelpCircle, RefreshCw, XCircle } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';

interface EvidencePanelProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ lang, data, farmerMode }) => {
  const t = dictionary[lang];
  const { evidence } = data;
  const { metrics, trust_status, evidence_level, evidence_score, untrusted_reasons, recommendation } = evidence;

  const [showExplainModal, setShowExplainModal] = useState(false);

  // Status Styling Config
  const getStatusBadge = () => {
    switch (trust_status) {
      case 'TRUSTED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800',
          badge: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
          label: t.trusted
        };
      case 'RESULT NOT TRUSTED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-900',
          badge: 'bg-rose-600 text-white animate-pulse',
          icon: XCircle,
          label: t.resultNotTrusted
        };
      case 'RETEST RECOMMENDED':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-900',
          badge: 'bg-amber-600 text-white',
          icon: RefreshCw,
          label: t.retestRecommended
        };
      case 'SUSPECTED ADULTERATION':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-900',
          badge: 'bg-purple-700 text-white',
          icon: ShieldAlert,
          label: t.suspectedAdulteration
        };
      default:
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-900',
          badge: 'bg-orange-600 text-white',
          icon: AlertTriangle,
          label: t.storageAlert
        };
    }
  };

  const statusConfig = getStatusBadge();
  const StatusIcon = statusConfig.icon;
  const farmerTitle = lang === 'mr' ? 'डेमो तपासणीचा निकाल' : lang === 'hi' ? 'डेमो जाँच का नतीजा' : 'Demo check result';
  const farmerRecommendation = lang === 'mr'
    ? ({ TRUSTED: 'या उदाहरणात मोठा इशारा नाही. हा प्रत्यक्ष चाचणीचा निकाल नाही.', 'RETEST RECOMMENDED': 'चारा नीट मिसळा आणि वेगवेगळ्या पाच ठिकाणांहून नमुने घेऊन पुन्हा तपासा.', 'RESULT NOT TRUSTED': 'या उदाहरणात पोषणाचे आकडे रोखले आहेत. प्रत्यक्ष नमुना प्रयोगशाळेत तपासा.', 'SUSPECTED ADULTERATION': 'बाहेरील पदार्थाचा डेमो इशारा आहे; भेसळीचा रासायनिक पुरावा नाही.', 'TRUSTED WITH STORAGE WARNING': 'साठवणीचा डेमो इशारा आहे. तापमान व pH प्रत्यक्ष मोजून तपासा.'}[trust_status] ?? recommendation)
    : (lang === 'hi'
      ? ({ TRUSTED: 'इस उदाहरण में कोई बड़ा संकेत नहीं है। यह वास्तविक जाँच का परिणाम नहीं है।', 'RETEST RECOMMENDED': 'चारे को अच्छी तरह मिलाएँ और पाँच अलग जगहों से नमूने लेकर दोबारा जाँचें।', 'RESULT NOT TRUSTED': 'इस उदाहरण में पोषण के आँकड़े रोक दिए गए हैं। असली नमूने की प्रयोगशाला में जाँच करें।', 'SUSPECTED ADULTERATION': 'यह बाहरी पदार्थ का डेमो संकेत है; मिलावट का रासायनिक प्रमाण नहीं।', 'TRUSTED WITH STORAGE WARNING': 'भंडारण का डेमो संकेत है। तापमान और pH वास्तविक रूप से जाँचें।'}[trust_status] ?? recommendation)
      : recommendation);

  return (
    <div className="space-y-6">
      
      {/* Primary Trust Status Banner */}
      <div className={`p-6 rounded-2xl border ${statusConfig.bg} transition-all shadow-sm`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-2xl ${statusConfig.badge} shadow-lg shrink-0 mt-1 md:mt-0`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusConfig.badge}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  {farmerMode ? (lang === 'mr' ? 'डेमो पातळी' : lang === 'hi' ? 'डेमो स्तर' : 'Demo level') : `EVIDENCE LEVEL: ${evidence_level}`}
                </span>
              </div>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                {farmerMode ? farmerTitle : trust_status === 'TRUSTED' ? 'Scenario labelled trusted · simulated only' : 'AI Evidence Safeguard Active'}
              </h2>
              <p className="text-xs font-medium text-stone-700 mt-1 max-w-2xl leading-relaxed">
                {farmerMode ? farmerRecommendation : recommendation}
              </p>
            </div>
          </div>

          {/* Explain This Button */}
          <button
            onClick={() => setShowExplainModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-stone-300 font-bold text-xs text-stone-800 hover:bg-stone-50 shadow-sm transition-all shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-[#2d6a4f]" />
            <span>{t.explainThis}</span>
          </button>

        </div>

        {/* Untrusted Reasons Callout */}
        {!farmerMode && untrusted_reasons.length > 0 && (
          <div className="mt-6 pt-4 border-t border-rose-200/60 bg-white/80 p-4 rounded-xl">
            <div className="text-xs font-extrabold text-rose-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{lang === 'mr' ? 'या डेमोमध्ये हा इशारा का दिसत आहे?' : lang === 'hi' ? 'इस डेमो में चेतावनी क्यों दिखाई गई है?' : 'Why is this demo result flagged?'}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-800 font-medium pl-6 list-disc">
              {untrusted_reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5 Evidence Factor Breakdown */}
      {!farmerMode && <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#1a1e1b]">Heuristic evidence demonstration</h3>
            <p className="text-xs text-stone-500">Scenario-derived indicators only. No calibrated probability, trained nutrient model, image analysis, or field validation is connected.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-400 font-semibold">Demo score · not probability</div>
            <div className="text-2xl font-black text-[#1b4332]">{evidence_score} / 100</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">1. Spectral Quality</div>
            <div className="text-xl font-black text-[#1b4332] mt-1">{metrics.spectral_quality}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#40916c] h-full" style={{ width: `${metrics.spectral_quality}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Signal-to-noise ratio</div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">2. Sample Consistency</div>
            <div className="text-xl font-black text-[#1b4332] mt-1">{metrics.sample_consistency}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#52b788] h-full" style={{ width: `${metrics.sample_consistency}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-400 mt-1">5-point scan variance</div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">3. Calibration Fit</div>
            <div className="text-xl font-black text-[#1b4332] mt-1">{metrics.calibration_fit}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#2d6a4f] h-full" style={{ width: `${metrics.calibration_fit}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Mahalanobis Dist: {metrics.ood_distance}</div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">4. Certainty Band</div>
            <div className="text-xl font-black text-[#1b4332] mt-1">{100 - metrics.prediction_uncertainty}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#74c69d] h-full" style={{ width: `${100 - metrics.prediction_uncertainty}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Uncertainty: {metrics.prediction_uncertainty}%</div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">5. Visual Agreement</div>
            <div className="text-xl font-black text-[#1b4332] mt-1">{metrics.visual_agreement}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#d4a373] h-full" style={{ width: `${metrics.visual_agreement}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Camera anomaly screen</div>
          </div>

        </div>

        {/* Rapid Adulteration & Mineral Screening Status */}
        {data.nutritional_analysis?.sand_silica_screening && (
          <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <span className="font-bold text-stone-700 block">Sand / Silica (Acid-Insoluble Ash)</span>
                <span className="text-[11px] text-stone-500">
                  Estimated AIA: <b>{data.nutritional_analysis.sand_silica_screening.estimated_aia_pct}%</b>
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                data.nutritional_analysis.sand_silica_screening.badge_color === "EMERALD"
                  ? "bg-emerald-100 text-emerald-800"
                  : data.nutritional_analysis.sand_silica_screening.badge_color === "AMBER"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800 animate-pulse"
              }`}>
                {data.nutritional_analysis.sand_silica_screening.risk_label}
              </span>
            </div>

            {data.nutritional_analysis.mineral_balance && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div>
                  <span className="font-bold text-stone-700 block">Mineral Balance (Ca:P Ratio)</span>
                  <span className="text-[11px] text-stone-500">
                    Ratio: <b>{data.nutritional_analysis.mineral_balance.ca_to_p_ratio} : 1</b>
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.nutritional_analysis.mineral_balance.badge_color === "EMERALD"
                    ? "bg-emerald-100 text-emerald-800"
                    : data.nutritional_analysis.mineral_balance.badge_color === "BLUE"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {data.nutritional_analysis.mineral_balance.status_label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>}

      {/* EXPLAIN THIS MODAL */}
      {showExplainModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-2 text-[#1b4332]">
                <HelpCircle className="w-5 h-5 text-[#52b788]" />
                <h3 className="text-lg font-black">{t.explainThis}</h3>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 font-medium">
                <strong className="text-stone-900">{lang === 'mr' ? 'हा डेमो काय दाखवतो?' : lang === 'hi' ? 'यह डेमो क्या दिखाता है?' : 'What does this demo show?'}</strong><br />
                {lang === 'mr' ? 'हे तयार केलेल्या आकड्यांमधून वेगवेगळ्या परिस्थिती दाखवते. प्रत्यक्ष चारा तपासलेला नाही आणि पोषणाचे आकडे प्रमाणित नाहीत.' : lang === 'hi' ? 'यह बनाए गए आँकड़ों से अलग-अलग स्थितियाँ दिखाता है। असली चारे की जाँच नहीं हुई है और पोषण के आँकड़े प्रमाणित नहीं हैं।' : 'It shows example scenarios using generated values. No real feed was tested and the nutrition figures are not validated.'}
              </div>

              <div>
                <strong className="text-stone-900 block mb-1">{lang === 'mr' ? 'या डेमोचा संदेश:' : lang === 'hi' ? 'इस डेमो का संदेश:' : 'Demo message:'}</strong>
                <p className="p-3 rounded-lg bg-stone-100 font-semibold text-stone-800">
                  {farmerMode ? farmerRecommendation : recommendation}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1b4332] text-white font-bold text-xs"
              >
                {lang === 'mr' ? 'समजले' : lang === 'hi' ? 'समझ गया' : 'Got it'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
