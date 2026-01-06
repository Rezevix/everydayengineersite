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
        from: "Jacko's Repairs <contact@everydayengineer.uk>",
        to: ["everydayengineeruk@gmail.com"],
        subject: `New ${service} enquiry from ${name}`,
        html: htmlBody
      })
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend error:", error);
      return new Response("Email failed to send", { status: 500 });
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response("Server error", { status: 500 });
  }
}
