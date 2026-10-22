import contactImage from "@/assets/lifeos-contact-team.jpg";
import joinImage from "@/assets/lifeos-join-team.jpg";

const faq = (title: string, groups: [string, string][]) => `<section class="section triangle2 lifeos-support" id="profile"><div class="container"><h2 class="h-bold text-center mb-3">${title}</h2><div class="panel-group">${groups.map(([q, a], i) => `<details class="lifeos-faq" ${i === 0 ? "open" : ""}><summary>${q}</summary><div class="panel-body"><p>${a}</p></div></details>`).join("")}</div></div></section>`;

export function supportPresentation(page: string, html: string): string {
  if (page === "business-center") return html
    .replace('id="businesscenter"', 'id="businesscenter" class="lifeos-business-centers"')
    .replace('<div class="row">', '<p class="lifeos-center-intro text-center">Connect with Life OS across Bangladesh. Contact our team to confirm location details before your visit.</p><div class="row lifeos-center-grid">')
    .replace(/<p><b>Tel: <\/b>\+880 \(to be updated\)<\/p>/g, '')
    .replace(/<p><b>Contact Person:<\/b>[\s\S]*?<\/p>/g, '<p>For local contact details, <a href="/contact">contact the Life OS team</a>.</p>')
    .replace(/(<p><b>Email:<\/b> )([^<\s]+)(<\/p>)/g, '$1<a href="mailto:$2">$2</a>$3');
  if (page === "faq-general") return faq("FAQ — General", [
    ["What is Life OS?", "Life OS brings digital identity and everyday services together in one connected platform for Bangladesh. Explore the Services menu to learn about each offering."],
    ["How can I get started?", "Visit <a href='/join-us'>Join Us</a> to share your interest, or contact the Life OS team for guidance on registration and available services."],
    ["Where can I sign in?", "Use the Login link in the navigation. If you cannot access your account, contact support using your registered email address."],
    ["What should I do if I forget my password?", "Use the password recovery option provided by your account service. Never share your password, PIN or one-time verification code with anyone."],
    ["How do I update my personal details?", "Check your account profile for available settings. If an update requires help, contact support and describe the change. Only provide identity documents through a verified, secure channel."],
    ["Can I browse Life OS on my phone?", "You can browse this website on a phone, tablet or computer. Service requirements and availability may vary by provider."],
    ["How can I report an issue?", "Send the service name, order or reference number, and a brief description to <a href='mailto:info@lifeosbd.com'>info@lifeosbd.com</a>. Do not include passwords, payment card details or verification codes."],
    ["How can I explore a partnership?", "Visit <a href='/business-collaboration'>Business Collaboration</a> or contact the team to discuss your organisation and area of interest."]
  ]);
  if (page === "faq-product") return faq("FAQ — Services", [
    ["Which services can I explore?", "Life OS covers finance, payments, health, education, careers, travel, shopping and other everyday needs. Visit the Services menu for individual service details."],
    ["What is Life ID?", "Life ID is the digital identity at the centre of the Life OS service experience. Verification requirements depend on the service and its provider."],
    ["Are all services available in every location?", "Availability depends on your location and the participating provider. Confirm coverage, eligibility and any fees before placing an order or making a booking."],
    ["Where can I find fees and terms?", "Review the relevant provider's price, conditions and confirmation details before you pay. Contact support if anything is unclear."],
    ["How can I get help with a booking or payment?", "Keep your confirmation or transaction reference and contact the relevant service provider or the Life OS support team."],
    ["Can telemedicine replace emergency care?", "No. If you face a medical emergency, contact local emergency services or seek urgent in-person care. Online consultations are not a substitute for emergency treatment."],
    ["How can I share service feedback?", "Email <a href='mailto:info@lifeosbd.com'>info@lifeosbd.com</a> with the service name and your feedback. Avoid including sensitive personal information."]
  ]);
  if (page === "faq-return-goods") return faq("FAQ — Returns & Refunds", [
    ["How do I report damaged or incorrect goods?", "Contact support with your order number, a description of the issue and clear photographs of the item and packaging. Keep the goods and packaging until you receive instructions."],
    ["How do I request a return or refund?", "Send your request to <a href='mailto:info@lifeosbd.com'>info@lifeosbd.com</a> or contact the provider listed on your order. Eligibility depends on the applicable provider policy and the type of goods or service."],
    ["What information should I provide?", "Include your name, order reference, purchase date and reason for the request. Do not send payment PINs, passwords or full card details."],
    ["Should I send the item back immediately?", "Wait for return instructions and a confirmed return address. Keep any dispatch receipt and tracking number."],
    ["When will I receive a refund?", "The team will confirm the outcome and expected processing time after reviewing your request. Payment processing times vary by provider and payment method."],
    ["Do the same rules apply to bookings and digital services?", "No. Cancellation and refund terms can differ for appointments, tickets, digital services and physical goods. Review the terms attached to your purchase."],
    ["How can I check my request?", "Reply to the original support conversation and include your order or case reference so the team can locate your request."]
  ]);
  if (page === "contact") return html
    .replace('class="row"', 'class="row lifeos-contact-layout"')
    .replace(/style="margin-top: 50px"/g, 'class="lifeos-contact-section"')
    .replace('src="lifeos-media://events/59" width="90%"', `src="${contactImage}" width="1200" height="800" class="img-responsive lifeos-support-photo"`)
    .replace('CONNECT', 'Contact Life OS').replace('with us', 'Let’s connect')
    .replace('Give us a call or send us an email if you have any queries.', 'Have a service question or a partnership idea? Our team would be happy to hear from you.')
    .replace('href="mailto:mailto:', 'href="mailto:')
    .replace(/<div>\s*<i class="fa fa-phone">[\s\S]*?<\/div>/, '')
    .replace(/<div>\s*<i class="fa fa-facebook">[\s\S]*?<\/div>/, '')
    .replace(/href="https:\/\/www.google.com\/maps\/place\/[^\"]*" target="_blank"/, '')
    .replace('<div id="sendmessage">Your message has been sent. Thank you!</div>', '')
    .replace(/<input ([^>]*name="(?:name|email)"[^>]*)\/>/g, '<input $1 required=""/>')
    .replace('<textarea class="form-control"', '<textarea required="" aria-label="Your message" class="form-control"')
    .replace('<h2 class="h-bold text-center">Our Branch</h2>', '<h2 class="h-bold text-center">Our Branch</h2>')
    .replace('>Send Message</button>', '>Prepare Email</button>');
  if (page === "join-us") return html
    .replace('<h2 class="h-bold text-center">Join us</h2>', `<h2 class="h-bold text-center">Join Life OS</h2><div class="lifeos-join-intro"><img src="${joinImage}" alt="Life OS community collaboration" width="1200" height="800" class="img-responsive lifeos-support-photo"/><p>Connect with the Life OS community. Share your interest in our services or business opportunities with our team.</p></div>`)
    .replace('Preference Language', 'Preferred Language')
    .replace('<option value="Malay">Malay</option>\n<option value="Mandarin">Mandarin</option>', '<option value="Bangla">Bangla</option>')
    .replace(/<option value="(?:dhaka|chattogram|sylhet|khulna|rajshahi)">[^<]*<\/option>/g, '')
    .replace('name="dob" required="" style="margin-top: 0" type="text"', 'name="dob" required="" style="margin-top: 0" type="date"')
    .replace('id="address2" name="address2" required=""', 'id="address2" name="address2" placeholder="Address line 2 (optional)"')
    .replace('id="phone_code" name="phone_code"', 'id="phone_code" name="phone_code" value="+880" aria-label="Country calling code"')
    .replace('name="mobile"', 'name="mobile" aria-label="Mobile number" inputmode="tel"')
    .replace('>Submit</button>', '>Prepare Enquiry</button>');
  return html;
}