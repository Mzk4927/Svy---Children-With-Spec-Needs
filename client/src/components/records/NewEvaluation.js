import React, { useEffect, useState } from 'react';
import { PlusCircle, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { KPK_DISTRICTS } from '../../utils/constants';

export default function NewEvaluation({ onSubmit, onCancel, user }) {
  const [formData, setFormData] = useState({
    name: '', fatherName: '', district: '', address: '', contact: '', age: '', disability: '', advice: '', remarks: '', image: null, imageUrl: null, imagePublicId: null
  });
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setCategoryError(error.message || 'Unable to load categories');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleCategory = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((item) => item !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError('Please enter a category name');
      return;
    }

    try {
      setCategoryError('');
      const created = await api.createCategory({ name });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCategories((prev) => (prev.includes(created.name) ? prev : [...prev, created.name]));
      setNewCategoryName('');
    } catch (error) {
      setCategoryError(error.message || 'Failed to create category');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.');
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: previewUrl,
        imageUrl: result.imageUrl,
        imagePublicId: result.imagePublicId || null
      });
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.district) return;
    onSubmit({
      name: formData.name, fatherName: formData.fatherName, district: formData.district, address: formData.address,
      contact: formData.contact, age: parseInt(formData.age), disability: formData.disability,
      advice: formData.advice, remarks: formData.remarks, imageUrl: formData.imageUrl,
      imagePublicId: formData.imagePublicId,
      tags: selectedCategories
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><PlusCircle className="text-blue-600" /> New Child Evaluation</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputGroup label="Child Name" name="name" value={formData.name} onChange={handleChange} required />
          <InputGroup label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">District <span className="text-red-500">*</span></label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select district</option>
              {KPK_DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <InputGroup label="Age (Years)" name="age" type="number" value={formData.age} onChange={handleChange} required />
          <InputGroup label="Contact No" name="contact" value={formData.contact} onChange={handleChange} />
          <div className="md:col-span-2"><InputGroup label="Address" name="address" value={formData.address} onChange={handleChange} /></div>
        </div>

        <div className="border-t pt-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <InputGroup label="Disability / Diagnosis" name="disability" value={formData.disability} onChange={handleChange} />
              <InputGroup label="Doctor Advice / Prescription" name="advice" value={formData.advice} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assistive Categories</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map((category) => (
                    <button
                      key={category.id || category.name}
                      type="button"
                      onClick={() => toggleCategory(category.name)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        selectedCategories.includes(category.name)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Add new category"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Add
                    </button>
                  </div>
                )}

                {categoryError && <p className="text-sm text-red-600 mt-2">{categoryError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks / Symptoms</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50">
              {uploading ? (
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-slate-600">Uploading...</p>
                </div>
              ) : formData.image ? (
                <div className="relative w-full h-48 mb-4">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: null, imageUrl: null, imagePublicId: null })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <ImageIcon size={48} className="mx-auto mb-2" />
                  <p className="text-sm">No photo selected</p>
                </div>
              )}

              <label className="cursor-pointer w-full">
                <span className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium">
                  <Upload size={18} /> {formData.image ? 'Change Photo' : 'Upload Photo'}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <p className="text-xs text-slate-400 mt-2 text-center">Max size: 5MB</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">Cancel</button>
          <button type="submit" disabled={uploading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"><Save size={18} /> Save Record</button>
        </div>
      </form>
    </div>
  );
}

function InputGroup({ label, name, type = "text", value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} name={name} value={value} onChange={onChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder={placeholder} required={required} />
    </div>
  );
}