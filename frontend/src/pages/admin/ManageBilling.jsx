import React, { useState, useEffect } from 'react';
import { billingService, patientService, doctorService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { CreditCard, Plus, Printer, CheckCircle2, AlertCircle, IndianRupee, Search, FileText } from 'lucide-react';

export const ManageBilling = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(null);

  const initialForm = {
    patient_id: '',
    doctor_id: '',
    consultation_fee: 500,
    medicine_charges: 0,
    lab_charges: 0,
    other_charges: 0,
    payment_status: 'Unpaid',
    payment_method: 'UPI',
    bill_date: new Date().toISOString().split('T')[0],
    notes: 'Standard OPD consultation and pharmacy invoice'
  };

  const [formData, setFormData] = useState(initialForm);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.payment_status = statusFilter;
      if (search) params.search = search;

      const res = await billingService.getAll(params);
      if (res.data?.data) {
        setBills(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    // Load patient & doctor lists for invoice generator
    patientService.getAll({ limit: 100 }).then(res => setPatients(res.data?.data?.patients || []));
    doctorService.getAll().then(res => setDoctors(res.data?.data || []));
  }, [statusFilter]);

  // Real-time calculation of total amount
  const calculatedTotal = (
    parseFloat(formData.consultation_fee || 0) +
    parseFloat(formData.medicine_charges || 0) +
    parseFloat(formData.lab_charges || 0) +
    parseFloat(formData.other_charges || 0)
  ).toFixed(2);

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await billingService.create(formData);
      showToast('Invoice generated successfully!');
      setIsCreateOpen(false);
      setFormData(initialForm);
      fetchBills();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create bill', 'error');
    }
  };

  const handleQuickPay = async (billId) => {
    try {
      await billingService.pay(billId, { payment_method: 'Cash' });
      showToast('Bill marked as Paid!');
      fetchBills();
    } catch (err) {
      showToast('Payment processing failed', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Billing & Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">Generate itemized medical invoices, record fee receipts, and print patient bills</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Generate New Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['', 'Unpaid', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Invoices'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice # or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBills()}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Consultation Doctor</th>
                <th className="py-3 px-4">Breakdown (Cons + Med + Lab + Other)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">Loading invoices...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">No invoices found.</td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-700">
                      {bill.bill_number}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {bill.patient_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{bill.patient_phone}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {bill.doctor_name ? (
                        <>
                          <span className="font-semibold text-slate-800">{bill.doctor_name}</span>
                          <span className="block text-[10px] text-brand-600">{bill.specialization}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Hospital General</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      ₹{bill.consultation_fee} + ₹{bill.medicine_charges} + ₹{bill.lab_charges} + ₹{bill.other_charges}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{parseFloat(bill.total_amount).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={bill.payment_status} />
                      {bill.payment_method && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">{bill.payment_method}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {bill.bill_date.slice(0, 10)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInvoicePreview(bill)}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {bill.payment_status !== 'Paid' && (
                          <button
                            onClick={() => handleQuickPay(bill.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate Hospital Invoice"
        subtitle="Automatic calculation of consultation, pharmaceutical, and diagnostic fees"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone || p.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Doctor</label>
              <select
                value={formData.doctor_id}
                onChange={(e) => {
                  const doc = doctors.find(d => String(d.id) === e.target.value);
                  setFormData({
                    ...formData,
                    doctor_id: e.target.value,
                    consultation_fee: doc ? doc.consultation_fee : formData.consultation_fee
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="">-- Optional: Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fee itemization inputs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Itemized Charges (₹ INR)</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Consultation Fee</label>
                <input
                  type="number"
                  min="0"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pharmacy / Meds</label>
                <input
                  type="number"
                  min="0"
                  value={formData.medicine_charges}
                  onChange={(e) => setFormData({ ...formData, medicine_charges: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lab / Tests</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lab_charges}
                  onChange={(e) => setFormData({ ...formData, lab_charges: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Other / Room</label>
                <input
                  type="number"
                  min="0"
                  value={formData.other_charges}
                  onChange={(e) => setFormData({ ...formData, other_charges: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Calculated summary */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
              <span className="text-xs font-bold text-slate-600">Calculated Invoice Total:</span>
              <span className="text-lg font-black text-brand-600">₹{calculatedTotal}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Insurance">TPA Insurance Claim</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={formData.bill_date}
                onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Billing Remarks / Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-md shadow-brand-500/20"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice View Modal */}
      <Modal
        isOpen={!!invoicePreview}
        onClose={() => setInvoicePreview(null)}
        title="Hospital Tax Invoice"
        subtitle="Official Medical Receipt"
        maxWidth="max-w-2xl"
      >
        {invoicePreview && (
          <div className="space-y-6">
            <div id="printable-bill" className="p-6 border border-slate-200 rounded-2xl bg-white space-y-6">
              
              {/* Hospital Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">CarePoint Hospital</h2>
                  <p className="text-xs text-slate-500">Bannerghatta Road, Bengaluru, 560076</p>
                  <p className="text-xs text-slate-500">Ph: +91 80 4000 5000 | GSTIN: 29AAAAA0000A1Z5</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block">INVOICE NUMBER</span>
                  <span className="text-base font-extrabold text-brand-700">{invoicePreview.bill_number}</span>
                  <p className="text-xs text-slate-500 mt-1">Date: {invoicePreview.bill_date.slice(0, 10)}</p>
                </div>
              </div>

              {/* Patient and Doctor metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block uppercase">Billed To (Patient):</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{invoicePreview.patient_name}</p>
                  <p className="text-slate-500">{invoicePreview.patient_phone}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block uppercase">Consulting Specialist:</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{invoicePreview.doctor_name || 'Hospital Staff'}</p>
                  <p className="text-slate-500">{invoicePreview.specialization || 'General Services'}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Service Description</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3">Specialist Doctor Consultation</td>
                    <td className="py-2 px-3 text-right font-medium">₹{invoicePreview.consultation_fee}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Pharmaceuticals & Prescribed Medicines</td>
                    <td className="py-2 px-3 text-right font-medium">₹{invoicePreview.medicine_charges}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Diagnostic Laboratory & Pathology Tests</td>
                    <td className="py-2 px-3 text-right font-medium">₹{invoicePreview.lab_charges}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Hospital Facilities & Consumables</td>
                    <td className="py-2 px-3 text-right font-medium">₹{invoicePreview.other_charges}</td>
                  </tr>
                </tbody>
                <tfoot className="border-t-2 border-slate-900 font-bold">
                  <tr>
                    <td className="py-3 px-3 text-sm text-slate-900">Total Net Amount</td>
                    <td className="py-3 px-3 text-right text-base text-slate-900 font-black">
                      ₹{parseFloat(invoicePreview.total_amount).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Status and Notes */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-600">Payment Status: </span>
                  <Badge status={invoicePreview.payment_status} />
                  {invoicePreview.payment_method && <span className="ml-2 text-slate-500">via {invoicePreview.payment_method}</span>}
                </div>
                <div className="text-slate-400 italic">
                  This is a computer-generated invoice.
                </div>
              </div>
            </div>

            {/* Print and Close controls */}
            <div className="flex items-center justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setInvoicePreview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageBilling;
