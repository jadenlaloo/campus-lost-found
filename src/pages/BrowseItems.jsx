import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemService } from '../services/api';
import ItemCard from '../components/ItemCard';
import { useInspector } from '../context/InspectorContext';

const CATEGORIES = [
  'Everything',
  'Electronics',
  'Books & Stationery',
  'Keys & Wallets',
  'Bags & Backpacks',
  'ID & Cards',
  'Clothing',
  'Other',
];

const LOCATIONS = [
  'All Locations',
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

export default function BrowseItems() {
  const [searchParams] = useSearchParams();
  const { searchQuery, setSelectedItem } = useInspector();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'Everything');
  const [reportType, setReportType] = useState(searchParams.get('reportType') || 'All');
  const [location, setLocation] = useState('All Locations');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = { limit: 24 };

        if (activeCategory !== 'Everything') params.category = activeCategory;
        if (reportType !== 'All') params.reportType = reportType;
        if (location !== 'All Locations') params.campusLocation = location;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await itemService.getAll(params);
        if (res.data.success) {
          setItems(res.data.items || []);
          setTotal(res.data.total || 0);
          if (res.data.items?.length > 0) {
            setSelectedItem((prev) => prev || res.data.items[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeCategory, reportType, location, searchQuery, searchParams]);

  return (
    <div className="main-column">
      {/* Category Pills */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
            Categories
          </h6>
          <span className="small text-muted font-monospace">{total} items found</span>
        </div>

        <div className="category-pills-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`btn-tag-editorial ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-filters row: Type & Location */}
      <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom">
        <div className="btn-group btn-group-sm">
          <button
            className={`btn btn-sm ${reportType === 'All' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setReportType('All')}
          >
            All Reports
          </button>
          <button
            className={`btn btn-sm ${reportType === 'lost' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setReportType('lost')}
          >
            Lost Only
          </button>
          <button
            className={`btn btn-sm ${reportType === 'found' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setReportType('found')}
          >
            Found Only
          </button>
        </div>

        <select
          className="form-select form-select-sm border-dark w-auto"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-4 bg-white border border-dark rounded text-center text-muted small">
          No records match your search criteria.
        </div>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
          {items.map((item) => (
            <div key={item._id} className="col">
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
