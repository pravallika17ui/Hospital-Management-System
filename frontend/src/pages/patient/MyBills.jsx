import React, { useState, useEffect } from 'react';
import { billingService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Receipt, CreditCard, Printer, CheckCircle2, AlertCircle, IndianRupee, QrCode, ShieldCheck } from 'lucide-react';

export const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Pay Modal
  const [payModalBill, setPayModalBill] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);

  // Print Preview
  const [previewBill, setPreviewBill] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await billingService.getAll();
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
  }, []);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payModalBill) return;

    setPaying(true);
    try {
      const res = await billingService.pay(payModalBill.id, {
        payment_method: payMethod,
        amount: payModalBill.total_amount
      });
      showToast(`Payment successful! Transaction Ref: ${res.data?.data?.transaction_id}`);
      setPayModalBill(null);
      fetchBills();
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment transaction failed', 'error');
    } finally {
      setPaying(false);
    }
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

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Online Payments</h1>
        <p className="text-xs text-slate-500 mt-1">Review itemized hospital invoices, pay online via UPI or card, and download official payment receipts</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Department / Doctor</th>
                <th className="py-3 px-4">Itemized Breakdown</th>
                <th className="py-3 px-4">Total Net Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading invoices...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No invoices issued for your account.</td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-700">
                      {bill.bill_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{bill.doctor_name || 'Hospital Care'}</p>
                      <p className="text-[11px] text-brand-600">{bill.specialization || 'General OPD'}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      Fee: ₹{bill.consultation_fee} | Meds: ₹{bill.medicine_charges} | Lab: ₹{bill.lab_charges}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{parseFloat(bill.total_amount).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={bill.payment_status} />
                      {bill.payment_method && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">Paid via {bill.payment_method}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {bill.bill_date.slice(0, 10)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewBill(bill)}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {bill.payment_status !== 'Paid' ? (
                          <button
                            onClick={() => setPayModalBill(bill)}
                            className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600">
                            ✓ Settled
                          </span>
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

      {/* Online Payment Modal */}
      <Modal
        isOpen={!!payModalBill}
        onClose={() => setPayModalBill(null)}
        title="Hospital Online Payment Gateway"
        subtitle={payModalBill ? `Invoice Ref: ${payModalBill.bill_number} • Total Payable: ₹${payModalBill.total_amount}` : ''}
        maxWidth="max-w-md"
      >
        {payModalBill && (
          <form onSubmit={handleProcessPayment} className="space-y-5">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 text-center space-y-1">
              <span className="text-xs text-brand-700 font-bold uppercase tracking-wide">Total Invoice Amount</span>
              <h2 className="text-3xl font-black text-slate-900">₹{parseFloat(payModalBill.total_amount).toLocaleString()}</h2>
              <p className="text-[11px] text-slate-500">Includes all consultation and medical charges</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'Card', label: 'Debit/Credit', icon: CreditCard },
                  { id: 'Net Banking', label: 'Net Banking', icon: ShieldCheck }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        payMethod === m.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {payMethod === 'UPI' && (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                <div className="w-24 h-24 mx-auto bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-slate-800" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Scan QR code using GPay, PhonePe, or Paytm to complete instant payment</p>
              </div>
            )}

            {payMethod === 'Card' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Card Number (4532 •••• •••• ••••)"
                  defaultValue="4532 8920 1200 4811"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="MM/YY" defaultValue="08/28" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                  <input type="password" placeholder="CVV" defaultValue="782" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={paying}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Authorize & Pay ₹{payModalBill.total_amount}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={!!previewBill}
        onClose={() => setPreviewBill(null)}
        title="Official Hospital Payment Receipt"
        subtitle="Patient Accounting Record"
        maxWidth="max-w-xl"
      >
        {previewBill && (
          <div className="space-y-6 text-xs">
            <div className="p-6 border border-slate-200 rounded-2xl bg-white space-y-5">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">CarePoint Hospital</h3>
                  <p className="text-slate-400 text-[10px]">Tax Invoice & Patient Receipt</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-700">{previewBill.bill_number}</span>
                  <p className="text-slate-400 text-[10px]">{previewBill.bill_date.slice(0, 10)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div><strong>Patient:</strong> {previewBill.patient_name}</div>
                <div><strong>Doctor:</strong> {previewBill.doctor_name || 'General OPD'}</div>
              </div>

              <table className="w-full text-left border-y border-slate-200 py-2">
                <tbody>
                  <tr>
                    <td className="py-1">Consultation Fee</td>
                    <td className="py-1 text-right font-medium">₹{previewBill.consultation_fee}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Medicine Charges</td>
                    <td className="py-1 text-right font-medium">₹{previewBill.medicine_charges}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Laboratory & Diagnostic Tests</td>
                    <td className="py-1 text-right font-medium">₹{previewBill.lab_charges}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Other Hospital Charges</td>
                    <td className="py-1 text-right font-medium">₹{previewBill.other_charges}</td>
                  </tr>
                  <tr className="border-t font-bold text-slate-900">
                    <td className="py-2 text-sm">Total Paid</td>
                    <td className="py-2 text-right text-sm">₹{previewBill.total_amount}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center text-slate-500 pt-2">
                <span>Status: <strong className="text-emerald-600">{previewBill.payment_status}</strong></span>
                <span>Payment Method: {previewBill.payment_method || 'Online'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBills;
