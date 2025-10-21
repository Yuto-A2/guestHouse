// src/pages/AdminPage.tsx
import SectionTitle from "../layouts/title/SectionTitle";
import { useEffect, useMemo, useState, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import "./adminPage.css";

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
    // Authentication
    const [me, setMe] = useState<User | null>(null);
    const [loadingMe, setLoadingMe] = useState(true);
    const [errorMe, setErrorMe] = useState<string>("");

    // Property
    const [list, setList] = useState<Property[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listErr, setListErr] = useState("");

    // Create 
    const [form, setForm] = useState<PropertyPayload>({ address: "", property_type: "" });
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState("");
    const [submitOk, setSubmitOk] = useState("");

    // Edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const editingItem = useMemo(() => list.find((p) => p._id === editingId) || null, [editingId, list]);
    const [editForm, setEditForm] = useState<PropertyPayload>({ address: "", property_type: "" });
    const [updating, setUpdating] = useState(false);
    const [updateErr, setUpdateErr] = useState("");

    // Delete
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteErr, setDeleteErr] = useState("");

    // Get My Information
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("https://guest-house-ecru.vercel.app/admin", { 
                // const res = await fetch("http://localhost:5000/admin", {
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

    // Can't login no admin users
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
            const res = await fetch("https://guest-house-ecru.vercel.app/admin/properties", { 
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
        <div>
            <SectionTitle sectionTitle="Admin Page" />

            {loadingMe ? (
                <p>Loading...</p>
            ) : errorMe ? (
                <p>{errorMe}</p>
            ) : (
                <div className="PropertyContainer">

                    <section className="prop-section">
                        <h3 className="prop-section__title">Add a Property</h3>
                        <form onSubmit={onSubmit} className="prop-form">
                            <div className="form-group form-group--wide">
                                <label className="label" htmlFor="address">Address</label>
                                <input
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={onChange}
                                    className="input"
                                    placeholder="e.g. Tokyo Shibuya 1-2-3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label" htmlFor="property_type">Property Type</label>
                                <select
                                    id="property_type"
                                    name="property_type"
                                    value={form.property_type}
                                    onChange={onChange}
                                    className="select"
                                    required
                                >
                                    <option value="">Please select</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="condo">Condominium</option>
                                    <option value="guesthouse">Guesthouse</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={submitting} className="btn btn--primary">
                                    {submitting ? "Submitting..." : "Add Property"}
                                </button>
                                {submitErr && <span className="status status--error">{submitErr}</span>}
                                {submitOk && <span className="status status--ok">{submitOk}</span>}
                            </div>
                        </form>
                    </section>

                    <section className="prop-section">
                        <div className="list-header">
                            <h2 className="list-title">Properties</h2>
                            {listLoading && <span className="list-loading">Loading...</span>}
                        </div>

                        {listErr && <p className="status status--error">{listErr}</p>}
                        {deleteErr && <p className="status status--error">{deleteErr}</p>}

                        {list.length === 0 ? (
                            <p className="muted">No properties yet.</p>
                        ) : (
                            <ul className="prop-list">
                                {list.map((p) => (
                                    <li key={p._id} className="prop-item">
                                        <div className="prop-item__main">
                                            <p className="prop-item__address">{p.address}</p>
                                            <p className="prop-item__type">{p.property_type}</p>
                                        </div>
                                        <div className="prop-item__actions">
                                            <button onClick={() => openEdit(p)} className="btn btn--outline">Edit</button>
                                            <button
                                                onClick={() => confirmDelete(p._id)}
                                                disabled={deletingId === p._id}
                                                className="btn btn--danger"
                                            >
                                                {deletingId === p._id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {editingItem && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <div className="modal__head">
                                    <h3 className="modal__title">Edit Property</h3>
                                    <button onClick={() => setEditingId(null)} className="btn btn--ghost">
                                        Close
                                    </button>
                                </div>

                                <form onSubmit={submitUpdate} className="prop-form prop-form--stack">
                                    <div className="form-group">
                                        <label className="label" htmlFor="edit_address">Address</label>
                                        <input
                                            id="edit_address"
                                            name="address"
                                            value={editForm.address}
                                            onChange={onEditChange}
                                            className="input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label" htmlFor="edit_property_type">Property Type</label>
                                        <select
                                            id="edit_property_type"
                                            name="property_type"
                                            value={editForm.property_type}
                                            onChange={onEditChange}
                                            className="select"
                                            required
                                        >
                                            <option value="">Please select</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="house">House</option>
                                            <option value="condo">Condominium</option>
                                            <option value="guesthouse">Guesthouse</option>
                                        </select>
                                    </div>

                                    {updateErr && <p className="status status--error">{updateErr}</p>}

                                    <div className="form-actions">
                                        <button type="submit" disabled={updating} className="btn btn--primary">
                                            {updating ? "Saving..." : "Save changes"}
                                        </button>
                                        <button type="button" onClick={() => setEditingId(null)} className="btn btn--outline">
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