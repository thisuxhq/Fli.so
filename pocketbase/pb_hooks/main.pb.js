// // pb_hooks/new_url_email.pb.js
// onRecordAfterCreateRequest((e) => {
//   try {
//     // Log the entire record to inspect its contents
//     console.log("Full URL record:", JSON.stringify(e.record));

//     // Get the user record using the created_by field
//     const userId = e.record.get("created_by");
//     console.log("User ID from record:", userId);

//     if (!userId) {
//       console.error("No user ID found in the URL record");
//       return;
//     }

//     const userRecord = $app.dao().findRecordById("users", userId);

//     if (!userRecord) {
//       console.error(`No user found with ID: ${userId}`);
//       return;
//     }

//     const userEmail = userRecord.getString("email");
//     const userName = userRecord.getString("name") || "User";
//     const shortUrl = e.record.getString("slug");
//     const originalUrl = e.record.getString("url");

//     console.log("User Email:", userEmail);
//     console.log("User Name:", userName);
//     console.log("Short URL:", shortUrl);
//     console.log("Original URL:", originalUrl);

//     // Create email message
//     const message = new MailerMessage({
//       from: {
//         address: $app.settings().meta.senderAddress,
//         name: $app.settings().meta.senderName,
//       },
//       to: [{ address: userEmail }],
//       subject: "Your New Short URL Has Been Created",
//       html: `
//         <html>
//         <body>
//             <h1>New Short URL Created, ${userName}!</h1>
//             <p>You've just created a new short URL:</p>
//             <ul>
//                 <li>Original URL: ${originalUrl}</li>
//                 <li>Short URL: ${shortUrl}</li>
//             </ul>
//             <p>Start sharing your link!</p>
//         </body>
//         </html>
//       `,
//     });

//     // Send the email
//     $app.newMailClient().send(message);
//     console.log(`URL creation email sent to ${userEmail}`);
//   } catch (error) {
//     console.error("Failed to send URL creation email:", error);
//   }
// }, "urls");
