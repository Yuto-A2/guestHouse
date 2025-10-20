// src/pages/AdminPage.tsx
import SectionTitle from "../layouts/title/SectionTitle";
import { useEffect, useMemo, useState, FormEvent } from "react";
import { Navigate } from "react-router-dom";

type Role = "admin" | "user";

type User = {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  phone_num?: string;
  role: Role;
};

type Property = {
  _id: string;
  address: string;
  property_type: string;
  createdAt?: string;
  updatedAt?: string;
};

type PropertyPayload = {
  address: string;
  property_type: string;
};

export default function AdminPage() {
  // 認証
  const [me, setMe] = useState<User | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [errorMe, setErrorMe] = useState<string>("");

  // 物件一覧
  const [list, setList] = useState<Property[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listErr, setListErr] = useState("");

  // 作成フォーム
  const [form, setForm] = useState<PropertyPayload>({ address: "", property_type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [submitOk, setSubmitOk] = useState("");

  // 編集
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingItem = useMemo(() => list.find((p) => p._id === editingId) || null, [editingId, list]);
  const [editForm, setEditForm] = useState<PropertyPayload>({ address: "", property_type: "" });
  const [updating, setUpdating] = useState(false);
  const [updateErr, setUpdateErr] = useState("");

  // 削除
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErr, setDeleteErr] = useState("");

  // 自分情報取得
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/admin", { 
          method: "GET",
          credentials: "include",
        });
        const user = await res.json();
        if (!res.ok) throw new Error(user?.error || user?.message || `HTTP ${res.status}`);
        setMe(user);
        setErrorMe("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setErrorMe(msg);
        setMe(null);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  
  useEffect(() => {
    if (!me || me.role !== "admin") return;
    (async () => {
      try {
        setListLoading(true);
        const res = await fetch("https://guest-house-ecru.vercel.app/admin/properties", { 
          method: "GET",
          credentials: "include",
        });
        const items = await res.json();
        if (!res.ok) throw new Error(items?.error || items?.message || `HTTP ${res.status}`);
        setList(items);
        setListErr("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load properties";
        setListErr(msg);
      } finally {
        setListLoading(false);
      }
    })();
  }, [me]);

  // 非adminを弾く
  if (!loadingMe && (!me || me.role !== "admin")) {
    return <Navigate to="/login" replace />;
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitErr("");
    setSubmitOk("");

    if (!form.address.trim() || !form.property_type.trim()) {
      setSubmitErr("Address and property type are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("https://guest-house-ecru.vercel.app/admin/properties", { // ← フルURL直書き
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created?.error || created?.message || `HTTP ${res.status}`);
      setList((prev) => [created, ...prev]);
      setSubmitOk("Property has been added successfully.");
      setForm({ address: "", property_type: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create property.";
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 編集開始
  const openEdit = (p: Property) => {
    setEditingId(p._id);
    setEditForm({ address: p.address, property_type: p.property_type });
    setUpdateErr("");
  };

  const onEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setUpdateErr("");

    if (!editForm.address.trim() || !editForm.property_type.trim()) {
      setUpdateErr("Address and property type are required.");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`https://guest-house-ecru.vercel.app/admin/properties/${editingId}`, { // ← フルURL直書き
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.error || updated?.message || `HTTP ${res.status}`);
      setList((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setEditingId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update property.";
      setUpdateErr(msg);
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteErr("");
    try {
      const res = await fetch(`https://guest-house-ecru.vercel.app/admin/properties/${id}`, { // ← フルURL直書き
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
      setList((prev) => prev.filter((p) => p._id !== id));
      setDeletingId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete property.";
      setDeleteErr(msg);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <SectionTitle sectionTitle="Admin Page" />

      {loadingMe ? (
        <p>Loading...</p>
      ) : errorMe ? (
        <p className="text-red-600">{errorMe}</p>
      ) : (
        <div className="mt-6 space-y-10">
          {/* 作成フォーム */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Add a Property</h2>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="address">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="w-full border rounded p-2"
                  placeholder="e.g. Tokyo Shibuya 1-2-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="property_type">
                  Property Type
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={form.property_type}
                  onChange={onChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Please select</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condominium</option>
                  <option value="guesthouse">Guesthouse</option>
                </select>
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Add Property"}
                </button>
                {submitErr && <span className="text-red-600">{submitErr}</span>}
                {submitOk && <span className="text-green-700">{submitOk}</span>}
              </div>
            </form>
          </section>

          {/* 一覧 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Properties</h2>
              {listLoading && <span className="text-sm opacity-70">Loading...</span>}
            </div>
            {listErr && <p className="text-red-600 mb-2">{listErr}</p>}
            {deleteErr && <p className="text-red-600 mb-2">{deleteErr}</p>}

            {list.length === 0 ? (
              <p className="opacity-70">No properties yet.</p>
            ) : (
              <ul className="divide-y border rounded">
                {list.map((p) => (
                  <li
                    key={p._id}
                    className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium">{p.address}</p>
                      <p className="text-sm opacity-80">{p.property_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded border">
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(p._id)}
                        disabled={deletingId === p._id}
                        className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50"
                      >
                        {deletingId === p._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 編集モーダル */}
          {editingItem && (
            <div className="fixed inset-0 bg-black/40 flex items-end md:items-center md:justify-center z-50">
              <div className="bg-white w-full md:max-w-xl p-6 rounded-t-2xl md:rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Property</h3>
                  <button onClick={() => setEditingId(null)} className="text-sm opacity-70 hover:opacity-100">
                    Close
                  </button>
                </div>
                <form onSubmit={submitUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="edit_address">
                      Address
                    </label>
                    <input
                      id="edit_address"
                      name="address"
                      value={editForm.address}
                      onChange={onEditChange}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="edit_property_type">
                      Property Type
                    </label>
                    <select
                      id="edit_property_type"
                      name="property_type"
                      value={editForm.property_type}
                      onChange={onEditChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Please select</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condominium</option>
                      <option value="guesthouse">Guesthouse</option>
                    </select>
                  </div>

                  {updateErr && <p className="text-red-600">{updateErr}</p>}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded border"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
