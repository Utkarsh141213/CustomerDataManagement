// src/components/SummaryModal.js

import React, { useEffect, useState } from "react";
import axios from "axios";

function SummaryModal({ customer, onClose, API_URL, token }) {
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState("");

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/customers/${customer._id}/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: month || undefined },
        }
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary", err);
    }
  };

  useEffect(() => {
    if (customer) fetchSummary();
  }, [customer, month]);

  const handleGenerateInvoice = () => {
    if (!month) {
      alert("Please select a month before generating invoice!");
      return;
    }
    const url = `${API_URL}/api/admin/invoice/${customer._id}?month=${month}`;
    window.open(url, "_blank"); // Opens invoice in new tab
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">{/* removed modal-lg */}
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Customer Summary: {customer.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="month" className="form-label">
                Select Month
              </label>
              <input
                type="month"
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="form-control"
              />
            </div>

            {summary ? (
              <div>
                <h6>Entries</h6>
                <ul className="list-unstyled">
                  {summary.entries.map((entry) => (
                    <li key={entry._id} className="mb-2 border-bottom pb-2">
                      <strong>{new Date(entry.date).toLocaleDateString()}</strong>
                      <div className="small text-muted">
                        {entry.milk.map((m) => (
                          <span key={m.type} className="me-2">
                            {m.type}: {m.qty}L @ ₹{m.ratePerLitre}
                          </span>
                        ))}
                        {entry.extras.map((extra) => (
                          <span key={extra.name} className="me-2">
                            Extra {extra.name}: {extra.qty} × ₹{extra.rate}
                          </span>
                        ))}
                      </div>
                      <div>Total: ₹{entry.total}</div>
                    </li>
                  ))}
                </ul>

                <h6>Payments</h6>
                <ul className="list-unstyled">
                  {summary.payments.map((payment) => (
                    <li key={payment._id} className="mb-1">
                      {new Date(payment.date).toLocaleDateString()} – ₹
                      {payment.amount} ({payment.method})
                    </li>
                  ))}
                </ul>

                <h6>Total Charges: ₹{summary.totalCharges}</h6>
                <h6>Total Paid: ₹{summary.totalPaid}</h6>
                <h6>Due: ₹{summary.due}</h6>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
            <button className="btn btn-primary" onClick={handleGenerateInvoice}>
              Generate Invoice PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryModal;
