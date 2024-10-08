import { headers } from "next/headers";

import { type WebhookEvent } from "@clerk/nextjs/server";
import { env } from "src/env";
import { Webhook } from "svix";

import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const CLERK_WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const eventType = evt.type;
  if (eventType === "user.created") {
    const emailAddress = evt.data.email_addresses?.[0]?.email_address;
    const { id, first_name, last_name, image_url } = evt.data;

    await db.user.create({
      data: {
        id,
        emailAddress: emailAddress ?? "",
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        imageUrl: image_url ?? "",
      },
    });
  }

  return new Response("", { status: 200 });
};
