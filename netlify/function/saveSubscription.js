import webpush from "web-push";

const VAPID_PUBLIC_KEY = "BPrQaIhgAMm0epPTot0L804INFeqGY_BXCAnOQNHsRD2lcHtaKgQGOy61R-ITdkFAJgB_ILpLVp6wYHAezFnhzs";
const VAPID_PRIVATE_KEY = "fuck";

webpush.setVapidDetails("mailto:---@gmail.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

let subscriptions = [];

export async function handler(event) {
    if (event.httpMethod === "POST") {
        const subscription = JSON.parse(event.body);
        subscriptions.push(subscription);
        return { statusCode: 200, body: "Abonnement enregistré !" };
    }

    if (event.httpMethod === "GET") {
        const notificationPayload = JSON.stringify({
            title: "🔥 Alerte Crypto !",
            body: "Le BTC explose !",
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, notificationPayload).catch(err => console.error(err));
        });

        return { statusCode: 200, body: "Notifications envoyées !" };
    }

    return { statusCode: 405, body: "Méthode non autorisée" };
}
