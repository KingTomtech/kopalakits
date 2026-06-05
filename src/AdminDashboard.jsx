import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Trash2, Save, Upload, LogOut, Edit2, Download, RefreshCw } from 'lucide-react';
import { STORAGE_KEY, BANNER_KEY, AUTH_TOKEN_KEY, ADMIN_CATEGORIES } from './constants.js';


const defaultProduct = { id: Date.now(), name: '', price: '', category: 'International', desc: '', image: '' };


async function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let { width, height } = img;
      if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      try { resolve(canvas.toDataURL('image/webp', quality)); }
      catch { resolve(canvas.toDataURL('image/jpeg', quality)); }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminDashboard({ onExit }) {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(AUTH_TOKEN_KEY));
  const [token, setToken] = useState(() => sessionStorage.getItem(AUTH_TOKEN_KEY) || '');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ ...defaultProduct });
  const [toast, setToast] = useState('');
  const [jsonView, setJsonView] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerEditing, setBannerEditing] = useState(false);
  const [adminTab, setAdminTab] = useState('products'); // 'products' | 'banner' | 'fan'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const addFileRef = useRef(null);

  const api = useCallback(async (path, opts = {}) => {
    const res = await fetch(`/api${path}`, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.body && typeof opts.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (res.status === 401) {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthed(false);
      setToken('');
      throw new Error('Session expired. Please log in again.');
    }
    return res;
  }, [token]);

  const loadBannerFromAPI = useCallback(async () => {
    try {
      const res = await api('/banner');
      const data = await res.json();
      setBannerText(data.text || ''); setBannerActive(data.active || false);
      localStorage.setItem(BANNER_KEY, JSON.stringify(data));
    } catch {
      const saved = localStorage.getItem(BANNER_KEY);
      if (saved) { const b = JSON.parse(saved); setBannerText(b.text || ''); setBannerActive(b.active || false); }
    }
  }, [api]);

  const loadProducts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api('/products');
      const data = await res.json();
      if (Array.isArray(data)) { setProducts(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    } catch (err) {
      setError(err.message || 'Failed to load products');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProducts(JSON.parse(stored));
    } finally { setLoading(false); }
  }, [api]);

  useEffect(() => {
    // Initial admin data load when the user authenticates. The state updates
    // here are async fetch completions, not cascading renders. Suppressed
    // for the standard mount/auth-gate pattern.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (authed) {
      loadProducts();
      loadBannerFromAPI();
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [authed, loadProducts, loadBannerFromAPI]);

  const persistProducts = async (updated) => {
    setSaving(true); setError('');
    try {
      const res = await api('/products', { method: 'POST', body: JSON.stringify(updated) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setProducts(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('kopala_products_updated'));
      showToast('Saved!');
    } catch (err) { setError(err.message); showToast('Save failed'); }
    finally { setSaving(false); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const login = async (e) => {
    e.preventDefault(); setPwError('');
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setToken(data.token); setAuthed(true);
    } catch (err) { setPwError(err.message || 'Wrong password'); }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthed(false);
    setToken('');
    onExit();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    const updated = products.map(p => p.id === editingId ? { ...editForm, price: Number(editForm.price) } : p);
    await persistProducts(updated);
    setEditingId(null);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await persistProducts(products.filter(p => p.id !== id));
  };

  const addProduct = async () => {
    if (!addForm.name || !addForm.price) return showToast('Name and price required');
    const newProduct = { ...addForm, id: Date.now(), price: Number(addForm.price) };
    await persistProducts([...products, newProduct]);
    setIsAdding(false);
    setAddForm({ ...defaultProduct, id: Date.now() });
  };

  const handleImageUpload = async (e, target) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.8);
      if (target === 'edit') setEditForm(f => ({ ...f, image: compressed }));
      else setAddForm(f => ({ ...f, image: compressed }));
      showToast('Image compressed');
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (target === 'edit') setEditForm(f => ({ ...f, image: ev.target.result }));
        else setAddForm(f => ({ ...f, image: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products.json'; a.click();
  };

  const openJsonEditor = () => {
    setJsonText(JSON.stringify(products, null, 2));
    setJsonError('');
    setJsonView(true);
  };

  const saveJson = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Must be an array');
      await persistProducts(parsed);
      setJsonView(false);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const saveBannerToAPI = async (text, active) => {
    setSaving(true);
    try {
      const res = await api('/banner', { method: 'POST', body: JSON.stringify({ text, active }) });
      if (!res.ok) throw new Error('Failed to save banner');
      localStorage.setItem(BANNER_KEY, JSON.stringify({ text, active }));
      window.dispatchEvent(new Event('kopala_banner_updated'));
      showToast(active ? 'Banner published!' : 'Banner hidden'); setBannerEditing(false);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const resetToDefault = async () => {
    if (!window.confirm('Reset all products to default? This cannot be undone.')) return;
    const res = await fetch('/products.json');
    const data = await res.json();
    await persistProducts(data);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm">
          <h1 className="text-3xl font-black text-[#3F4A26] mb-2 text-center">Admin Panel</h1>
          <p className="text-center text-gray-500 mb-8 text-sm">Kopala Kits</p>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(''); }}
              className="w-full border-2 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:border-[#5E6B3C]"
            />
            {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
            <button type="submit" className="w-full py-3 bg-[#5E6B3C] text-white font-bold rounded-2xl text-lg hover:brightness-110 transition">
              Login
            </button>
          </form>
          <button onClick={onExit} className="mt-6 w-full text-center text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {toast && (
        <div className="fixed top-6 right-6 z-[999] bg-[#5E6B3C] text-white px-6 py-3 rounded-2xl shadow-xl font-semibold text-sm animate-pulse">
          {toast}
        </div>
      )}
      {error && (
        <div className="fixed top-6 right-6 z-[998] bg-red-100 border-2 border-red-300 text-red-800 px-6 py-3 rounded-2xl shadow-xl text-sm font-semibold mt-14">
          {error}
          <button onClick={() => setError('')} className="ml-3 text-red-600 hover:text-red-800 font-bold">✕</button>
        </div>
      )}

      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black text-[#3F4A26]">KOPALA KITS — Admin</h1>
          <p className="text-xs text-gray-500">
            {products.length} products
            {loading && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Loading…</span>}
            {saving && <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Saving…</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetToDefault} title="Reset to default" className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600" >
            <RefreshCw size={18} />
          </button>
          <button onClick={openJsonEditor} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold">
            Edit JSON
          </button>
          <button onClick={exportJson} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold">
            <Download size={16} /> Export
          </button>
          <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold">
            ← Shop
          </button>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="bg-white border-b px-6">
        <div className="max-w-5xl mx-auto flex gap-1">
          {[
            { id: 'products', label: 'Products' },
            { id: 'banner', label: 'Banner' },
            { id: 'fan', label: 'Fan Zone' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className="px-4 py-3 text-sm font-bold border-b-2 transition"
              style={{
                borderBottomColor: adminTab === tab.id ? '#3F4A26' : 'transparent',
                color: adminTab === tab.id ? '#3F4A26' : '#6B655A',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">

        {adminTab === 'fan' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black" style={{ color: '#3F4A26' }}>Fan Zone</h2>
            <p className="text-sm" style={{ color: '#6B655A' }}>
              Match predictions and tournaments are public and don't need admin. This
              page summarises the live data and links to the public pages.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="/predictions" target="_blank" rel="noreferrer" className="block rounded-2xl p-5 bg-white border-2 border-amber-300 hover:shadow-md transition">
                <div className="text-2xl mb-1">⚽</div>
                <div className="font-black" style={{ color: '#3F4A26' }}>Predictions</div>
                <div className="text-xs mt-1" style={{ color: '#6B655A' }}>
                  Live upcoming fixtures for the teams we sell. Users pick a winner;
                  votes are stored in KV.
                </div>
                <div className="mt-3 text-xs font-bold" style={{ color: '#5E6B3C' }}>View public page →</div>
              </a>
              <a href="/tournaments" target="_blank" rel="noreferrer" className="block rounded-2xl p-5 bg-white border-2 border-amber-300 hover:shadow-md transition">
                <div className="text-2xl mb-1">🏆</div>
                <div className="font-black" style={{ color: '#3F4A26' }}>Tournaments</div>
                <div className="text-xs mt-1" style={{ color: '#6B655A' }}>
                  Bracket-style prediction contests. World Cup 2026, Kopala Cup
                  2026, more on the way.
                </div>
                <div className="mt-3 text-xs font-bold" style={{ color: '#5E6B3C' }}>View public page →</div>
              </a>
            </div>
            <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: '#D8C3A5' }}>
              <div className="font-black text-sm" style={{ color: '#3F4A26' }}>API endpoints (for reference)</div>
              <ul className="mt-2 text-xs font-mono space-y-1" style={{ color: '#6B655A' }}>
                <li>GET    /api/predictions            — list fixtures + tallies</li>
                <li>POST   /api/predictions/submit     — cast a vote</li>
                <li>DELETE /api/predictions/:id      — remove a vote</li>
                <li>POST   /api/predictions/refresh   — re-pull from TheSportsDB</li>
                <li>GET    /api/predictions/leaderboard</li>
                <li>GET    /api/tournaments</li>
                <li>GET    /api/tournaments/:id</li>
                <li>POST   /api/tournaments/pick      — cast a tournament pick</li>
              </ul>
            </div>
            <div className="rounded-2xl p-5 bg-amber-50 border-2 border-amber-200">
              <div className="font-black text-sm" style={{ color: '#3F4A26' }}>Coming soon</div>
              <ul className="mt-2 text-xs space-y-1" style={{ color: '#6B655A' }}>
                <li>• Admin UI to set match results (so picks can be scored)</li>
                <li>• Admin UI to create / edit tournaments and bracket rounds</li>
                <li>• Push notifications to players when their pick is correct</li>
              </ul>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENT BANNER EDITOR */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-amber-300 p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">📢</span>
              <div>
                <p className="font-bold text-sm text-gray-800">Announcement Banner</p>
                <p className="text-xs text-gray-500">{bannerActive ? <span className="text-green-600 font-semibold">● Live on shop</span> : <span className="text-gray-400">Hidden</span>}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {bannerActive && !bannerEditing && (
                <button
                  onClick={async () => { setBannerActive(false); saveBannerToAPI(bannerText, false); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition"
                >
                  Hide
                </button>
              )}
              <button
                onClick={() => setBannerEditing(e => !e)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
              >
                {bannerEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          {bannerEditing && (
            <div className="mt-4 space-y-3">
              <input
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                placeholder="e.g. 🔥 New Retro Stock Just Landed — Order via WhatsApp!"
                className="w-full border-2 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#5E6B3C]"
                maxLength={120}
              />
              <div className="flex gap-3 items-center">
                <button
                  onClick={async () => { setBannerActive(true); saveBannerToAPI(bannerText, true); }}
                  disabled={!bannerText.trim()}
                  className="px-5 py-2.5 bg-[#5E6B3C] text-white rounded-2xl text-sm font-bold hover:brightness-110 disabled:opacity-40 transition"
                >
                  Publish Banner
                </button>
                <button
                  onClick={async () => { setBannerActive(false); saveBannerToAPI(bannerText, false); }}
                  className="px-5 py-2.5 border-2 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Save but Hide
                </button>
                <span className="text-xs text-gray-400 ml-auto">{bannerText.length}/120</span>
              </div>
            </div>
          )}

          {!bannerEditing && bannerText && (
            <div className="mt-3 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-medium">
              {bannerText}
            </div>
          )}
        </div>

        <button
          onClick={async () => { setIsAdding(true); setAddForm({ ...defaultProduct, id: Date.now() }); }}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-[#5E6B3C] text-white rounded-2xl font-bold hover:brightness-110 transition"
        >
          <Plus size={20} /> Add New Product
        </button>

        {isAdding && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-2 border-[#5E6B3C]">
            <h3 className="font-bold text-lg mb-4 text-[#3F4A26]">New Product</h3>
            <ProductForm
              form={addForm}
              setForm={setAddForm}
              fileRef={addFileRef}
              onImageUpload={e => handleImageUpload(e, 'add')}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={addProduct} className="flex items-center gap-2 px-6 py-2.5 bg-[#5E6B3C] text-white rounded-2xl font-bold hover:brightness-110">
                <Save size={16} /> Save Product
              </button>
              <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 border-2 rounded-2xl font-semibold hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {editingId === product.id ? (
                <div className="p-6">
                  <ProductForm
                    form={editForm}
                    setForm={setEditForm}
                    fileRef={fileInputRef}
                    onImageUpload={e => handleImageUpload(e, 'edit')}
                  />
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveEdit} className="flex items-center gap-2 px-6 py-2.5 bg-[#5E6B3C] text-white rounded-2xl font-bold hover:brightness-110">
                      <Save size={16} /> Save
                    </button>
                    <button onClick={cancelEdit} className="px-6 py-2.5 border-2 rounded-2xl font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category} • K{product.price}</p>
                    <p className="text-xs text-gray-400 truncate">{product.desc}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    <button
                      onClick={async () => {
                        const updated = products.map(p => p.id === product.id ? { ...p, soldOut: !p.soldOut } : p);
                        await persistProducts(updated);
                        window.dispatchEvent(new Event('kopala_products_updated'));
                      }}
                      title={product.soldOut ? 'Mark as In Stock' : 'Mark as Sold Out'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${product.soldOut ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {product.soldOut ? 'SOLD OUT' : 'In Stock'}
                    </button>
                    <button onClick={() => startEdit(product)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {jsonView && (
        <div className="fixed inset-0 z-[500] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Products JSON</h2>
              <button onClick={() => setJsonView(false)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <textarea
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setJsonError(''); }}
                className="w-full h-96 font-mono text-xs border-2 rounded-2xl p-4 focus:outline-none focus:border-[#5E6B3C] resize-none"
                spellCheck={false}
              />
              {jsonError && <p className="text-red-500 text-sm mt-2">{jsonError}</p>}
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={saveJson} className="flex items-center gap-2 px-6 py-3 bg-[#5E6B3C] text-white rounded-2xl font-bold hover:brightness-110">
                <Save size={16} /> Apply Changes
              </button>
              <button onClick={() => setJsonView(false)} className="px-6 py-3 border-2 rounded-2xl font-semibold hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ form, setForm, fileRef, onImageUpload }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name *</label>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Portugal Home Jersey 2026"
          className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5E6B3C]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Price (K) *</label>
        <input
          type="number"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          placeholder="e.g. 650"
          className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5E6B3C]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5E6B3C]"
        >
          {ADMIN_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
        <input
          value={form.desc}
          onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
          placeholder="Short description..."
          className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5E6B3C]"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Image</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <input
              value={form.image && !form.image.startsWith('data:') ? form.image : ''}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="https://... or upload below"
              className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5E6B3C]"
            />
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                <Upload size={14} /> Upload Image
              </button>
              {form.image && <span className="text-xs text-green-600 font-medium">✓ Image set</span>}
            </div>
          </div>
          {form.image && (
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          )}
        </div>
      </div>
      <div className="md:col-span-2 flex items-center gap-6">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setForm(f => ({ ...f, soldOut: !f.soldOut }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.soldOut ? 'bg-red-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.soldOut ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {form.soldOut ? <span className="text-red-600">Marked as Sold Out</span> : 'Mark as Sold Out'}
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setForm(f => ({ ...f, newArrival: !f.newArrival }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.newArrival ? 'bg-amber-400' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.newArrival ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {form.newArrival ? <span className="text-amber-600">New Arrival badge ON</span> : 'New Arrival badge'}
          </span>
        </label>
      </div>
    </div>
  );
}
