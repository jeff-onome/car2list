
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';
import { useNavigate } from 'react-router-dom';

const Verification: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [kycData, setKycData] = useState<{
    idFront?: { file: File, preview: string },
    idBack?: { file: File, preview: string },
    selfie?: { file: File, preview: string }
  }>({});

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream, step]);

  const startCamera = async () => {
    setIsCameraStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      Swal.fire('Camera Error', 'Could not access your camera.', 'error');
    } finally {
      setIsCameraStarting(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      fetch(dataUrl).then(res => res.blob()).then(blob => {
        const file = new File([blob], "selfie_capture.jpg", { type: "image/jpeg" });
        setKycData(prev => ({ ...prev, selfie: { file, preview: dataUrl } }));
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof kycData) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycData(prev => ({ ...prev, [type]: { file, preview: reader.result as string } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitKYC = async () => {
    if (!kycData.idFront || !kycData.idBack || !kycData.selfie || !user) return;
    setIsUploading(true);
    try {
      const frontUrl = await storageService.uploadImage(kycData.idFront.file);
      const backUrl = await storageService.uploadImage(kycData.idBack.file);
      const selfieUrl = await storageService.uploadImage(kycData.selfie.file);

      await dbService.updateUser(user.id, {
        kycStatus: 'pending',
        kycDocuments: {
          front: frontUrl!,
          back: backUrl!,
          selfie: selfieUrl!,
          submittedAt: new Date().toISOString()
        }
      });

      // Notify User
      await dbService.createNotification(user.id, {
        title: 'KYC Assets Received',
        message: 'Your verification documents have been successfully queued for review.',
        type: 'info'
      });

      // Notify Admins
      await dbService.notifyAllAdmins({
        title: 'New KYC Pending',
        message: `An identity clearance request has been submitted by ${user.name}.`,
        type: 'warning'
      });

      Swal.fire({
        title: 'Documents Locked',
        text: 'Review is underway. You will be notified of the result.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fff'
      }).then(() => navigate(user.role === 'DEALER' ? '/dealer/dashboard' : '/user/overview'));

    } catch (error) {
      Swal.fire('Upload Failed', 'Synchronization error occurred.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (user?.isVerified) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md glass p-12 rounded-[3rem] border-white/5">
           <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
           </div>
           <h1 className="text-3xl font-bold uppercase tracking-tighter">Cleared for Access</h1>
           <p className="text-zinc-500 text-xs uppercase tracking-widest leading-relaxed">Identity verified at Tier 3 tier.</p>
           <button onClick={() => navigate(-1)} className="bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest w-full">Return to Portal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Identity Clearance</h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Biometric Submission Required</p>
        </header>

        <div className="glass p-8 md:p-12 rounded-[3rem] space-y-10 shadow-2xl relative">
          <div className="flex justify-between items-center relative z-10">
             {[1, 2, 3].map(s => (
               <div key={s} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all ${step >= s ? 'bg-white border-white text-black' : 'border-white/10 text-zinc-700'}`}>
                    {s}
                  </div>
                  <span className={`text-[8px] uppercase tracking-widest font-bold ${step === s ? 'text-white' : 'text-zinc-700'}`}>
                    {s === 1 ? 'FRONT' : s === 2 ? 'BACK' : 'SELFIE'}
                  </span>
               </div>
             ))}
             <div className="absolute top-5 left-10 right-10 h-0.5 bg-white/5 -z-10" />
          </div>

          <div className="space-y-8">
            {step === 1 && (
              <UploadCard title="ID (Front)" desc="Scan passport/national ID front." preview={kycData.idFront?.preview} onFile={(e:any) => handleFileUpload(e, 'idFront')} />
            )}
            {step === 2 && (
              <UploadCard title="ID (Back)" desc="Scan passport/national ID back." preview={kycData.idBack?.preview} onFile={(e:any) => handleFileUpload(e, 'idBack')} />
            )}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tighter mb-2">Live Identity Capture</h3>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed">Real-time facial scanning enabled.</p>
                </div>
                <div className="relative aspect-video rounded-3xl border-2 border-white/5 overflow-hidden flex flex-col items-center justify-center bg-zinc-900 group">
                  {kycData.selfie?.preview ? (
                    <div className="relative w-full h-full">
                       <img src={kycData.selfie.preview} className="w-full h-full object-cover" alt="Captured" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => { setKycData(p => ({ ...p, selfie: undefined })); startCamera(); }} className="bg-white text-black px-6 py-2 rounded-full font-bold text-[8px] uppercase tracking-widest">Retake Photo</button>
                       </div>
                    </div>
                  ) : cameraStream ? (
                    <div className="relative w-full h-full">
                       <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-white/40 border-dashed rounded-full" />
                       </div>
                       <button onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-2xl">Capture Identity</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6 p-10 text-center">
                       <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-zinc-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                       </div>
                       <button onClick={startCamera} disabled={isCameraStarting} className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white">Enable Camera</button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-8">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-grow border border-white/10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">Previous</button>
            )}
            {step < 3 ? (
              <button disabled={(!kycData.idFront && step === 1) || (!kycData.idBack && step === 2)} onClick={() => setStep(step + 1)} className="flex-grow bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all disabled:opacity-30">Next Stage</button>
            ) : (
              <button onClick={submitKYC} disabled={isUploading || !kycData.selfie} className="flex-grow bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all shadow-xl disabled:opacity-30">
                {isUploading ? 'Finalizing...' : 'Submit Verification'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadCard = ({ title, desc, preview, onFile }: any) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold uppercase tracking-tighter mb-2">{title}</h3>
      <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-sm">{desc}</p>
    </div>
    <div className="relative aspect-video rounded-3xl border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center group hover:bg-white/5 transition-all">
      {preview ? (
        <>
          <img src={preview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-[8px] uppercase tracking-widest">Replace</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFile} />
          </label>
        </>
      ) : (
        <label className="inset-0 absolute cursor-pointer flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-zinc-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={onFile} />
        </label>
      )}
    </div>
  </div>
);

export default Verification;
