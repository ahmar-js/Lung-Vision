import { useRef, useState } from "react";
import { apiClient } from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileArchive, XCircle, Loader2, Info, Image as ImageIcon, Sparkles, ChevronDown, ChevronUp, Maximize2, X } from "lucide-react";

type PredictionResponse = {
  success: boolean;
  patient_id: string;
  predicted_class: string;
  predicted_class_index: number;
  confidence: number;
  class_probabilities: Record<string, number>;
  prediction_visualization?: string | null;
  attention_visualization?: string | null;
  feature_focus_visualization?: string | null;
  message: string;
  processing_info?: Record<string, any>;
};

export function ZipUploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string; title: string }>(
    { open: false, src: "", title: "" }
  );

  const reset = () => {
    setFile(null);
    setError(null);
    setIsUploading(false);
    setProgress(0);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const validate = (f: File): string | null => {
    const name = f.name.toLowerCase();
    const type = (f.type || "").toLowerCase();
    const isZipName = name.endsWith(".zip");
    const isZipMime = type.includes("zip") || type === "application/x-zip-compressed";
    if (!(isZipName || isZipMime)) return "Please upload a .zip file containing DICOMs.";
    // Optional: 1GB limit for safety
    const maxBytes = 1 * 1024 * 1024 * 1024;
    if (f.size > maxBytes) return "ZIP is too large. Please keep it under 1 GB.";
    return null;
  };

  const onSelect = (f: File) => {
    const v = validate(f);
    if (v) {
      setError(v);
      setFile(null);
    } else {
      setError(null);
      setFile(f);
      setResult(null);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onSelect(f);
  };

  const onUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const { data } = await apiClient.post<PredictionResponse>("/predict/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(pct);
          }
        },
        timeout: 10 * 60 * 1000,
      });

      setResult(data);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || "Upload failed. Please try again.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-b from-white to-blue-50/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Prediction Upload
            </CardTitle>
            <CardDescription>
              Upload a ZIP of a single patient DICOM folder. We'll run it through the AI and return prediction + visualizations.
            </CardDescription>
          </div>
          {file && !isUploading && (
            <Button variant="ghost" onClick={reset} className="text-gray-500 hover:text-red-600">
              <XCircle className="w-4 h-4 mr-2" />Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={[
            "rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
          ].join(" ")}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-700" />
            </div>
            <p className="font-medium text-gray-800">
              Drag & drop your .zip here, or click to browse
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Info className="w-4 h-4" />
              Zip a single patient folder containing .dcm files. Subfolders are OK.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onSelect(f);
              }}
            />
          </div>
        </div>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between bg-white rounded-md border p-3">
            <div className="flex items-center gap-3">
              <FileArchive className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">{file.name}</div>
                <div className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
            </div>
            <Button onClick={onUpload} disabled={isUploading} className="min-w-[120px]">
              {isUploading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading
                </span>
              ) : (
                <span>Analyze</span>
              )}
            </Button>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <XCircle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3">
            <div className="rounded-md border bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Predicted Class</div>
                  <div className="text-lg font-semibold">{result.predicted_class}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Confidence</div>
                  <div className="text-lg font-semibold">{(result.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">Patient ID: </span>
                  <span className="font-medium text-gray-800">{result.patient_id || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Message: </span>
                  <span className="text-gray-800">{result.message}</span>
                </div>
              </div>
            </div>

            {/* Class probabilities */}
            {result.class_probabilities && (
              <div className="rounded-md border bg-white p-3">
                <div className="text-sm font-medium text-gray-800 mb-2">Class Probabilities</div>
                <div className="space-y-2">
                  {Object.entries(result.class_probabilities).map(([label, prob]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{label.replace(/_/g, ' ')}</span>
                        <span>{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-blue-600"
                          style={{ width: `${Math.max(2, Math.min(100, prob * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(result.prediction_visualization || result.feature_focus_visualization) && (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {result.prediction_visualization && (
                    <div className="rounded-md border bg-white p-2">
                      <div className="flex items-center justify-between mb-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Prediction Summary
                        </div>
                        <button
                          type="button"
                          onClick={() => setLightbox({ open: true, src: `data:image/png;base64,${result.prediction_visualization}`, title: 'Prediction Summary' })}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Maximize2 className="w-4 h-4" /> View larger
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                        <img
                          src={`data:image/png;base64,${result.prediction_visualization}`}
                          alt="Prediction Visualization"
                          className="w-full max-h-[22rem] object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {result.feature_focus_visualization && (
                    <div className="rounded-md border bg-white p-2">
                      <div className="flex items-center justify-between mb-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Model Focus (Grad-CAM)
                        </div>
                        <button
                          type="button"
                          onClick={() => setLightbox({ open: true, src: `data:image/png;base64,${result.feature_focus_visualization}`, title: 'Model Focus (Grad-CAM)' })}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Maximize2 className="w-4 h-4" /> View larger
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                        <img
                          src={`data:image/png;base64,${result.feature_focus_visualization}`}
                          alt="Feature Focus Visualization"
                          className="w-full max-h-[22rem] object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced details (smooth collapse, no raw JSON) */}
            <div className="rounded-md border bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDetails((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>Details</span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <div className={`transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} px-3 pb-3`}> 
                {result.processing_info && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {Object.entries(result.processing_info).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 bg-gray-50 rounded border p-2">
                        <span className="text-gray-600 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="text-gray-900 font-medium break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lightbox overlay */}
        {lightbox.open && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between mb-2 text-white">
                <div className="text-sm md:text-base font-medium">{lightbox.title}</div>
                <button
                  type="button"
                  onClick={() => setLightbox({ open: false, src: '', title: '' })}
                  className="inline-flex items-center gap-1 text-white/90 hover:text-white"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-black/40 rounded-md overflow-auto flex items-center justify-center">
                <img src={lightbox.src} alt={lightbox.title} className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-gray-500">
          Tip: For best results, zip one patient folder at a time. The server finds .dcm recursively and processes the first DICOM series it detects.
        </div>
      </CardContent>
    </Card>
  );
}


