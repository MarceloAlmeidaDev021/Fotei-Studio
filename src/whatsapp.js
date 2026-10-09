const whatsappNumber = "5511958766351";
function whatsappMessageUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
export { whatsappMessageUrl };
