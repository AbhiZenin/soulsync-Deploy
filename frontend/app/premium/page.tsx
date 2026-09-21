'use client';import {useEffect,useState} from 'react';import AppShell from '@/components/AppShell';import {api} from '@/lib/api';
type Sub={plan:string;startsAt?:string;endsAt?:string;entitlements:string[]};
export default function Premium() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api<Sub>("/subscriptions/me");
        setSub(data);
      } catch {
        setLoadError("Unable to load your current subscription.");
      }
    }

    load();
  }, []);

  const plans = [
    {
      name: "FREE",
      price: "$0",
      items: [
        "Create a complete profile",
        "Compatibility recommendations",
        "Search profiles",
        "Send interests",
      ],
    },
    {
      name: "PREMIUM",
      price: "$29/mo",
      items: [
        "Everything in Free",
        "Advanced search",
        "Profile visitors",
        "Unlimited interests",
        "Contact visibility",
        "Messaging entitlements",
      ],
    },
    {
      name: "PREMIUM_PLUS",
      price: "$49/mo",
      items: [
        "Everything in Premium",
        "Profile boost",
        "Video-call entitlement",
        "Priority support",
      ],
    },
  ];

  return (
    <AppShell
      title="SoulSync Premium"
      subtitle={`Current plan: ${sub?.plan ?? "loading…"}`}
    >
      <div className="premium-grid">
        {plans.map((plan) => {
          const current = sub?.plan === plan.name;
          const paidPlan = plan.name !== "FREE";

          return (
            <div
              className={`plan ${
                plan.name === "PREMIUM" ? "featured" : ""
              }`}
              key={plan.name}
            >
              <span className={`status ${current ? "ACTIVE" : ""}`}>
                {current ? "CURRENT" : paidPlan ? "COMING SOON" : "PLAN"}
              </span>

              <h3>{plan.name.replace("_", " ")}</h3>

              <div className="plan-price">{plan.price}</div>

              <ul>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {paidPlan && (
                <button
                  className="primary-btn"
                  type="button"
                  disabled
                  style={{
                    opacity: 0.65,
                    cursor: "not-allowed",
                  }}
                >
                  Coming soon
                </button>
              )}
            </div>
          );
        })}
      </div>

      {loadError && (
        <div className="form-message section-gap">
          {loadError}
        </div>
      )}
    </AppShell>
  );
}
