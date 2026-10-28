import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Support() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'ticket' | 'faq' | 'locations'
  const [copied, setCopied] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  });

  const handleCopyContacts = () => {
    navigator.clipboard?.writeText(
      'Campus Lost & Found Office\nStudent Union Bldg, Suite 104\nPhone: (555) 019-9000 (Campus ext: 4357)\nEmergency Dispatch: (555) 019-9111\nEmail: lostfound@campus.edu'
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;
    
    const randomRef = 'LNF-' + Math.floor(10000 + Math.random() * 90000);
    setTicketRef(randomRef);
    setTicketSubmitted(true);
    
    try {
      const existing = JSON.parse(localStorage.getItem('campus_lnf_tickets') || '[]');
      existing.unshift({
        id: randomRef,
        ...formData,
        date: new Date().toISOString(),
        status: 'Open / Dispatched to Staff'
      });
      localStorage.setItem('campus_lnf_tickets', JSON.stringify(existing.slice(0, 10)));
    } catch {
      // fallback
    }
  };

  return (
    <div className="main-content-area p-3 p-md-4">
      {/* Editorial Title Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom border-dark">
        <div>
          <span className="badge rounded-0 bg-dark text-warning font-monospace text-uppercase mb-1">
            CAMPUS HELP & ASSISTANCE
          </span>
          <h2 className="fw-bold mb-0 text-dark">Lost & Found Support Center</h2>
          <p className="text-muted small mb-0 font-monospace">
            Official university office directory, lost item inquiries, and campus property recovery assistance.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <Link to="/items" className="btn btn-sm btn-outline-dark rounded-0 fw-bold">
            <i className="bi bi-grid me-1"></i> Browse Catalog
          </Link>
          <Link
            to="/report-lost"
            className="btn btn-sm rounded-0 border border-dark fw-bold text-white"
            style={{ backgroundColor: '#ff6b35' }}
          >
            <i className="bi bi-plus-lg me-1"></i> Report Lost Item
          </Link>
        </div>
      </div>

      {/* Quick Status Notice Bar */}
      <div
        className="p-3 border border-dark rounded-0 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2"
        style={{ backgroundColor: '#fed639' }}
      >
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-info-circle-fill fs-5 text-dark"></i>
          <span className="fw-bold text-dark font-monospace small">
            CENTRAL DESK STATUS: OPEN TODAY (8:00 AM – 6:00 PM) • PHONE: (555) 019-9000 (EXT. 4357)
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyContacts}
          className="btn btn-sm btn-dark rounded-0 fw-bold font-monospace"
        >
          <i className={`bi ${copied ? 'bi-check-lg text-success' : 'bi-clipboard'} me-1`}></i>
          {copied ? 'COPIED TO CLIPBOARD' : 'COPY CONTACT INFO'}
        </button>
      </div>

      {/* Tabs */}
      <div className="category-scroll-bar mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`category-pill ${activeTab === 'contacts' ? 'active' : ''}`}
        >
          <i className="bi bi-telephone-fill me-1"></i> Office Contacts & Desks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ticket')}
          className={`category-pill ${activeTab === 'ticket' ? 'active' : ''}`}
        >
          <i className="bi bi-ticket-detailed-fill me-1"></i> Submit Help Ticket
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`category-pill ${activeTab === 'faq' ? 'active' : ''}`}
        >
          <i className="bi bi-question-circle-fill me-1"></i> FAQs & Recovery Policy
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`category-pill ${activeTab === 'locations' ? 'active' : ''}`}
        >
          <i className="bi bi-geo-alt-fill me-1"></i> Campus Drop-off Locations
        </button>
      </div>

      {/* Tab 1: Contacts */}
      {activeTab === 'contacts' && (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="p-4 border border-dark rounded-0 bg-white h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge bg-warning text-dark border border-dark rounded-0 font-monospace">
                  PRIMARY HUB
                </span>
                <span className="text-success fw-bold font-monospace small">
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.6rem' }}></i> Active Staffing
                </span>
              </div>
              <h4 className="fw-bold text-dark mb-1">Student Union Central Lost & Found</h4>
              <p className="text-muted small mb-3">
                Main intake, cataloging, and pickup facility for all items turned in across campus grounds, lecture halls, and eateries.
              </p>
              <div className="font-monospace small space-y-2 border-top border-dark pt-3">
                <div><strong>Location:</strong> Student Union Building, Room 104 (1st Floor)</div>
                <div><strong>Operating Hours:</strong> Monday – Friday: 8:00 AM – 6:00 PM</div>
                <div><strong>Weekend Hours:</strong> Saturday: 10:00 AM – 2:00 PM</div>
                <div><strong>Direct Line:</strong> (555) 019-9000 (Ext. 4357)</div>
                <div><strong>Campus Mail:</strong> lostfound@campus.edu</div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="p-4 border border-dark rounded-0 bg-white h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge bg-danger text-white border border-dark rounded-0 font-monospace">
                  EMERGENCY & AFTER-HOURS
                </span>
                <span className="text-danger fw-bold font-monospace small">
                  <i className="bi bi-shield-check me-1"></i> 24/7 Operations
                </span>
              </div>
              <h4 className="fw-bold text-dark mb-1">Campus Safety & Police Substation</h4>
              <p className="text-muted small mb-3">
                Dedicated for urgent recovery of vehicle keys, student credentials, sensitive electronics, and high-value wallets.
              </p>
              <div className="font-monospace small space-y-2 border-top border-dark pt-3">
                <div><strong>Location:</strong> North Gate Hall, Building 3 (Security Lobby)</div>
                <div><strong>Operating Hours:</strong> 24 Hours / 7 Days a week</div>
                <div><strong>Urgent Dispatch:</strong> (555) 019-9111</div>
                <div><strong>Drop-Box:</strong> Secure steel deposit slot in outer vestibule</div>
                <div><strong>Email:</strong> public-safety@campus.edu</div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-3 border border-dark rounded-0 bg-white h-100">
              <h6 className="fw-bold text-dark mb-1">
                <i className="bi bi-book text-primary me-1"></i> Library Circulation
              </h6>
              <p className="small text-muted mb-2">Main University Library, 2nd Floor desk.</p>
              <div className="font-monospace small text-muted">
                <div>Hours: Mon–Sun till 12:00 AM</div>
                <div>Phone: (555) 019-9230</div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-3 border border-dark rounded-0 bg-white h-100">
              <h6 className="fw-bold text-dark mb-1">
                <i className="bi bi-activity text-success me-1"></i> Athletics & Rec Center
              </h6>
              <p className="small text-muted mb-2">Aquatics & Gym Equipment Front Office.</p>
              <div className="font-monospace small text-muted">
                <div>Hours: 6:00 AM – 10:00 PM</div>
                <div>Phone: (555) 019-9400</div>
              </div>
            </div>
          </div>

          <div className="col-md-12 col-lg-4">
            <div className="p-3 border border-dark rounded-0 bg-white h-100">
              <h6 className="fw-bold text-dark mb-1">
                <i className="bi bi-bus-front text-warning me-1"></i> Campus Shuttle Services
              </h6>
              <p className="small text-muted mb-2">Transit Hub Depot, South Perimeter Road.</p>
              <div className="font-monospace small text-muted">
                <div>Hours: 7:00 AM – 9:00 PM</div>
                <div>Phone: (555) 019-9550</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ticket Form */}
      {activeTab === 'ticket' && (
        <div className="border border-dark rounded-0 bg-white p-4 shadow-sm" style={{ maxWidth: '800px' }}>
          {ticketSubmitted ? (
            <div className="text-center py-4">
              <div className="text-success mb-2">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4 className="fw-bold font-monospace text-dark mb-1">INQUIRY DISPATCHED SUCCESSFULLY</h4>
              <p className="text-muted small mb-3">
                Your request has been routed to the campus lost and found coordinators. You will receive an email update shortly.
              </p>
              <div className="d-inline-block px-4 py-2 border border-dark bg-warning font-monospace fw-bold mb-3 fs-5">
                Ticket Number: #{ticketRef}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setTicketSubmitted(false);
                    setFormData({ ...formData, subject: '', message: '' });
                  }}
                  className="btn btn-sm btn-dark rounded-0 px-4 fw-bold"
                >
                  Submit Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit}>
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-dark">
                <i className="bi bi-envelope-paper-fill fs-5 text-warning"></i>
                <h5 className="fw-bold text-dark mb-0 font-monospace">SUBMIT A SUPPORT OR RECOVERY INQUIRY</h5>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold font-monospace mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control rounded-0 border border-dark"
                    placeholder="e.g. Jordan Lee"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold font-monospace mb-1">Campus Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-control rounded-0 border border-dark"
                    placeholder="e.g. jlee@campus.edu"
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-5">
                  <label className="form-label small fw-bold font-monospace mb-1">Inquiry Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select rounded-0 border border-dark font-monospace"
                  >
                    <option value="General Inquiry">General Lost & Found Question</option>
                    <option value="Lost Student ID / Card">Lost Student ID / Keycard</option>
                    <option value="Urgent Valuables">High-Value Electronic / Jewelry</option>
                    <option value="Claim Verification">Help With Existing Claim Verification</option>
                    <option value="Pickup Code Issue">Secure Locker Pickup Assistance</option>
                    <option value="Dispute Ownership">Ownership Dispute / Error</option>
                  </select>
                </div>
                <div className="col-md-7">
                  <label className="form-label small fw-bold font-monospace mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="form-control rounded-0 border border-dark"
                    placeholder="e.g. Lost hydroflask left in Hall B yesterday"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold font-monospace mb-1">Message Details</label>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-control rounded-0 border border-dark"
                  placeholder="Provide detailed description, brand, stickers, approximate time/building, or related report ID..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn rounded-0 border border-dark fw-bold px-4 text-white"
                style={{ backgroundColor: '#ff6b35' }}
              >
                <i className="bi bi-send-fill me-1"></i> Send Support Request
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: FAQs */}
      {activeTab === 'faq' && (
        <div className="space-y-3" style={{ maxWidth: '900px' }}>
          <div className="p-4 border border-dark rounded-0 bg-white shadow-sm mb-3">
            <h5 className="fw-bold font-monospace text-dark mb-2">
              <i className="bi bi-shield-check text-warning me-2"></i> How do I prove ownership of high-value items?
            </h5>
            <p className="text-muted small mb-0">
              For smartphones, tablets, and laptops, owners must unlock the device with their PIN or biometric in the presence of lost & found personnel. For other electronics or jewelry, original purchase receipts, warranty registration, serial numbers, or photo proof with the item is accepted.
            </p>
          </div>

          <div className="p-4 border border-dark rounded-0 bg-white shadow-sm mb-3">
            <h5 className="fw-bold font-monospace text-dark mb-2">
              <i className="bi bi-clock-history text-warning me-2"></i> How long are unclaimed items stored?
            </h5>
            <p className="text-muted small mb-0">
              Under university property policies, all registered items are safely retained for exactly 90 calendar days from the date logged into the system. Items remaining unclaimed after 90 days are donated to accredited campus charities or auctioned for student scholarship funds.
            </p>
          </div>

          <div className="p-4 border border-dark rounded-0 bg-white shadow-sm mb-3">
            <h5 className="fw-bold font-monospace text-dark mb-2">
              <i className="bi bi-box-arrow-in-down text-warning me-2"></i> Where can I turn in an item found after hours?
            </h5>
            <p className="text-muted small mb-0">
              You can turn in any found item 24/7 at the Campus Public Safety Office (North Gate Hall, Building 3). Use the secure external drop-box or hand it directly to the dispatch officer on duty.
            </p>
          </div>

          <div className="p-4 border border-dark rounded-0 bg-white shadow-sm">
            <h5 className="fw-bold font-monospace text-dark mb-2">
              <i className="bi bi-credit-card-2-front text-warning me-2"></i> What happens to lost student IDs or credit cards?
            </h5>
            <p className="text-muted small mb-0">
              Lost student ID cards are transferred daily to the Campus Card Office in Student Union 202. Debit and credit cards that are not claimed within 48 hours are shredded according to bank security regulations.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Locations */}
      {activeTab === 'locations' && (
        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 border border-dark rounded-0 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-dark text-warning rounded-0 font-monospace">HUB #1</span>
                <h6 className="fw-bold mb-0">Student Union Lost & Found (Main)</h6>
              </div>
              <p className="small text-muted mb-2">
                Central pickup counter. All items from classrooms, cafeteria, and student plaza are consolidated here.
              </p>
              <div className="small font-monospace">Room 104 • Ground Floor • Phone: ext. 4357</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-dark rounded-0 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-dark text-warning rounded-0 font-monospace">HUB #2</span>
                <h6 className="fw-bold mb-0">North Campus Safety Station</h6>
              </div>
              <p className="small text-muted mb-2">
                24/7 drop-box for after-hours findings, bicycles, wallets, and vehicle keys.
              </p>
              <div className="small font-monospace">North Gate Hall • Lobby • Phone: ext. 9111</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-dark rounded-0 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-dark text-warning rounded-0 font-monospace">HUB #3</span>
                <h6 className="fw-bold mb-0">Main University Library</h6>
              </div>
              <p className="small text-muted mb-2">
                Circulation desk handles flash drives, notebooks, chargers, and textbooks found in study carrels.
              </p>
              <div className="small font-monospace">Level 2 Help Counter • Phone: ext. 9230</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 border border-dark rounded-0 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-dark text-warning rounded-0 font-monospace">HUB #4</span>
                <h6 className="fw-bold mb-0">Recreation & Fitness Center</h6>
              </div>
              <p className="small text-muted mb-2">
                Locker room items, water bottles, sportswear, and fitness wearables.
              </p>
              <div className="small font-monospace">Main Rec Entrance Counter • Phone: ext. 9400</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
