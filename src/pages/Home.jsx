import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export default function Home() {
  const { setSelectedItem } = useInspector();

  const [activeCategory, setActiveCategory] = useState('Everything');
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeItems = async () => {
      setLoading(true);
      try {
        const catParam = activeCategory === 'Everything' ? {} : { category: activeCategory };

        const [foundRes, lostRes] = await Promise.all([
          itemService.getAll({ ...catParam, reportType: 'found', limit: 5, sort: '-createdAt' }),
          itemService.getAll({ ...catParam, reportType: 'lost', limit: 5, sort: '-createdAt' }),
        ]);

        if (foundRes.data.success) {
          setFoundItems(foundRes.data.items || []);
          // Default select the first item if none is set
          if (foundRes.data.items?.length > 0) {
            setSelectedItem((prev) => prev || foundRes.data.items[0]);
          }
        }

        if (lostRes.data.success) {
          setLostItems(lostRes.data.items || []);
        }
      } catch (err) {
        console.error('Failed to load home items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeItems();
  }, [activeCategory]);

  return (
    <div className="main-column">
      {/* 1. Categories Tag Bar */}
      <div className="mb-4">
        <h6 className="fw-bold mb-2 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
          Categories
        </h6>
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
          <div className="small text-muted mt-2">Loading campus items...</div>
        </div>
      ) : (
        <>
          {/* 2. Popular Found Belongings Section */}
          <div className="mb-4">
            <div className="section-header-editorial">
              <h5>Popular Found Items</h5>
              <Link to="/items?reportType=found" className="more-link">
                more
              </Link>
            </div>

            {foundItems.length === 0 ? (
              <div className="p-4 bg-white border border-dark rounded text-center text-muted small">
                No found belongings reported in this category.
              </div>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                {foundItems.map((item) => (
                  <div key={item._id} className="col">
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Recommended Lost Items Section */}
          <div className="mb-4">
            <div className="section-header-editorial">
              <h5>Recent Missing Reports</h5>
              <Link to="/items?reportType=lost" className="more-link">
                more
              </Link>
            </div>

            {lostItems.length === 0 ? (
              <div className="p-4 bg-white border border-dark rounded text-center text-muted small">
                No lost reports filed in this category.
              </div>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                {lostItems.map((item) => (
                  <div key={item._id} className="col">
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
