import React, { useEffect, useState } from 'react';
import { Download, FileText, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';
import { apis, API } from '../types';
import { getUserData } from '../userStore/userData';
import { useLanguage } from '../context/LanguageContext';

const Invoices = () => {
    const { t } = useLanguage();
    const [payments, setPayments] = useState([]);
    const [_loading, setLoading] = useState(true);
    const token = getUserData()?.token;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await axios.get(apis.getPayments, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000 // 5 seconds timeout
                });
                setPayments(res.data);
            } catch (err) {
                console.error('Error fetching payments:', err);
                // On error, let the loading clear so demo can show
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPayments();
        }
    }, [token]);

    const handleDownload = (invoicePath) => {
        // Since invoicePath is absolute on backend, we might need to adjust it or 
        // rely on the static serving we just set up.
        // Assuming the backend serves it at /invoices/filename
        const fileName = invoicePath.split('\\').pop().split('/').pop();
        const downloadUrl = `${API.replace('/api', '')}/invoices/${fileName}`;
        window.open(downloadUrl, '_blank');
    };

    return (
        <div className="p-4 md:p-8 h-full bg-secondary overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">{t('invoicesPage.title')}</h1>
                <p className="text-sm md:text-base text-subtext">{t('invoicesPage.subtitle')}</p>
            </div>

            <div className="bg-white md:rounded-2xl md:border md:border-border md:shadow-sm overflow-hidden bg-transparent md:bg-white">
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-subtext">{t('invoicesPage.table.plan')}</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-subtext">{t('invoicesPage.table.date')}</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-subtext">{t('invoicesPage.table.amount')}</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-subtext">{t('invoicesPage.table.status')}</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-subtext text-right">{t('invoicesPage.table.invoice')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {/* Demo Row shown when no real payments exist */}
                            {payments.length === 0 && (
                                <tr className="bg-blue-50/30">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-primary italic">{t('invoicesPage.demoPlan')}</div>
                                        <div className="text-xs text-subtext">{t('invoicesPage.demoId')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-subtext">
                                            <Calendar className="w-4 h-4" />
                                            {new Date().toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-maintext">
                                        USD 0.00
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {t('invoicesPage.demoStatus')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDownload('demo_invoice.pdf')}
                                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            {t('invoicesPage.download')}
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {payments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-surface/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-maintext">{payment.planName}</div>
                                        <div className="text-xs text-subtext">ID: {payment.transactionId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-subtext">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-maintext">
                                        {payment.currency} {payment.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDownload(payment.invoicePath)}
                                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            {t('invoicesPage.download')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-4">
                    {payments.length === 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-bold text-primary italic text-base">{t('invoicesPage.demoPlan')}</div>
                                    <div className="text-[10px] text-subtext uppercase font-bold mt-1 tracking-wider">{t('invoicesPage.demoId')}</div>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                                    {t('invoicesPage.demoStatus')}
                                </span>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-subtext font-medium">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date().toLocaleDateString()}
                                    </div>
                                    <div className="text-lg font-black text-maintext">USD 0.00</div>
                                </div>
                                <button
                                    onClick={() => handleDownload('demo_invoice.pdf')}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('invoicesPage.download')}
                                </button>
                            </div>
                        </div>
                    )}

                    {payments.map((payment) => (
                        <div key={payment._id} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-bold text-maintext text-base">{payment.planName}</div>
                                    <div className="text-[10px] text-subtext uppercase font-bold mt-1 tracking-wider">ID: {payment.transactionId}</div>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {payment.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-subtext font-medium">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-lg font-black text-maintext">
                                        {payment.currency} {payment.amount.toFixed(2)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownload(payment.invoicePath)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('invoicesPage.download')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default Invoices;
