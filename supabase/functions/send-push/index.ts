import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import webpush from "https://esm.sh/web-push@3.6.7";

serve(async (req) => {
    // 1. Setup VAPID details
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey || !supabaseUrl || !supabaseServiceKey) {
        return new Response(JSON.stringify({ error: "Missing environment variables" }), { status: 500 });
    }

    webpush.setVapidDetails(
        "mailto:admin@ironcore.co",
        vapidPublicKey,
        vapidPrivateKey
    );

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 2. Parse Webhook Event
        const payload = await req.json();
        const { type, table, record, schema } = payload;

        // Only broadcast for inserts
        if (type !== 'INSERT') {
            return new Response(JSON.stringify({ message: "Ignored non-INSERT event" }), { status: 200 });
        }

        // 3. Construct Notification Payload
        let notificationPayload = { title: "IronCore Notifications", body: "" };

        if (table === "customers") {
            notificationPayload = {
                title: "New Customer Joined! 🎉",
                body: `${record.fullName} just became a member on the ${record.subscriptionPlan} plan.`
            };
        } else if (table === "payments") {
            notificationPayload = {
                title: "New Payment Received 💰",
                body: `₹${record.amount} was collected via ${record.mode}.`
            };
        } else {
            return new Response(JSON.stringify({ message: "Ignored non-monitored table" }), { status: 200 });
        }

        // 4. Fetch all active subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*");

        if (error) throw error;
        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: "No subscribers found" }), { status: 200 });
        }

        // 5. Broadcast to all subscribers
        const promises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
                return { success: true, endpoint: sub.endpoint };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                // If subscription is gone/invalid, delete it from our DB
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
                }
                return { success: false, endpoint: sub.endpoint, error: err.message };
            }
        });

        const results = await Promise.all(promises);

        return new Response(JSON.stringify({ results }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
