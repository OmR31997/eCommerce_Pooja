import mongoose from "mongoose";
import { Order } from "../src/order/order.model.js";
import { FindOrderFail_H } from "./helper.js"
// GLOBAL CHAT STATE
const chatState = {}; // { userId: { lastIntent: "ask_order" } }

export const ChatBotReply_H = async (id = null, message = "", name = "", role = "user") => {

  // Ensure memory per user
  if (!chatState[id]) {
    chatState[id] = { lastIntent: null };
  }

  const state = chatState[id];

  if (!message || typeof message !== "string") {
    return {
      text: "I didn't get that. Please type again",
      lang: "en"
    }
  }

  const text = message.trim();
  const msgLower = text.toLowerCase();

  const isHindi = /[\u0900-\u097F]/.test(text);

  // LANGUAGE PACK
  const L = isHindi
    ? {
      greet: `नमस्ते ${name}! मैं आपकी कैसे मदद कर सकता हूँ?`,
      fallback: `मुझे थोड़ा और विवरण चाहिए ${name}.`,

      askOrder: `ज़रूर! कृपया अपना Order ID भेजें।`,
      processingOrder: (id) => `ठीक है! आपका Order ID **${id}** प्राप्त हो गया है।`,
      orderStatus: (id) =>
        `आपके ऑर्डर **${id}** की स्थिति: 'In Transit'.\nडिलीवरी जल्द ही प्राप्त हो जायेगी 😊`,

      returnHelp: "कोई बात नहीं, कृपया अपना Return ID भेजें।",
      processedReturn: (id) => `आपके Return ID **${id}** के लिए रिक्वेस्ट दर्ज हो गई है।`,

      refund: "रिफंड सामान्यत: 2-5 दिन में मिल जाता है।",
      delay: "क्षमा करें! कृपया Order ID भेजें, मैं तुरंत जाँच करता हूं।",
      paymentInIssue: "अगर भुगतान कट गया है, तो 24 Hrs के अंदर अपडेट हो जाएगा।",
      vendorRegister: "आप यहाँ Seller अकाउंट बना सकते हैं: /seller/register",

      // Vendor
      vendorQ: `कृपया अपना Vendor ID भेजें ${name}.`,
      vendorConfirm: (id) => `Vendor ID **${id}** की पुष्टि हो गई है।`,

      stockIssue: "कृपया अपने प्रोडक्ट या स्टॉक से जुड़ी समस्या बताएं।",
      payoutIssue: "आपका पेआउट 24–48 घंटों में प्रोसेस हो जाता है।",
      kycIssue: "कृपया आवश्यक KYC दस्तावेज़ अपलोड करें।",
      addProduct: "आप यहाँ प्रोडक्ट जोड़ सकते हैं: /seller/products/add",
      vendorDocs: "ज़रूरी दस्तावेज़: GST, PAN, Aadhaar, Bank Details.",
      vendorRTO: "RTO या रिटर्न समस्या के लिए: /seller/returns",
    }
    : {
      greet: `Hello ${name}! How can I assist you today?`,
      fallback: `Please provide more details ${name}.`,

      askOrder: `Sure! Please share your Order ID.`,
      processingOrder: (id) => `Nice! I received Order ID **${id}**.`,
      orderStatus: (id) =>
        `Status for Order **${id}**: In Transit.\nExpected delivery very soon.`,

      returnHelp: "No worries, please share your Return ID.",
      processedReturn: (id) => `Return request for ID **${id}** submitted.`,

      refund: "Refund usually takes 2–5 business days.",
      delay: "Sorry for the delay! Please provide your Order ID.",
      paymentInIssue: "If payment was deducted, the update appears within 10–15 minutes.",
      vendorRegister: "Register as a seller here: /vendor/register",

      // Vendor
      vendorQ: `Please share your Vendor ID ${name}.`,
      vendorConfirm: (id) => `Vendor ID **${id}** verified.`,

      stockIssue: "Please describe your stock or product issue.",
      payoutIssue: "Your payout usually processes within 24–48 hours.",
      kycIssue: "Please upload the required KYC documents.",
      addProduct: "Add product here: /seller/products/add",
      vendorDocs: "Required Docs: GST, PAN, Aadhaar, Bank details.",
      vendorRTO: "For RTO issues: /seller/returns",
    }

  // Menu
  const menuText = (role === "user")
    ? "📌 *Customer Menu*\n" +
    "1 | Track Order\n" +
    "2 | Return / Replacement\n" +
    "3 | Refund Status\n" +
    "4 | Payment Issue\n" +
    "5 | Damaged Product\n" +
    "6 | Delivery Delay\n"

    : (role === "vendor")
      ? "📌 *Vendor Menu*\n" +
      "1 | Verify Vendor ID\n" +
      "2 | Add Product\n" +
      "3 | Stock Issue\n" +
      "4 | Payout Update\n" +
      "5 | KYC / Documents\n" +
      "6 | RTO / Returns"

      : "📌 *Menu*\n" +
      "1 | Track Order\n" +
      "2 | Return / Refund help\n" +
      "3 | Vendor Registration\n" +
      "4 | Customer Support";

  // MULTI-STEP INTENT PROCESSOR
  if (state.lastIntent === "await_order_id") {
    state.lastIntent = null;
    const _id = text;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return {
        success: false,
        reply: {
          text: isHindi
            ? `कृपया वैध Order ID भेजें। यह सही Mongo ID नहीं है।`
            : `Please enter a valid Order ID. This is not a valid Mongo ObjectId.`,
          lang: isHindi ? "hi" : "en"
        }
      };
    }

    try {
      const order = await Order.findOne({ _id }).select('status items totalAmount createdAt');

      if (!order) {
        return {
          success: false,
          reply: {
            text: isHindi
              ? `क्षमा करें! Order ID **${_id}** नहीं मिला।`
              : `Sorry! Order ID **${_id}** not found.`,
            lang: isHindi ? "hi" : "en"
          }
        }
      }

      return {
        success: true,
        reply: {
          text: isHindi
            ? `ऑर्डर **${_id}** मिला!\n\nस्थिति: ${order.status}\nकुल राशि: ₹${order.totalAmount}\nदिनांक: ${order.createdAt}`
            : `Order **${_id}** found!\n\nStatus: ${order.status}\nTotal: ₹${order.totalAmount}\nDate: ${order.createdAt}`,
          lang: isHindi ? "hi" : "en"
        }
      }
    } catch (error) {
      return {
        success: false,
        text: isHindi
          ? "Server error! कृपया बाद में प्रयास करें।"
          : "Server error! Please try again later.",
        lang: isHindi ? "hi" : "en",
      };
    }
  }

  if (state.lastIntent === "await_return_id") {
    state.lastIntent = null;
    return {
      success: true,
      reply: {
        text: L.processedReturn(text),
        lang: isHindi ? "hi" : "en"
      }
    }
  }

  if (state.lastIntent === "await_vendor_id") {
    state.lastIntent = null;

    return {
      success: true,
      reply: {
        text: L.vendorConfirm(text),
        lang: isHindi ? "hi" : "en"
      }
    }
  }

  // INTENT DETECTOR
  const detectIntent = (msg) => {
    const m = msg.toLowerCase();
    if (/menu|options/.test(m)) return "menu";

    // User
    if (/hello|hi|hey|नमस्ते/.test(m)) return "greet";
    if (/track|status|where/.test(m)) return "track_order";
    if (/refund/.test(m)) return "refund";
    if (/return|replace/.test(m)) return "return";
    if (/delay|late/.test(m)) return "delay";
    if (/payment|failed|deducted/.test(m)) return "payment";
    if (/broken|damage|wrong|missing/.test(m)) return "damaged";

    // Vendor/Seller
    if (/vendor|seller|id verify/.test(m)) return "vendor_verify";
    if (/stock|product|item/.test(m)) return "stock_issue";
    if (/listing|add product/.test(m)) return "add_product";
    if (/payout|commission|settle/.test(m)) return "payout";
    if (/gst|pan|document/.test(m)) return "docs";
    if (/rto|return issue/.test(m)) return "rto";
    if (/kyc|verify|account/.test(m)) return "kyc";

    return "fallback";
  }

  const intent = detectIntent(msgLower);

  // SWITCH CASE – HANDLER

  let reply = "";

  switch (intent) {
    case "greet":
      reply = L.greet;
      break;

    case "menu":
      reply = menuText
      break;

    case "track_order":
      state.lastIntent = "await_order_id";
      reply = L.askOrder;
      break;

    case "refund":
      state.lastIntent = "await_order_id";
      reply = L.refund;
      break;

    case "return":
      state.lastIntent = "await_return_id";
      reply = L.returnHelp;
      break;

    case "delay":
      reply = L.delay;
      break;

    case "payment":
      reply = L.paymentInIssue;
      break;

    // Vendor role
    case "vendor_verify":
      if (role === "vendor") {
        state.lastIntent = "await_vendor_id";
        reply = L.vendorQ;
      } else {
        reply = L.fallback;
      }
      break;

    case "stock_issue":
      reply = L.stockIssue;
      break;

    case "add_product":
      reply = L.addProduct;
      break;

    case "payout":
      reply = L.payoutIssue;
      break;

    case "docs":
      reply = L.vendorDocs;
      break;

    case "rto":
      reply = L.vendorRTO;
      break;

    case "kyc":
      reply = L.kycIssue;
      break;

    default:
      reply = L.fallback;
  }

  return {
    success: true,
    reply: {
      text: reply,
      lang: isHindi ? "hi" : "en"
    }
  }
}