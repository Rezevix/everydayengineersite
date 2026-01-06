export async function onRequestPost({ request, env }) {
    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const service = formData.get("service");
    const device = formData.get("device");
    const message = formData.get("message");

    const emailBody = `
New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Service: ${service}
Device: ${device || "Not specified"}

Message:
${message}
    `.trim();

    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            personalizations: [
                {
                    to: [{ email: "everydayengineeruk@gmail.com"}]
                }
            ],
            from: {
                email: "contact@everydayengineer.uk",
                name: "Jacko's Repairs Website"
            },
            reply_to: {
                email: email,
                name: name
            },
            subject: `New Contact Form Submission (${service})`,
            content: [
                {
                    type: "text/plain",
                    value: emailBody
                }
            ]
        })
    });

    if (!res.ok) {
        console.error(await res.text());
        return new Response("Email failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
}
