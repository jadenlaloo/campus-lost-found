import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'Keys & Wallets',
  'Bags & Backpacks',
  'ID & Cards',
  'Clothing',
  'Other',
];

const LOCATIONS = [
  'Central Library',
  'Student Union / Center',
  'Science & Engineering Hall',
  'Main Cafeteria',
  'Sports Complex / Gymnasium',
  'North Dormitories',
  'South Dormitories',
  'Campus Green / Quad',
  'Other',
];

export default function ReportLostItem() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Electronics',
    description: '',
    dateLostOrFound: new Date().toISOString().split('T')[0],
    campusLocation: 'Central Library',
    specificLocationDetails: '',
    identifyingCharacteristics: '',
    contactInfo: user ? `${user.fullName} (${user.email})` : '',
    imageUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.itemName.trim() || !formData.description.trim() || !formData.campusLocation) {
      setError('Please provide item name, description, and campus location.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await itemService.create({
        ...formData,
        reportType: 'lost',
      });

      if (res.data.success) {
        navigate(`/items/${res.data.item._id}`);
      }
    } catch (err) {
      console.error('Submit lost item error:', err);
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-column p-4">
      <div className="bg-white border border-dark rounded shadow-sm overflow-hidden" style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div className="p-3 border-bottom border-dark" style={{ backgroundColor: 'var(--yellow-accent)' }}>
          <h5 className="fw-bold mb-0 text-dark">Report a Missing Item</h5>
          <span className="small text-dark opacity-75 font-monospace">File a detailed inquiry so campus staff and finders can contact you</span>
        </div>

        <div className="p-4">
          {error && (
            <div className="alert alert-danger py-2 small mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label small fw-bold">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  className="form-control border-dark small"
                  placeholder="e.g. TI-84 Plus Graphing Calculator"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Category *</label>
                <select
                  name="category"
                  className="form-select border-dark small"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control border-dark small"
                  placeholder="Provide details: color, model, stickers, or contents..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Date Lost *</label>
                <input
                  type="date"
                  name="dateLostOrFound"
                  className="form-control border-dark small font-monospace"
                  value={formData.dateLostOrFound}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Campus Zone / Building *</label>
                <select
                  name="campusLocation"
                  className="form-select border-dark small"
                  value={formData.campusLocation}
                  onChange={handleChange}
                  required
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Specific Area / Room</label>
                <input
                  type="text"
                  name="specificLocationDetails"
                  className="form-control border-dark small"
                  placeholder="e.g. 2nd floor library study desk near window"
                  value={formData.specificLocationDetails}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Identifying Characteristics (Marks, Stickers, Initials)</label>
                <input
                  type="text"
                  name="identifyingCharacteristics"
                  className="form-control border-dark small"
                  placeholder="e.g. Yellow sticker on back, faint scratch on corner"
                  value={formData.identifyingCharacteristics}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Photograph (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control border-dark small"
                  onChange={handleImageUpload}
                />
                {formData.imageUrl && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <img src={formData.imageUrl} alt="" className="rounded border border-dark" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                    <span className="small text-success fw-bold">Photo attached</span>
                    <button type="button" className="btn btn-sm btn-link text-danger p-0 ms-auto" onClick={() => setFormData({ ...formData, imageUrl: '' })}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Contact Info</label>
                <input
                  type="text"
                  name="contactInfo"
                  className="form-control border-dark small"
                  value={formData.contactInfo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top border-dark d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-sm btn-outline-dark"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-editorial-orange px-4 py-2 w-auto mb-0"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Lost Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
