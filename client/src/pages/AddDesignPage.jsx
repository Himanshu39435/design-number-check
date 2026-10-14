import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, PlusCircle, Save, SearchCheck } from 'lucide-react';
import api from '../api/client';
import PhotoUploader from '../components/PhotoUploader';

export default function AddDesignPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [designNumber, setDesignNumber] = useState('');
  const [size, setSize] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [duplicateResult, setDuplicateResult] = useState(null);
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const selectedFile = location.state?.photoFile;
    if (selectedFile instanceof File && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, [location.state]);

  const canSave = useMemo(() => file && designNumber.trim() && size.trim() && rate !== '' && Number(rate) >= 0, [file, designNumber, size, rate]);

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setMessage('Only image files are allowed.');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setDuplicateResult(null);
    setMessage('');
  };

  const handleCheckDuplicate = async () => {
    if (!file) {
      setMessage('Please upload a photo to check for duplicates.');
      return;
    }

    setIsChecking(true);
    setMessage('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/designs/check-duplicate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDuplicateResult(data.data || null);

      if (data.data?.isDuplicate) {
        setMessage('Possible Duplicate Design Found');
      } else {
        setMessage('No matching design found. You can create a new design.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Duplicate check failed.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!file || !designNumber.trim() || !size.trim() || rate === '' || Number(rate) < 0) {
      setMessage('Please complete all required fields.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('designNumber', designNumber);
      formData.append('size', size);
      formData.append('rate', rate);
      formData.append('description', description);

      const response = await api.post('/designs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Design saved successfully.');
      setFile(null);
      setPreview('');
      setDesignNumber('');
      setSize('');
      setRate('');
      setDescription('');
      setDuplicateResult(null);
    } catch (error) {
      const duplicate = error.response?.data?.duplicate;
      if (error.response?.status === 409 && duplicate?.design) {
        setDuplicateResult(duplicate);
        setMessage(`This photo is already saved with design number ${duplicate.design.designNumber}.`);
      } else {
        setMessage(
          error.response?.data?.message ||
        (error.request
          ? 'Cannot reach the backend at http://localhost:5000. Start the server in a second terminal, then try again.'
          : error.message || 'Could not save design.')
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-10 2xl:p-12">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-700">New Design</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Add Design</h1>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start lg:gap-6 2xl:gap-8">
        <div className="min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
          <PhotoUploader label="Design Photo" preview={preview} onFileSelect={handleFileSelection} onClear={() => { setFile(null); setPreview(''); setDuplicateResult(null); }} required />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Design Number *</label>
              <input value={designNumber} onChange={(e) => setDesignNumber(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none focus:border-primary-500" placeholder="1250-KPD-MEHNDI" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Size *</label>
              <input value={size} onChange={(e) => setSize(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none focus:border-primary-500" placeholder="e.g. M, XL, 40" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Rate *</label>
              <input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none focus:border-primary-500" placeholder="895" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none focus:border-primary-500" placeholder="Fabric, color, pattern, or other design details" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleCheckDuplicate} className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">
              <SearchCheck size={16} />
              {isChecking ? 'Checking...' : 'Check Duplicate'}
            </button>
            <button type="button" onClick={handleSave} disabled={!canSave || isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Design'}
            </button>
          </div>

          {message && (
            <div className={`flex items-start gap-2 rounded-xl border px-3 py-3 text-sm ${message.includes('successfully') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : message.includes('No matching design found') ? 'border-primary-200 bg-primary-50 text-primary-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
              {message.includes('successfully') ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-primary-700" />
            <h2 className="text-lg font-semibold text-slate-900">Duplicate Check</h2>
          </div>

          {duplicateResult?.design ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={16} />
                Design Matched
              </div>
              <img src={duplicateResult.design.imageUrl} alt="Existing design" className="h-48 w-full rounded-2xl object-cover" />
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Design No:</strong> {duplicateResult.design.designNumber}</p>
                <p><strong>Rate:</strong> ₹{Number(duplicateResult.design.rate).toLocaleString('en-IN')}</p>
                <p><strong>Similarity:</strong> {duplicateResult.similarity}%</p>
                <p><strong>Date uploaded:</strong> {new Date(duplicateResult.design.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="grid gap-2">
                <button type="button" onClick={() => navigate(`/designs/${duplicateResult.design._id}`)} className="rounded-xl bg-primary-600 px-3 py-2 text-sm font-medium text-white">View Existing Design</button>
                <button type="button" onClick={() => { setFile(null); setPreview(''); setDuplicateResult(null); setMessage('Upload cancelled.'); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Cancel Upload</button>
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">This upload is blocked because the photo is already registered. Uploading the same photo again is not allowed.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Run a duplicate check on the current image to compare it against saved designs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
