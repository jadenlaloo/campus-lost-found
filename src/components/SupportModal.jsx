import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SupportModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'ticket' | 'faq'
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

  if (!isOpen) return null;

  const handleCopyContacts = () => {
    navigator.clipboard?.writeText(
      'Campus Lost & Found Office\nStudent Union Bldg, Suite 104\nPhone: (555) 019-9000 (Campus ext: 4357)\nEmergency: (555) 019-9111\nEmail: lostfound@campus.edu'
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
    
    // Save to user inquiry history in localStorage
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
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-2 border-dark rounded-0 shadow-lg" style={{ backgroundColor: '#fffdf9' }}>
          
          {/* Header */}
          <div className="modal-header border-bottom border-dark py-2 px-3" style={{ backgroundColor: '#fed639' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-dark text-warning border border-dark rounded-0 p-1">
                <i className="bi bi-headset fs-6"></i>
              </span>
              <h5 className="modal-title fw-bold text-dark mb-0 font-monospace" style={{ fontSize: '1rem', letterSpacing: '0.04em' }}>
                CAMPUS LOST & FOUND HELPDESK
              </h5>
            </div>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Navigation Pill Bar */}
          <div className="d-flex border-bottom border-dark px-3 pt-2 gap-2" style={{ backgroundColor: '#f5efe6' }}>
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className={`btn btn-sm rounded-0 border border-dark mb-2 px-3 fw-bold ${
                activeTab === 'contacts' ? 'bg-dark text-white' : 'bg-white text-dark'
              }`}
            >
              <i className="bi bi-telephone-fill me-1"></i> Desks & Contacts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ticket')}
              className={`btn btn-sm rounded-0 border border-dark mb-2 px-3 fw-bold ${
                activeTab === 'ticket' ? 'bg-dark text-white' : 'bg-white text-dark'
              }`}
            >
              <i className="bi bi-ticket-detailed-fill me-1"></i> Submit Inquiry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`btn btn-sm rounded-0 border border-dark mb-2 px-3 fw-bold ${
                activeTab === 'faq' ? 'bg-dark text-white' : 'bg-white text-dark'
              }`}
            >
              <i className="bi bi-question-circle-fill me-1"></i> Quick FAQs
            </button>
          </div>

          {/* Content Body */}
          <div className="modal-body p-4" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="alert border border-dark rounded-0 bg-white p-3 mb-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-success rounded-0 text-uppercase font-monospace mb-1">
                        <i className="bi bi-clock me-1"></i> Open Now: 8:00 AM – 6:00 PM
                      </span>
                      <h6 className="fw-bold mb-0 text-dark">Central Campus Lost & Found Office</h6>
                      <small className="text-muted">Student Union Building, 1st Floor, Room 104 (Adjacent to Welcome Desk)</small>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyContacts}
                      className="btn btn-sm rounded-0 border border-dark bg-warning text-dark fw-bold"
                    >
                      <i className={`bi ${copied ? 'bi-check-lg text-success' : 'bi-clipboard'} me-1`}></i>
                      {copied ? 'Copied!' : 'Copy Info'}
                    </button>
                  </div>
                  <div className="row g-2 mt-2 pt-2 border-top border-secondary border-opacity-25 font-monospace small">
                    <div className="col-sm-6">
                      <span className="text-muted">Direct Line:</span> <strong>(555) 019-9000</strong> (ext. 4357)
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted">Email:</span> <strong>lostfound@campus.edu</strong>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 border border-dark rounded-0 bg-white h-100">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-shield-shaded text-danger fs-5"></i>
                        <h6 className="fw-bold mb-0 text-dark">Campus Public Safety (24/7)</h6>
                      </div>
                      <p className="small text-muted mb-2">
                        For after-hours drop-offs, urgent keys, wallets, or sensitive items requiring immediate campus lockbox storage.
                      </p>
                      <ul className="list-unstyled small font-monospace mb-0">
                        <li><strong>Location:</strong> North Gate Hall, Bldg 3</li>
                        <li><strong>Dispatch:</strong> (555) 019-9111</li>
                        <li><strong>Drop-box:</strong> 24-Hour Secure Slot (Lobby)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 border border-dark rounded-0 bg-white h-100">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-book-half text-primary fs-5"></i>
                        <h6 className="fw-bold mb-0 text-dark">Library Circulation Sub-Desk</h6>
                      </div>
                      <p className="small text-muted mb-2">
                        Items found inside the Main University Library or Study Commons are held here for 48 hours before transfer to Union 104.
                      </p>
                      <ul className="list-unstyled small font-monospace mb-0">
                        <li><strong>Location:</strong> University Library, Level 2</li>
                        <li><strong>Phone:</strong> (555) 019-9230</li>
                        <li><strong>Hours:</strong> Mon–Sun until Midnight</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ticket' && (
              <div>
                {ticketSubmitted ? (
                  <div className="p-4 border border-dark rounded-0 bg-white text-center shadow-sm">
                    <div className="text-success mb-2">
                      <i className="bi bi-check-circle-fill" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold text-dark font-monospace mb-1">INQUIRY DISPATCHED</h5>
                    <p className="text-muted small mb-3">
                      Your support request has been logged. Our student desk officer will review and reply within 4 business hours.
                    </p>
                    <div className="d-inline-block px-3 py-2 border border-dark bg-warning font-monospace fw-bold mb-3">
                      Ticket Reference: #{ticketRef}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setTicketSubmitted(false);
                          setFormData({ ...formData, subject: '', message: '' });
                        }}
                        className="btn btn-sm btn-dark rounded-0 px-3 fw-bold"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} className="space-y-3">
                    <div className="row g-2 mb-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold font-monospace mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="form-control form-control-sm border border-dark rounded-0"
                          placeholder="e.g. Alex Morgan"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold font-monospace mb-1">Campus Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-control form-control-sm border border-dark rounded-0"
                          placeholder="e.g. alex@campus.edu"
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-md-5">
                        <label className="form-label small fw-bold font-monospace mb-1">Inquiry Topic</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="form-select form-select-sm border border-dark rounded-0 font-monospace"
                        >
                          <option value="General Inquiry">General Lost & Found Help</option>
                          <option value="Missing Student ID / Access Card">Lost Student ID / Access Key</option>
                          <option value="High-Value Item Inquiry">Urgent Valuables (Laptop/Phone/Jewelry)</option>
                          <option value="Claim Verification Status">Claim Verification Status</option>
                          <option value="Locker Pickup Assistance">Locker Pickup Code Assistance</option>
                          <option value="Report Scam / Disputed Ownership">Disputed Item Ownership</option>
                        </select>
                      </div>
                      <div className="col-md-7">
                        <label className="form-label small fw-bold font-monospace mb-1">Subject</label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="form-control form-control-sm border border-dark rounded-0"
                          placeholder="Brief summary of what you need help with"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold font-monospace mb-1">Details & Item Notes</label>
                      <textarea
                        required
                        rows="4"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="form-control form-control-sm border border-dark rounded-0"
                        placeholder="Include distinguishing marks, dates, room numbers, or any claim ticket number..."
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-outline-dark rounded-0 fw-bold px-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-sm rounded-0 border border-dark fw-bold px-4 text-white"
                        style={{ backgroundColor: '#ff6b35' }}
                      >
                        <i className="bi bi-send-fill me-1"></i> Send Support Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-3">
                <div className="p-3 border border-dark rounded-0 bg-white mb-2">
                  <div className="fw-bold text-dark font-monospace mb-1">
                    <i className="bi bi-question-circle text-warning me-1"></i> How do I prove ownership of a lost phone or laptop?
                  </div>
                  <p className="small text-muted mb-0">
                    You can verify ownership by showing the matching device lockscreen passcode in front of staff, supplying the serial number, or providing original purchase receipts or student registration records.
                  </p>
                </div>

                <div className="p-3 border border-dark rounded-0 bg-white mb-2">
                  <div className="fw-bold text-dark font-monospace mb-1">
                    <i className="bi bi-question-circle text-warning me-1"></i> How long are unclaimed items kept on campus?
                  </div>
                  <p className="small text-muted mb-0">
                    Per campus property regulations, all items are held for a statutory period of 90 calendar days. Items not claimed after 90 days are donated to charitable partners or responsibly recycled.
                  </p>
                </div>

                <div className="p-3 border border-dark rounded-0 bg-white mb-2">
                  <div className="fw-bold text-dark font-monospace mb-1">
                    <i className="bi bi-question-circle text-warning me-1"></i> Where can I turn in an item found after business hours?
                  </div>
                  <p className="small text-muted mb-0">
                    Use the 24/7 security drop-box located in the exterior lobby of Campus Public Safety (North Gate Hall, Bldg 3), or hand it to any campus security officer on patrol.
                  </p>
                </div>

                <div className="p-3 border border-dark rounded-0 bg-white">
                  <div className="fw-bold text-dark font-monospace mb-1">
                    <i className="bi bi-question-circle text-warning me-1"></i> How does the automated match suggestion system work?
                  </div>
                  <p className="small text-muted mb-0">
                    When you file a report, our background matcher cross-checks category, item title, campus locations, and dates. You will see a match banner on your dashboard when potential matches are identified.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top border-dark py-2 px-3 justify-content-between" style={{ backgroundColor: '#f5efe6' }}>
            <span className="small font-monospace text-muted">
              Campus Security Dispatch: <strong>(555) 019-9111</strong>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-dark rounded-0 fw-bold px-3"
              onClick={onClose}
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
