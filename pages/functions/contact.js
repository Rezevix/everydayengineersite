export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const service = formData.get("service");
    const message = formData.get("message");
    const phone = formData.get("phone") || "Not provided";
    const device = formData.get("device") || "Not specified";


    if (!name || !email || !service || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const htmlBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service Requested:</strong> ${service}</p>
      <p><strong>Device:</strong> ${device}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Everyday Engineering <contact@everydayengineer.uk>",
        to: ["support@everydayengineer.uk"],
        subject: `New ${service} enquiry from ${name}`,
        html: htmlBody
      })
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend error:", error);
      return new Response("Email failed to send", { status: 500 });
    }
    
        // Build Discord embed payload
    const discordPayload = {
      embeds: [
        {
          title: "📩 New Website Enquiry",
          description: `New ${service} enquiry received.`,
          color: 3447003, // Change to your brand color (decimal)
          fields: [
            { name: "Name", value: name, inline: true },
            { name: "Email", value: email, inline: true },
            { name: "Phone", value: phone, inline: true },
            { name: "Service", value: service, inline: true },
            { name: "Device", value: device, inline: true },
            {
              name: "Message",
              value: message.length > 1000
                ? message.substring(0, 1000) + "..."
                : message,
              inline: false
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Send to Discord
    const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(discordPayload)
    });

    // failiure logging
    if (!discordResponse.ok) {
      const error = await discordResponse.text();
      console.error("Discord webhook error:", error);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response("Server error", { status: 500 });
  }
}
