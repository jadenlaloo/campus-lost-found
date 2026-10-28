import React from 'react';
import { useInspector } from '../context/InspectorContext';

export default function ItemCard({ item, onOpenClaim }) {
  const { selectedItem, setSelectedItem } = useInspector();

  const isSelected = selectedItem?._id === item._id;
  const isLost = item.reportType === 'lost';

  const handleClick = () => {
    setSelectedItem(item);
  };

  return (
    <div
      className={`item-card-editorial ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {/* Cover Image Container */}
      <div className="item-card-img-wrap">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.itemName}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`w-100 h-100 align-items-center justify-content-center text-secondary ${item.imageUrl ? 'd-none' : 'd-flex'}`}
        >
          <i className="bi bi-box-seam fs-2 opacity-50"></i>
        </div>

        {/* Report Type Tag */}
        <span className={`item-card-badge ${isLost ? 'lost' : 'found'}`}>
          {isLost ? 'LOST' : 'FOUND'}
        </span>
      </div>

      {/* Content Area */}
      <div className="item-card-content">
        <div className="item-card-title" title={item.itemName}>
          {item.itemName}
        </div>

        <div className="item-card-author" title={item.campusLocation}>
          {item.campusLocation}
        </div>

        {/* Card Footer: Star Rating + Bookmark Icon */}
        <div className="item-card-footer">
          <span className="star-rating">
            ★★★★★
          </span>
          <i
            className={`bi ${isSelected ? 'bi-bookmark-fill text-dark' : 'bi-bookmark text-muted'}`}
            title="Inspect"
          ></i>
        </div>
      </div>
    </div>
  );
}
