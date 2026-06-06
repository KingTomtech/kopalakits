import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Trash2, Save, Upload, LogOut, Edit2, Download, RefreshCw } from 'lucide-react';
import FanZoneAdmin from './admin/FanZoneAdmin.jsx';
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
      URL.revokeObjectURL(img.src);
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
      const data = await res.json().catch(() => ({}));
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
      const data = await res.json().catch(() => []);
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
      const data = await res.json().catch(() => ({}));
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
      const data = await res.json().catch(() => ({}));
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
    const price = Number(editForm.price);
    if (!Number.isFinite(price) || price <= 0) {
      showToast('Price must be a positive number');
      return;
    }
    const updated = products.map(p => p.id === editingId ? { ...editForm, price } : p);
    await persistProducts(updated);
    setEditingId(null);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await persistProducts(products.filter(p => p.id !== id));
  };

  const addProduct = async () => {
    if (!addForm.name || !addForm.price) return showToast('Name and price required');
    const price = Number(addForm.price);
    if (!Number.isFinite(price) || price <= 0) {
      return showToast('Price must be a positive number');
    }
    const newProduct = { ...addForm, id: Date.now(), price };
    await persistProducts([...products, newProduct]);
    setIsAdding(false);
    setAddForm({ ...defaultProduct, id: Date.now() });
  };

  const handleImageUpload = async (e, target) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image too large — max 5 MB');
      return;
    }
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
    URL.revokeObjectURL(url);
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
    const data = await res.json().catch(() => []);
    await persistProducts(data);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="bg-[var(--surface)] rounded-3xl shadow-2xl p-10 w-full max-w-sm">
          <h1 className="text-3xl font-black text-[var(--brand-deep)] mb-2 text-center">Admin Panel</h1>
          <p className="text-center text-[var(--text-faint)] mb-8 text-sm">Kopala Kits</p>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(''); }}
              className="w-full border-2 border-[var(--border)] rounded-2xl px-4 py-3 text-lg focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] text-[var(--text)]"
            />
            {pwError && <p className="text-[var(--danger)] text-sm">{pwError}</p>}
            <button type="submit" className="w-full py-3 bg-[var(--brand)] text-[var(--surface)] font-bold rounded-2xl text-lg hover:brightness-110 transition">
              Login
            </button>
          </form>
          <button onClick={onExit} className="mt-6 w-full text-center text-[var(--text-faint)] hover:text-[var(--text)] text-sm">
            ← Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {toast && (
        <div className="fixed top-6 right-6 z-[999] bg-[var(--brand)] text-[var(--surface)] px-6 py-3 rounded-2xl shadow-xl font-semibold text-sm animate-pulse">
          {toast}
        </div>
      )}
      {error && (
        <div className="fixed top-6 right-6 z-[998] bg-[var(--danger)]/15 border-2 border-[var(--danger)]/30 text-[var(--danger)] px-6 py-3 rounded-2xl shadow-xl text-sm font-semibold mt-14">
          {error}
          <button onClick={() => setError('')} className="ml-3 text-[var(--danger)] hover:opacity-80 font-bold">✕</button>
        </div>
      )}

      <nav className="bg-[var(--bg-elevated)] shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black text-[var(--brand-deep)]">KOPALA KITS — Admin</h1>
          <p className="text-xs text-[var(--text-faint)]">
            {products.length} products
            {loading && <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--warning)]/15 text-[var(--warning)] font-semibold">Loading…</span>}
            {saving && <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--brand)]/15 text-[var(--brand)] font-semibold">Saving…</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetToDefault} title="Reset to default" className="p-2.5 rounded-xl hover:bg-[var(--border)]/20 text-[var(--text-muted)]" >
            <RefreshCw size={18} />
          </button>
          <button onClick={openJsonEditor} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border)]/40 text-sm font-semibold">
            Edit JSON
          </button>
          <button onClick={exportJson} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border)]/40 text-sm font-semibold">
            <Download size={16} /> Export
          </button>
          <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border)]/40 text-sm font-semibold">
            ← Shop
          </button>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--danger)]/15 hover:bg-[var(--danger)]/25 text-[var(--danger)] text-sm font-semibold">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="bg-[var(--bg-elevated)] border-b border-[var(--border)] px-6">
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
                borderBottomColor: adminTab === tab.id ? 'var(--brand-deep)' : 'transparent',
                color: adminTab === tab.id ? 'var(--brand-deep)' : 'var(--text-faint)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">

        {adminTab === 'fan' && (
          <FanZoneAdmin />
        )}

        {(adminTab === 'products' || adminTab === 'banner') && (
          <>
            {/* ANNOUNCEMENT BANNER EDITOR */}
            <div className="bg-[var(--surface)] rounded-3xl shadow-sm border-2 border-dashed border-[var(--warning)]/30 p-5 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📢</span>
                  <div>
                    <p className="font-bold text-sm text-[var(--text)]">Announcement Banner</p>
                    <p className="text-xs text-[var(--text-faint)]">{bannerActive ? <span className="text-[var(--success)] font-semibold">● Live on shop</span> : <span className="text-[var(--text-disabled)]">Hidden</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bannerActive && !bannerEditing && (
                    <button
                      onClick={async () => { setBannerActive(false); saveBannerToAPI(bannerText, false); }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25 transition"
                    >
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => setBannerEditing(e => !e)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--warning)]/15 text-[var(--warning)] hover:bg-[var(--warning)]/25 transition"
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
                    className="w-full border-2 border-[var(--border)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] text-[var(--text)]"
                    maxLength={120}
                  />
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={async () => { setBannerActive(true); saveBannerToAPI(bannerText, true); }}
                      disabled={!bannerText.trim()}
                      className="px-5 py-2.5 bg-[var(--brand)] text-[var(--surface)] rounded-2xl text-sm font-bold hover:brightness-110 disabled:opacity-40 transition"
                    >
                      Publish Banner
                    </button>
                    <button
                      onClick={async () => { setBannerActive(false); saveBannerToAPI(bannerText, false); }}
                      className="px-5 py-2.5 border-2 border-[var(--border)] rounded-2xl text-sm font-semibold hover:bg-[var(--bg-elevated)] transition text-[var(--text)]"
                    >
                      Save but Hide
                    </button>
                    <span className="text-xs text-[var(--text-faint)] ml-auto">{bannerText.length}/120</span>
                  </div>
                </div>
              )}

              {!bannerEditing && bannerText && (
                <div className="mt-3 px-4 py-2.5 rounded-2xl bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-sm text-[var(--warning)] font-medium">
                  {bannerText}
                </div>
              )}
            </div>

            {adminTab === 'products' && (
              <>
                <button
                  onClick={async () => { setIsAdding(true); setAddForm({ ...defaultProduct, id: Date.now() }); }}
                  className="mb-6 flex items-center gap-2 px-6 py-3 bg-[var(--brand)] text-[var(--surface)] rounded-2xl font-bold hover:brightness-110 transition"
                >
                  <Plus size={20} /> Add New Product
                </button>

                {isAdding && (
                  <div className="bg-[var(--surface)] rounded-3xl shadow-xl p-6 mb-6 border-2 border-[var(--brand)]">
                    <h3 className="font-bold text-lg mb-4 text-[var(--brand-deep)]">New Product</h3>
                    <ProductForm
                      form={addForm}
                      setForm={setAddForm}
                      fileRef={addFileRef}
                      onImageUpload={e => handleImageUpload(e, 'add')}
                    />
                    <div className="flex gap-3 mt-4">
                      <button onClick={addProduct} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand)] text-[var(--surface)] rounded-2xl font-bold hover:brightness-110">
                        <Save size={16} /> Save Product
                      </button>
                      <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 border-2 border-[var(--border)] rounded-2xl font-semibold hover:bg-[var(--bg-elevated)] text-[var(--text)]">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="bg-[var(--surface)] rounded-2xl shadow-sm overflow-hidden">
                      {editingId === product.id ? (
                        <div className="p-6">
                          <ProductForm
                            form={editForm}
                            setForm={setEditForm}
                            fileRef={fileInputRef}
                            onImageUpload={e => handleImageUpload(e, 'edit')}
                          />
                          <div className="flex gap-3 mt-4">
                            <button onClick={saveEdit} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand)] text-[var(--surface)] rounded-2xl font-bold hover:brightness-110">
                              <Save size={16} /> Save
                            </button>
                            <button onClick={cancelEdit} className="px-6 py-2.5 border-2 border-[var(--border)] rounded-2xl font-semibold hover:bg-[var(--bg-elevated)] text-[var(--text)]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--bg-elevated)] flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate text-[var(--text)]">{product.name}</p>
                            <p className="text-xs text-[var(--text-faint)]">{product.category} • K{product.price}</p>
                            <p className="text-xs text-[var(--text-disabled)] truncate">{product.desc}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 items-center">
                            <button
                              onClick={async () => {
                                const updated = products.map(p => p.id === product.id ? { ...p, soldOut: !p.soldOut } : p);
                                await persistProducts(updated);
                                window.dispatchEvent(new Event('kopala_products_updated'));
                              }}
                              title={product.soldOut ? 'Mark as In Stock' : 'Mark as Sold Out'}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${product.soldOut ? 'bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25' : 'bg-[var(--bg-elevated)] text-[var(--text-faint)] hover:bg-[var(--border)]/40'}`}
                            >
                              {product.soldOut ? 'SOLD OUT' : 'In Stock'}
                            </button>
                            <button onClick={() => startEdit(product)} className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border)]/40 text-[var(--text-muted)]">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-xl bg-[var(--danger)]/15 hover:bg-[var(--danger)]/25 text-[var(--danger)]">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {jsonView && (
        <div className="fixed inset-0 z-[500] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--text)]">Edit Products JSON</h2>
              <button onClick={() => setJsonView(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <textarea
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setJsonError(''); }}
                className="w-full h-96 font-mono text-xs border-2 border-[var(--border)] rounded-2xl p-4 focus:outline-none focus:border-[var(--brand)] resize-none bg-[var(--bg)] text-[var(--text)]"
                spellCheck={false}
              />
              {jsonError && <p className="text-[var(--danger)] text-sm mt-2">{jsonError}</p>}
            </div>
            <div className="p-6 border-t border-[var(--border)] flex gap-3">
              <button onClick={saveJson} className="flex items-center gap-2 px-6 py-3 bg-[var(--brand)] text-[var(--surface)] rounded-2xl font-bold hover:brightness-110">
                <Save size={16} /> Apply Changes
              </button>
              <button onClick={() => setJsonView(false)} className="px-6 py-3 border-2 border-[var(--border)] rounded-2xl font-semibold hover:bg-[var(--bg-elevated)] text-[var(--text)]">
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
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Product Name *</label>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Portugal Home Jersey 2026"
          className="w-full border-2 border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] text-[var(--text)]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Price (K) *</label>
        <input
          type="number"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          placeholder="e.g. 650"
          className="w-full border-2 border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] text-[var(--text)]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Category</label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border-2 border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] text-[var(--text)]"
        >
          {ADMIN_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Description</label>
        <input
          value={form.desc}
          onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
          placeholder="Short description..."
          className="w-full border-2 border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] text-[var(--text)]"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Image</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <input
              value={form.image && !form.image.startsWith('data:') ? form.image : ''}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="https://... or upload below"
              className="w-full border-2 border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] text-[var(--text)]"
            />
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-[var(--border)] rounded-xl text-sm font-semibold hover:bg-[var(--bg-elevated)] text-[var(--text)]"
              >
                <Upload size={14} /> Upload Image
              </button>
              {form.image && <span className="text-xs text-[var(--success)] font-medium">✓ Image set</span>}
            </div>
          </div>
          {form.image && (
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-elevated)] flex-shrink-0">
              <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          )}
        </div>
      </div>
      <div className="md:col-span-2 flex items-center gap-6">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setForm(f => ({ ...f, soldOut: !f.soldOut }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.soldOut ? 'bg-[var(--danger)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-[var(--surface)] rounded-full shadow transition-transform ${form.soldOut ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-[var(--text-muted)]">
            {form.soldOut ? <span className="text-[var(--danger)]">Marked as Sold Out</span> : 'Mark as Sold Out'}
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setForm(f => ({ ...f, newArrival: !f.newArrival }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.newArrival ? 'bg-[var(--warning)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-[var(--surface)] rounded-full shadow transition-transform ${form.newArrival ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-[var(--text-muted)]">
            {form.newArrival ? <span className="text-[var(--warning)]">New Arrival badge ON</span> : 'New Arrival badge'}
          </span>
        </label>
      </div>
    </div>
  );
}
