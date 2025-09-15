// src/components/Dashboard.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import EntryModal from "./EntryModal";
import SummaryModal from "./SummaryModal";
import PaymentModal from "./PaymentModal";

const API_URL = process.env.REACT_APP_API_URL;

function Dashboard() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [phone, setMobile] = useState();
    const [due, setdue] = useState(0);
    const [entryCustomer, setEntryCustomer] = useState(null);
    const [summaryCustomer, setSummaryCustomer] = useState(null);
    const [paymentCustomer, setPaymentCustomer] = useState(null);

    const token = localStorage.getItem("token");

    const fetchCustomers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/customers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomers(res.data);
        } catch (err) {
            console.error("Error fetching customers", err);
        }
    };


    const addCustomer = async () => {
        try {
            const res = await axios.post(
                `${API_URL}/api/customers`,
                { name, phone, due },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCustomers([...customers, res.data]);
            setName("");
            setMobile();
            setShowModal(false);
            setdue(0);
        } catch (err) {
            console.error("Error adding customer", err);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalDue = customers.reduce((acc, curr) => acc + Number(curr.due), 0);

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Customer Dashboard</h2>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + Add Customer
                </button>
            </div>

            {/* Summary */}
            <div className="alert alert-success mb-4">
                <h5 className="mb-0">Total Business Receivable: ₹{totalDue}</h5>
            </div>

            {/* Search */}
            <input
                placeholder="Search Customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control mb-4"
            />

            {/* Customer Cards */}
            <div className="row">
                {filtered.map((c) => (
                    <div key={c._id} className="col-md-4 mb-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="card-title">{c.name}</h5>
                                <p className="text-danger fw-semibold">Due: ₹{c.due}</p>
                                <button
                                    className="btn btn-sm btn-outline-primary mt-2"
                                    onClick={() => setEntryCustomer(c)}
                                >
                                    + Entry
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-info mt-2 ms-2"
                                    onClick={() => setSummaryCustomer(c)} // Open Summary Modal
                                >
                                    View Summary
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-success mt-2 ms-2"
                                    onClick={() => setPaymentCustomer(c)}
                                >
                                    ₹ Payment
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Customer Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Customer</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-control mb-3"
                                />
                                <input
                                    placeholder="Mobile Number"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="form-control mb-3"
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button onClick={addCustomer} className="btn btn-primary">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Entry Modal */}
            {entryCustomer && (
                <EntryModal
                    customer={entryCustomer}
                    onClose={() => setEntryCustomer(null)}
                    API_URL={API_URL}
                    token={token}
                    onEntrySuccess={fetchCustomers}
                />
            )}

            {/* Customer Summary Modal */}
            {summaryCustomer && (
                <SummaryModal
                    customer={summaryCustomer}
                    onClose={() => setSummaryCustomer(null)}
                    API_URL={API_URL}
                    token={token}
                />
            )}

            {paymentCustomer && (
                <PaymentModal
                    customer={paymentCustomer}
                    onClose={() => setPaymentCustomer(null)}
                    API_URL={API_URL}
                    token={token}
                    onPaymentSuccess={fetchCustomers}
                />
            )}

        </div>
    );
}

export default Dashboard;
