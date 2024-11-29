// pb_hooks/new_subscription_email.pb.js
routerAdd("afterCreate", "subscriptions", (e) => {
  // Only process if the subscription is active
  if (e.record.get("status") !== "active") {
    return;
  }

  // Fetch the related user and customer details
  const userId = e.record.get("user_id");
  const customerId = e.record.get("customer_id");

  // Fetch user details
  const user = $app.dao().findRecordById("users", userId);
  if (!user) {
    console.log("User not found for subscription");
    return;
  }

  // Prepare email details
  const userEmail = user.get("email");
  const userName = user.get("name") || "Valued Customer";
  const planName = e.record.get("plan_name") || "Premium Plan";

  // Send welcome email
  try {
    $app.mailClient.send({
      from: "Sanju <sanju@fli.so>",
      to: userEmail,
      subject: "Welcome to Our Premium Service!",
      html: `
                <html>
                <body>
                    <h1>Welcome Aboard, ${userName}!</h1>
                    <p>Thank you for subscribing to our ${planName}. We're excited to have you!</p>
                    <p>Here are some next steps to get started:</p>
                    <ul>
                        <li>Explore all the premium features</li>
                        <li>Check out our documentation</li>
                        <li>Connect with our support team if you need help</li>
                    </ul>
                    <p>Best regards,<br>Your Company Team</p>
                </body>
                </html>
            `,
    });

    console.log(
      `Welcome email sent to ${userEmail} for new ${planName} subscription`,
    );
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
});
