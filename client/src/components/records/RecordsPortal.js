import React, { useState, useMemo } from 'react';
import { FileText, Search, Printer, Edit, Trash2, FileBadge, MessageSquare } from 'lucide-react';
import FilterButton from './filterbutton';
import SingleReportView from './SingleReportView';
import api from '../../services/api';

export default function RecordsPortal({ records, user, onUpdate, onDelete, onRefresh }) {
  const [ageFilter, setAgeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [singleReport, setSingleReport] = useState(null);
  const [reviewModalRecord, setReviewModalRecord] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const searchMatch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.fatherName?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!searchMatch) return false;
      if (ageFilter === 'all') return true;
      if (ageFilter === '0-5') return r.age >= 0 && r.age <= 5;
      if (ageFilter === '6-10') return r.age > 5 && r.age <= 10;
      if (ageFilter === '11-15') return r.age > 10 && r.age <= 15;
      if (ageFilter === '15+') return r.age > 15;
      return true;
    });
  }, [records, ageFilter, searchTerm]);

  const categoryMap = useMemo(() => {
    const map = {};

    categories.forEach((category) => {
      map[category.name] = [];
    });

    records.forEach((record) => {
      (record.tags || []).forEach((tag) => {
        if (!map[tag]) map[tag] = [];
        map[tag].push(record.name);
      });
    });

    return map;
  }, [categories, records]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCategoryError(err.message || 'Failed to load categories');
    }
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError('Please enter category name');
      return;
    }

    try {
      setCategoryError('');
      const created = await api.createCategory({ name });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
    } catch (err) {
      setCategoryError(err.message || 'Failed to create category');
    }
  };

  const saveEdit = async (e, id) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      name: formData.get('name'),
      fatherName: formData.get('fatherName'),
      age: parseInt(formData.get('age')),
      contact: formData.get('contact'),
      disability: formData.get('disability'),
      advice: formData.get('advice'),
      address: formData.get('address'),
      remarks: formData.get('remarks'),
    };
    await onUpdate(id, updated);
    setEditingId(null);
  };

  const handleFullListPrint = () => {
    setSingleReport(null);
    setTimeout(() => window.print(), 100);
  };

  const openReviewsModal = async (record) => {
    setReviewModalRecord(record);
    setReviewComment('');
    setReviewRating('');
    setReviewError('');
    setReviewLoading(true);
    try {
      const data = await api.getRecordReviews(record.id);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviewError(err.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReviewsModal = () => {
    setReviewModalRecord(null);
    setReviews([]);
    setReviewError('');
    setReviewComment('');
    setReviewRating('');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalRecord) return;

    const comment = reviewComment.trim();
    if (!comment) {
      setReviewError('Please enter your comment or feedback.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const created = await api.addRecordReview(reviewModalRecord.id, {
        comment,
        rating: reviewRating ? Number(reviewRating) : null
      });
      setReviews([created, ...reviews]);
      setReviewComment('');
      setReviewRating('');
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (singleReport) {
    return <SingleReportView record={singleReport} onClose={() => setSingleReport(null)} />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-600" />
          Patient Records ({filteredRecords.length})
        </h2>
        <div className="flex gap-3">
          <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
          <button onClick={handleFullListPrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
            <Printer size={18} />
            <span>Full List PDF</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-64" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <FilterButton label="All Ages" active={ageFilter === 'all'} onClick={() => setAgeFilter('all')} />
        <FilterButton label="0-5 Years" active={ageFilter === '0-5'} onClick={() => setAgeFilter('0-5')} />
        <FilterButton label="6-10 Years" active={ageFilter === '6-10'} onClick={() => setAgeFilter('6-10')} />
        <FilterButton label="11-15 Years" active={ageFilter === '11-15'} onClick={() => setAgeFilter('11-15')} />
        <FilterButton label="15+ Years" active={ageFilter === '15+'} onClick={() => setAgeFilter('15+')} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Child Details</th>
                  <th className="px-6 py-4 font-semibold">Contact & Address</th>
                  <th className="px-6 py-4 font-semibold">Diagnosis</th>
                  <th className="px-6 py-4 font-semibold">Advice</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(record => (
                  <tr key={record._id || record.id} className="hover:bg-slate-50 transition">
                    {editingId === (record._id || record.id) ? (
                      <td colSpan={5} className="p-4 bg-blue-50">
                        <form onSubmit={(e) => saveEdit(e, record._id || record.id)} className="grid grid-cols-2 gap-4">
                          <input name="name" defaultValue={record.name} className="p-2 border rounded" required />
                          <input name="fatherName" defaultValue={record.fatherName} className="p-2 border rounded" />
                          <input name="age" type="number" defaultValue={record.age} className="p-2 border rounded" />
                          <input name="contact" defaultValue={record.contact} className="p-2 border rounded" />
                          <input name="address" defaultValue={record.address} className="p-2 border rounded" />
                          <input name="disability" defaultValue={record.disability} className="p-2 border rounded" />
                          <input name="advice" defaultValue={record.advice} className="p-2 border rounded" />
                          <input name="remarks" defaultValue={record.remarks} className="p-2 border rounded" />
                          <div className="col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 bg-white border rounded">Cancel</button>
                            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-slate-800">{record.name}</div>
                            <div className="text-sm text-slate-500">S/O {record.fatherName}</div>
                            <div className="text-xs font-semibold bg-blue-100 text-blue-700 inline-block px-2 py-0.5 rounded mt-1">{record.age} Years</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-slate-700 font-medium">{record.contact}</div>
                          <div className="text-slate-500 truncate max-w-[150px]">{record.address}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700 block max-w-[200px]">{record.disability}</span>
                          {record.remarks && <span className="text-xs text-slate-400 italic mt-1 block max-w-[200px]">{record.remarks}</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px]">{record.advice}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setSingleReport(record)} className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition" title="View Report"><FileBadge size={18} /></button>
                            <button onClick={() => openReviewsModal(record)} className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-full transition" title="Comment / Review"><MessageSquare size={18} /></button>
                            {user?.role === 'admin' && (
                              <>
                                <button onClick={() => setEditingId(record._id || record.id)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-100 rounded-full transition" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => onDelete(record._id || record.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition" title="Delete"><Trash2 size={18} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-800">Category Wise Children</h3>
          {user?.role === 'admin' && (
            <div className="flex gap-2 w-full md:w-auto">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Create new category"
                className="px-3 py-2 border border-slate-300 rounded-lg w-full md:w-64"
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
        </div>

        {categoryError && <div className="text-sm text-red-600 mb-3">{categoryError}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.keys(categoryMap).length === 0 ? (
            <p className="text-sm text-slate-500">No categories available.</p>
          ) : (
            Object.entries(categoryMap).map(([categoryName, childNames]) => (
              <div key={categoryName} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <h4 className="font-semibold text-slate-800">{categoryName}</h4>
                {childNames.length === 0 ? (
                  <p className="text-sm text-slate-500 mt-2">No child assigned yet.</p>
                ) : (
                  <ul className="mt-2 text-sm text-slate-700 space-y-1">
                    {childNames.map((childName, idx) => (
                      <li key={`${categoryName}-${idx}`}>- {childName}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {reviewModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Comments & Reviews: {reviewModalRecord.name}</h3>
              <button onClick={closeReviewsModal} className="text-slate-500 hover:text-slate-800">Close</button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={submitReview} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Your Feedback</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Write your comment about this child report..."
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Rating (optional)</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">No rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>

                {reviewError && (
                  <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2">{reviewError}</div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Reviews</h4>

                {reviewLoading ? (
                  <p className="text-sm text-slate-500">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No reviews yet. Be the first to comment.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{review.user?.name || 'Anonymous user'}</span>
                          <span>{new Date(review.createdAt).toLocaleString()}</span>
                        </div>
                        {review.rating ? (
                          <div className="text-amber-600 text-sm mt-1">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        ) : null}
                        <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}