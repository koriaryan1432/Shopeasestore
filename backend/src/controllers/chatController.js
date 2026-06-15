const pool = require('../config/db');

exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Fetch catalog products to give live context to the LLM
    const [products] = await pool.query(
      `SELECT p.id, p.name, p.price, p.description, c.name AS category_name, p.image_url
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id`
    );

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback: Smart Mock responses using database products context
      console.log('Gemini API key not configured. Using intelligent database simulator.');
      const responseText = getSimulatedAIResponse(message, products);
      return res.json({ text: responseText, source: 'simulator' });
    }

    // Call live Gemini 1.5 Flash API
    const systemPrompt = `You are ShopEase Luxury Concierge, an elite, sophisticated digital assistant and stylist for ShopEase luxury ecommerce store. Your tone is warm, polite, editorial, and highly professional (resembling an assistant at a high-end designer showroom).
Here is the current catalog database of products available on our store:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, description: p.description, category: p.category_name })))}

Help the user find products, answer general queries about the store, or recommend items based on their request.
If you recommend any products, you MUST refer to them by their exact Name and mention their price (in Rupees ₹).
Be concise and elegant. Do not use plain markdown lists unless necessary. Maintain a beautiful editorial formatting style.`;

    const chatHistory = history || [];
    const contents = chatHistory.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', errBody);
      // Fallback to simulator on API error
      const responseText = getSimulatedAIResponse(message, products);
      return res.json({ text: responseText, source: 'simulator-fallback' });
    }

    const data = await response.json();
    let text = 'I apologize, but I could not formulate a response at this moment.';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      text = data.candidates[0].content.parts[0].text;
    }

    res.json({ text, source: 'live-llm' });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

function getSimulatedAIResponse(message, products) {
  const query = message.toLowerCase();
  
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return `Welcome to the ShopEase Luxury Gallery. I am your personal digital stylist.

How may I assist you today? I can guide you through our curated collections, recommend products, or help you track an order.`;
  }

  if (query.includes('cart') || query.includes('add')) {
    return `To manage your cart, you can click on the Cart icon in the top navigation panel or directly interact with the product gallery. If you see an item you like, click "Explore" to view details and add it to your order.`;
  }

  if (query.includes('order') || query.includes('track')) {
    return `To review your active orders, please navigate to the Orders section in the top navigation bar. If your account is not verified, please complete verification to view detailed logistics status.`;
  }

  // Filter recommendations based on keyword search
  let matched = [];
  if (query.includes('premium') || query.includes('best') || query.includes('recommend') || query.includes('suggest')) {
    matched = products.slice(0, 2);
  } else {
    matched = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category_name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    ).slice(0, 3);
  }

  if (matched.length > 0) {
    let recommendations = `I have selected the following exceptional items matching your request:\n\n`;
    matched.forEach(p => {
      recommendations += `* **${p.name}** (${p.category_name}) — ₹${Number(p.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n  *${p.description}*\n\n`;
    });
    recommendations += `You can view and secure these selections by searching for them in our catalog.`;
    return recommendations;
  }

  return `I have scanned our curated catalog. Could you specify if you are looking for products from our categories? Or please share your preferred style parameters, and I will be delighted to guide you.`;
}
