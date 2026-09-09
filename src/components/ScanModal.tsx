import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, QrCode, UploadCloud, CheckCircle2, AlertCircle, X,
  RefreshCw, Lock, Sparkles, ShieldAlert, ArrowRight
} from 'lucide-react'
import type { MaterialCase } from '../data/materialCases'

interface ScanModalProps {
  isOpen: boolean
  onClose: () => void
  materialCase: MaterialCase
  onScanSuccess: (scannedRecord: MaterialCase['intakeSample']) => void
}

export function ScanModal({ isOpen, onClose, materialCase, onScanSuccess }: ScanModalProps) {
  const [activeTab, setActiveTab] = useState<'sample' | 'camera' | 'upload'>('sample')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scannedResult, setScannedResult] = useState<MaterialCase['intakeSample'] | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Clean up camera stream on unmount or tab change
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Handle camera start
  const startCamera = async () => {
    setCameraError(null)
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera unavailable — use sample scan (getUserMedia not supported in this browser).')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Permission denied'
      setCameraError(`Camera unavailable — use sample scan (${msg}).`)
      setCameraActive(false)
    }
  }

  // Handle QR intake animation
  const runSampleScan = () => {
    setIsScanning(true)
    setScanProgress(0)
    setScannedResult(null)

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          setScannedResult(materialCase.intakeSample)
          return 100
        }
        return prev + 25
      })
    }, 200)
  }

  // Handle rund file drop/upload
  const handleFileUpload = () => {
    setIsScanning(true)
    setScanProgress(0)
    setTimeout(() => {
      setIsScanning(false)
      setScannedResult(materialCase.intakeSample)
    }, 600)
  }

  const handleApplyRecord = () => {
    if (scannedResult) {
      onScanSuccess(scannedResult)
      onClose()
    }
  }

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScannedResult(null)
      setIsScanning(false)
      setCameraError(null)
      setScanProgress(0)
    } else {
      stopCamera()
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="modal-backdrop" role="presentation" onClick={onClose}>
        <motion.div
          className="modal scan-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scan-modal-title"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-top">
            <div className="modal-top-title">
              <span className="modal-icon-badge"><QrCode size={20} /></span>
              <div>
                <h2 id="scan-modal-title">Field & Warehouse Label Intake</h2>
                <small className="modal-subtitle">Retrieve existing CPSE master record via barcode, QR, or ERP export</small>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
              <X size={20} />
            </button>
          </div>

          {/* Core Non-Negotiable Disclaimer Banner */}
          <div className="modal-guardrail-banner">
            <ShieldAlert size={16} />
            <span>
              <strong>Crucial Distinction:</strong> Scanning only retrieves an existing code/record from a native CPSE registry; scanning <em>does not prove technical equivalence</em>.
            </span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="scan-tab-nav" role="tablist">
            <button
              className={`scan-tab-btn ${activeTab === 'sample' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'sample'}
              onClick={() => {
                stopCamera()
                setActiveTab('sample')
              }}
            >
              <Sparkles size={16} />
              <span>Use QR intake</span>
            </button>

            <button
              className={`scan-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'camera'}
              onClick={() => {
                setActiveTab('camera')
                startCamera()
              }}
            >
              <Camera size={16} />
              <span>Enable camera (Secondary)</span>
            </button>

            <button
              className={`scan-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'upload'}
              onClick={() => {
                stopCamera()
                setActiveTab('upload')
              }}
            >
              <UploadCloud size={16} />
              <span>Import CPSE export / CSV</span>
            </button>
          </div>

          <div className="modal-scroll-content">
            {/* TAB 1: QR INTAKE */}
            {activeTab === 'sample' && (
              <div className="scan-tab-content">
                <div className="sample-qr-stage">
                  <div className={`qr-frame-visual ${isScanning ? 'scanning' : ''}`}>
                    {/* rund SVG QR Matrix */}
                    <svg className="sample-qr-svg" viewBox="0 0 160 160" width="160" height="160">
                      <rect width="160" height="160" fill="#ffffff" rx="8" />
                      {/* Corner markers */}
                      <rect x="12" y="12" width="40" height="40" fill="#153b3a" rx="4" />
                      <rect x="20" y="20" width="24" height="24" fill="#ffffff" />
                      <rect x="26" y="26" width="12" height="12" fill="#153b3a" />

                      <rect x="108" y="12" width="40" height="40" fill="#153b3a" rx="4" />
                      <rect x="116" y="20" width="24" height="24" fill="#ffffff" />
                      <rect x="122" y="26" width="12" height="12" fill="#153b3a" />

                      <rect x="12" y="108" width="40" height="40" fill="#153b3a" rx="4" />
                      <rect x="20" y="116" width="24" height="24" fill="#ffffff" />
                      <rect x="26" y="122" width="12" height="12" fill="#153b3a" />

                      {/* Data dots */}
                      <rect x="62" y="16" width="8" height="8" fill="#153b3a" />
                      <rect x="76" y="16" width="8" height="8" fill="#b75e3e" />
                      <rect x="90" y="16" width="8" height="8" fill="#153b3a" />
                      <rect x="62" y="32" width="16" height="8" fill="#153b3a" />
                      <rect x="84" y="32" width="8" height="8" fill="#5e3e3b" />
                      <rect x="62" y="48" width="8" height="8" fill="#153b3a" />
                      <rect x="76" y="48" width="22" height="8" fill="#153b3a" />
                      
                      <rect x="16" y="62" width="8" height="16" fill="#153b3a" />
                      <rect x="32" y="62" width="16" height="8" fill="#153b3a" />
                      <rect x="56" y="62" width="48" height="8" fill="#c69b4a" />
                      <rect x="112" y="62" width="16" height="8" fill="#153b3a" />
                      <rect x="136" y="62" width="8" height="16" fill="#153b3a" />

                      <rect x="16" y="86" width="16" height="8" fill="#153b3a" />
                      <rect x="40" y="86" width="8" height="16" fill="#153b3a" />
                      <rect x="56" y="78" width="8" height="24" fill="#153b3a" />
                      <rect x="72" y="78" width="16" height="16" fill="#153b3a" />
                      <rect x="96" y="78" width="8" height="24" fill="#153b3a" />
                      <rect x="112" y="86" width="16" height="8" fill="#153b3a" />
                      <rect x="136" y="86" width="8" height="8" fill="#153b3a" />

                      <rect x="62" y="112" width="22" height="8" fill="#153b3a" />
                      <rect x="90" y="112" width="8" height="16" fill="#153b3a" />
                      <rect x="62" y="128" width="8" height="16" fill="#153b3a" />
                      <rect x="76" y="128" width="22" height="8" fill="#153b3a" />
                      <rect x="112" y="112" width="32" height="8" fill="#153b3a" />
                      <rect x="112" y="128" width="16" height="16" fill="#153b3a" />
                      <rect x="136" y="136" width="8" height="8" fill="#153b3a" />
                    </svg>

                    {/* Laser scanning line */}
                    {isScanning && <div className="scan-laser-line" />}
                  </div>

                  <div className="sample-qr-info">
                    <h4>Sample Physical Bin Tag</h4>
                    <p>runs scanning a warehouse physical tag attached to valve stock at CPCL Manali Refinery.</p>
                    <div className="tag-preview-meta">
                      <span><strong>Format:</strong> QR Code (ISO/IEC 18004)</span>
                      <span><strong>Encoded ID:</strong> {materialCase.intakeSample.code}</span>
                    </div>

                    <button
                      className="button primary full-width"
                      onClick={runSampleScan}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <><RefreshCw size={16} className="spin-animate" /> Decoding QR Matrix ({scanProgress}%)...</>
                      ) : (
                        <><Sparkles size={16} /> Run QR Intake</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CAMERA STREAM */}
            {activeTab === 'camera' && (
              <div className="scan-tab-content camera-tab">
                {cameraError ? (
                  <div className="camera-error-banner">
                    <AlertCircle size={24} className="err-icon" />
                    <div>
                      <strong>{cameraError}</strong>
                      <p>Webcam permission was blocked, not detected, or unsupported on this device. You can use the instant sample scan instead.</p>
                      <button
                        className="button outline compact"
                        onClick={() => {
                          setActiveTab('sample')
                          runSampleScan()
                        }}
                      >
                        Switch to QR Intake
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="camera-viewfinder-container">
                    <div className="camera-viewfinder">
                      <video ref={videoRef} className="camera-feed" playsInline muted />
                      <div className="viewfinder-reticle">
                        <div className="corner tl" />
                        <div className="corner tr" />
                        <div className="corner bl" />
                        <div className="corner br" />
                        <div className="scan-laser-line" />
                      </div>
                    </div>
                    <div className="camera-controls">
                      <p>Camera preview is available for intake framing. Select a decoded label or continue with the current intake record.</p>
                      <button
                        className="button primary compact"
                        onClick={() => {
                          setScannedResult(materialCase.intakeSample)
                        }}
                      >
                        <CheckCircle2 size={15} /> Use current intake record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CSV / ERP ROW UPLOAD */}
            {activeTab === 'upload' && (
              <div className="scan-tab-content upload-tab">
                <div className="rund-upload-zone" onClick={handleFileUpload}>
                  <UploadCloud size={36} />
                  <h4>run CSV / SAP MARA Table Import</h4>
                  <p>Click to load the ERP extraction line for <code>{materialCase.intakeSample.code}</code>.</p>
                  <div className="upload-chips">
                    <span>SAP S/4HANA MM</span>
                    <span>Oracle SCM CSV</span>
                    <span>GeM Catalog TSV</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCANNED RECORD RESULT CARD */}
            {scannedResult && (
              <motion.div
                className="scanned-result-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="scanned-result-head">
                  <div className="scanned-badge">
                    <CheckCircle2 size={16} />
                    <span>Legacy Record Retrieved</span>
                  </div>
                  <span className="scanned-source-pill">{scannedResult.sourceSystem}</span>
                </div>

                <div className="scanned-result-grid">
                  <div className="scanned-field">
                    <span className="field-lbl">Originating CPSE</span>
                    <strong className="field-val">{scannedResult.org} ({scannedResult.plant})</strong>
                  </div>
                  <div className="scanned-field">
                    <span className="field-lbl">Legacy Material Code</span>
                    <code className="field-code">{scannedResult.code}</code>
                  </div>
                  <div className="scanned-field full">
                    <span className="field-lbl">Legacy Description</span>
                    <strong className="field-val-desc">{scannedResult.description}</strong>
                  </div>
                  <div className="scanned-field">
                    <span className="field-lbl">Legacy UOM</span>
                    <span className="field-val">{scannedResult.uom}</span>
                  </div>
                  <div className="scanned-field">
                    <span className="field-lbl">Intake Method</span>
                    <span className="field-val">{scannedResult.scanType}</span>
                  </div>
                </div>

                <div className="scanned-card-actions">
                  <button className="button primary full-width" onClick={handleApplyRecord}>
                    Send Record to Fingerprint Engine <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="modal-footer-bar">
            <span className="modal-footnote">
              <Lock size={12} /> controlled workspace data. Field scan retrieves native record without database modification.
            </span>
            <button className="button outline" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
