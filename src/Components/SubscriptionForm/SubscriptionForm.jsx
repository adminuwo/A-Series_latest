import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Check, Star } from 'lucide-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { toggleState, userData } from '../../userStore/userData';
import { motion } from 'motion/react';
import { apis } from '../../types';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const SubscriptionForm = ({ id }) => {
  const navigate = useNavigate();
  const [subscripTgl, setSubscripTgl] = useRecoilState(toggleState);
  const currentUserData = useRecoilValue(userData);
  const user = currentUserData.user;
  const userId = user?.id || user?._id;

  const [isProcessing, setIsProcessing] = useState(false);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('monthly');

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await axios.get(`${apis.agents}/${id}`);
        setAgent(res.data);
        // If agent has custom plans, set the first one as default
        if (res.data?.pricing?.plans?.length > 0) {
          setSelectedPlanId(res.data.pricing.plans[0].id || res.data.pricing.plans[0]._id || res.data.pricing.plans[0].name.toLowerCase());
        }
      } catch (err) {
        console.error("Error fetching agent details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAgent();
  }, [id]);

  const defaultPlans = [
    { id: 'free', name: 'Free', price: 0, desc: 'Ideal for trying out the agent capabilities.' },
    { id: 'monthly', name: 'Pro Plan', price: 499, desc: `Allows 3 ${agent?.agentName || 'tool'} generations per day.` },
    { id: 'annual', name: 'Enterprise Plan', price: 5000, desc: 'Unlimited access and priority processing.', reduction: 'Unlimited' }
  ];

  const plans = agent?.pricing?.plans?.length > 0 ? agent.pricing.plans : defaultPlans;

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
  };

  const buyAgent = async () => {
    if (isProcessing) return;

    if (!userId) {
      toast.error("Please login to subscribe");
      navigate('/login');
      return;
    }

    const selectedPlan = plans.find(p =>
      (p.id && String(p.id) === selectedPlanId) ||
      (p._id && String(p._id) === selectedPlanId) ||
      (p.name && p.name.toLowerCase() === String(selectedPlanId).toLowerCase())
    );

    if (!selectedPlan) {
      toast.error("Please select a valid plan");
      return;
    }

    const amount = selectedPlan.price;
    const planName = selectedPlan.name;

    if (amount === 0) {
      setIsProcessing(true);
      try {
        await axios.post(`${apis.buyAgent}/${id}`, { userId });
        toast.success(`${agent?.agentName || 'Agent'} subscribed successfully!`);
        setSubscripTgl({ ...subscripTgl, subscripPgTgl: false, notify: true });
        navigate('/dashboard/chat', { state: { activated: true, toolName: agent?.agentName } });
      } catch (err) {
        console.error('Free plan subscription failed:', err);
        const msg = err.response?.data?.error || 'Failed to subscribe. Please try again.';
        toast.error(msg);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Paid Plan logic
    setIsProcessing(true);
    try {
      const orderRes = await axios.post(apis.createOrder, {
        amount,
        agentId: id,
        plan: planName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const { orderId, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: currency,
        name: "A-Series",
        description: `Subscription for ${agent?.agentName || id}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              agentId: id,
              amount,
              plan: planName
            };

            await axios.post(apis.verifyPayment, verifyData, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            toast.success("Payment successful! Agent activated.");
            setSubscripTgl({ ...subscripTgl, subscripPgTgl: false, notify: true });
            navigate('/dashboard/chat', { state: { activated: true, toolName: agent?.agentName } });
          } catch (err) {
            console.error("Verification failed", err);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Order creation failed", err);
      const errorMsg = err.response?.data?.error || "Payment gateway error. Please try again later.";
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[100] flex justify-center items-center p-4 bg-black/40 backdrop-blur-sm transition-all'>
      <StyledWrapper>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
          <div className="plan-chooser">
            <div className='flex justify-end items-center mb-2'>
              <button
                type="button"
                onClick={() => setSubscripTgl({ ...subscripTgl, subscripPgTgl: false })}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-subtext transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="header">
              <span className="title">Choose your plan</span>
              <p className="desc">{agent?.agentName ? `Select a plan for ${agent.agentName}` : 'Select a subscription plan that works for you.'}</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-subtext">Preparing plans...</p>
              </div>
            ) : (
              <>
                <div className="plans-container">
                  {plans.map((plan, index) => {
                    const planId = plan.id || plan._id || plan.name.toLowerCase();
                    const isSelected = selectedPlanId === planId;
                    return (
                      <div
                        className={`plan-option ${isSelected ? 'active' : ''}`}
                        key={planId}
                        onClick={() => handlePlanSelect(planId)}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={planId}
                          checked={isSelected}
                          onChange={() => handlePlanSelect(planId)}
                          className="hidden"
                        />
                        <div className="plan-label">
                          <div className="plan-info">
                            <span className="plan-cost">
                              {typeof plan.price === 'object' && plan.price !== null
                                ? `₹${plan.price.monthly || plan.price.yearly || plan.price.amount || 0}`
                                : `₹${plan.price}`}
                            </span>
                            <span className="plan-name">{plan.name}</span>
                            {plan.desc && <span className="plan-desc">{plan.desc}</span>}
                          </div>
                          <div className="plan-status">
                            {isSelected ? (
                              <div className="check-circle active">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="check-circle" />
                            )}
                            {plan.reduction && <span className="reduction-tag">{plan.reduction}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={buyAgent}
                  disabled={isProcessing}
                  className={`start-btn ${isProcessing ? 'loading' : ''}`}
                >
                  {isProcessing ? (
                    <div className="loader-container">
                      <div className="loader" />
                      <span>Processing...</span>
                    </div>
                  ) : 'Start'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </StyledWrapper>
    </div>
  );
}

const StyledWrapper = styled.div`
  .plan-chooser {
    background: #fff;
    width: 360px;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .header {
    text-align: center;
    margin-bottom: 24px;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1a1a1a;
    display: block;
  }

  .desc {
    font-size: 0.875rem;
    color: #666;
    margin-top: 6px;
  }

  .plans-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .plan-option {
    cursor: pointer;
    border: 2px solid #f1f5f9;
    border-radius: 16px;
    background: #f8fafc;
    padding: 16px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .plan-option:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .plan-option.active {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .plan-label {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .plan-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .plan-cost {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1a1a1a;
  }

  .plan-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
  }

  .plan-desc {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 4px;
    line-height: 1.4;
  }

  .plan-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .check-circle {
    width: 20px;
    height: 20px;
    border: 2px solid #cbd5e1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .check-circle.active {
    background: #2563eb;
    border-color: #2563eb;
  }

  .reduction-tag {
    background: #dcfce7;
    color: #166534;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 8px;
    text-transform: uppercase;
  }

  .start-btn {
    width: 100%;
    background: #2563eb;
    color: #fff;
    font-weight: 700;
    padding: 16px;
    border-radius: 16px;
    transition: all 0.2s ease;
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  }

  .start-btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 15px 20px -5px rgba(37, 99, 235, 0.4);
  }

  .start-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .start-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .loader {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animate: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default SubscriptionForm;
