Dodo Payments Subscription + UPI Integration Report
Date: 2026-05-14

Executive summary
- Objective: Implement monthly subscription checkout using Dodo Payments with UPI support, secure webhook processing, and clean admin/member UX in test_mode.
- Outcome: The backend exposes a Dodo Checkout session with India/UPI configuration, verifies webhooks with signature validation, reconciles payments in MongoDB, and aligns frontend flows for members to subscribe and see status. Admin financials reflect webhook-driven updates.

Core changes (files and behavior)
- Server
  - Added/updated Dodo Checkout session logic in [server/src/controllers/payment.controller.js](server/src/controllers/payment.controller.js)
    - Uses Dodo SDK to create checkoutSessions with:
      - allowed_payment_method_types: ["upi_collect", "credit", "debit"]
      - billing_currency: "INR"
      - billing_address: { country: "IN", zipcode: "560001" }
      - customer prefill: email, full name, and phone_number (India KYC-friendly)
      - metadata: memberId, gymId, paymentType, paymentRecordId
    - Persists a pending Payment document, attaches gatewayTransactionId, and returns session.checkout_url to the client
    - Sets return_url to your app route /member/payment/status?status=success&ref=...
  - Webhooks: Verified + extended at [server/src/routes/webhook.routes.js](server/src/routes/webhook.routes.js)
    - Accepts POST /api/v1/webhooks/dodo (express.raw for signature verification)
    - Uses Standard Webhooks library to verify with DODO_WEBHOOK_KEY
    - Processes:
      - payment.succeeded → marks pending Payment completed or creates a new completed record if none existed
      - payment.failed → marks Payment failed
      - subscription.active → marks member membershipStatus as active
      - subscription.renewed → keeps membership active and records a renewal Payment
    - Idempotency: in-memory Set deduplicates by webhook-id (recommend persisting for production)
  - Mount order (raw body before JSON) confirmed in [server/src/app.js](server/src/app.js)
- Client
  - Member checkout UI in [client/src/pages/member/MembershipCheckout.jsx](client/src/pages/member/MembershipCheckout.jsx)
    - Calls POST /api/v1/payments/dodo/checkout and redirects to checkoutUrl
    - Falls back to env VITE_DODO_PRODUCT_MONTHLY when plan lacks dodoProductId
    - Plan duration renderer adapted to handle { value, unit } format
  - Payment status page in [client/src/pages/member/PaymentStatus.jsx](client/src/pages/member/PaymentStatus.jsx)
    - Displays success/failure and routes back to dashboard

Environment variables
- Server (.env)
  - DODO_API_KEY=sk_test_xxx
  - DODO_ENVIRONMENT=test_mode
  - DODO_WEBHOOK_KEY=whsec_test_xxx
  - CLIENT_URL=http://localhost:5173
- Client (.env)
  - VITE_API_URL=http://localhost:5000/api/v1
  - VITE_DODO_PRODUCT_MONTHLY=prod_XXXXXXXX

Note: Update [server/.env.example](server/.env.example) to include the Dodo variables above for team onboarding (currently lists Stripe/Razorpay placeholders).

UPI enablement (India)
- Conditions implemented in checkoutSessions.create:
  - allowed_payment_method_types includes "upi_collect"
  - billing_currency set to "INR"
  - billing_address.country set to "IN" with a valid zipcode
  - Recommend passing an Indian phone number for better KYC/mandate UX
- Test UPI in test_mode:
  - success VPA: success@upi
  - failure VPA: failure@upi

Data model flow
- Payment (Mongo) in [server/src/models/Payment.js](server/src/models/Payment.js)
  - Creates pending record before redirect (gateway: dodo)
  - On webhook success:
    - status → completed
    - paidAt → now
    - amount stored in rupees; webhook amount from Dodo is lowest unit, converted by /100
- Member in [server/src/models/Member.js](server/src/models/Member.js)
  - Webhooks set membershipStatus to active on subscription.active and renewed

Security
- Webhook signature verification via Standard Webhooks with DODO_WEBHOOK_KEY
- Idempotency guard to avoid duplicate processing (in-memory Set; recommend persistent store for production)
- Secrets only from environment variables; never committed
- Admin endpoints are protected and role-gated; member-only flows use JWT+Zustand auth

Testing plan (sandbox)
1) Configure env
   - Server: DODO_API_KEY (test), DODO_ENVIRONMENT=test_mode, DODO_WEBHOOK_KEY (test), CLIENT_URL=http://localhost:5173
   - Client: VITE_API_URL=http://localhost:5000/api/v1, VITE_DODO_PRODUCT_MONTHLY=prod_XXXXXXXX
2) Start services
   - Ensure MongoDB is running
   - Backend: npm run dev (GET http://localhost:5000/health → status ok)
   - Frontend: npm run dev (http://localhost:5173)
3) Webhook setup
   - Expose backend via tunnel: https://<tunnel>/api/v1/webhooks/dodo
   - Configure webhook URL + secret in Dodo dashboard (test project)
4) Member checkout
   - Login as member
   - Navigate to /member/checkout
   - Choose plan → Pay → Dodo Hosted Checkout
   - Select UPI and enter success@upi
   - Complete flow; redirected to /member/payment/status?status=success
5) Verify reconciliation
   - Admin → /admin/payments shows completed Payment
   - Payment has gatewayTransactionId set; amount in rupees
6) Negative test (optional)
   - Use failure@upi → expect failure UI and Payment status failed

Production rollout checklist
- Switch to live_mode and live keys after sandbox validation
- Persist webhook idempotency (webhook-id) in DB with TTL
- Store Dodo customer_id on Member to support Customer Portal and plan changes
- Monitor logging (winston) + retain request IDs if using SDK with withResponse()
- Rotate webhook key periodically; enforce HTTPS-only webhook endpoint
- Add backoff/retry for any downstream DB updates in webhook handlers

Known gaps and recommended next steps
- Customer Portal route:
  - Add GET /api/v1/payments/dodo/portal?customer_id=cus_... that proxies Dodo customers.customerPortal.create for self-serve management
  - Optionally derive customer_id by storing it on Member from webhooks
- Plan to product mapping:
  - Add dodoProductId to MembershipPlan and seed real IDs via admin UI
- Stronger idempotency:
  - Replace in-memory Set with a persistent processed ids collection (webhookId, receivedAt, TTL index)

References (Dodo Knowledge docs)
- Checkout Sessions: https://docs.dodopayments.com/developer-resources/checkout-session
- Subscription Integration: https://docs.dodopayments.com/developer-resources/subscription-integration-guide
- India Payment Methods (UPI, Rupay): https://docs.dodopayments.com/features/payment-methods/india
- Testing Process (UPI VPAs): https://docs.dodopayments.com/miscellaneous/testing-process
- Webhooks & Signature Verification: https://docs.dodopayments.com/developer-resources/webhooks

Appendix: Endpoint catalog
- POST /api/v1/payments/dodo/checkout
  - Body: { productId, amount, planName, paymentType }
  - Returns: { checkoutUrl, paymentId, recordId }
- POST /api/v1/webhooks/dodo
  - Raw JSON body, signed; events processed asynchronously
- GET /api/v1/payments (owner/trainer)
  - Lists payments with pagination/filters
- GET /api/v1/payments/stats (owner/trainer)
  - 30-day revenue/time series
- GET /api/v1/payments/:id/invoice
  - Local PDF invoice for manual/cash entries (Dodo receipts via dashboard)