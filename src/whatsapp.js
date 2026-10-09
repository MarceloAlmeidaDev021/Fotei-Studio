const whatsappNumber = "5511958766351";
const whatsappConversationUrl = `https://wa.me/${whatsappNumber}`;
function whatsappMessageUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
export { whatsappMessageUrl, whatsappConversationUrl };
