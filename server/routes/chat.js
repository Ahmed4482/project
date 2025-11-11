import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Groq API configuration - FIXED ENDPOINT URL
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are SmartFit AI, a friendly wellness coach helping users with fitness goals and platform support. 
You provide expert guidance on workouts, nutrition, recovery, and general fitness advice while maintaining a supportive and encouraging tone. 
Keep responses concise, practical, and focused on scientific evidence-based fitness principles.
Focus on providing actionable advice and maintain a motivating, supportive tone.
When discussing exercises, include form tips and safety precautions.
For nutrition advice, emphasize balanced, sustainable approaches over fad diets.`;

// Helper function to call Groq API with better error handling and logging
async function getGroqResponse(userMessage, conversationHistory = []) {
  try {
    // Build messages array with conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add recent conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 GROQ API REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Endpoint:', GROQ_API_URL);
    console.log('🤖 Model: llama-3.1-8b-instant');
    console.log('💬 Messages Count:', messages.length);
    console.log('📝 User Message:', userMessage);
    console.log('🔑 API Key:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 15)}...` : '❌ MISSING');

    const requestBody = {
      model: 'llama-3.1-8b-instant',  // Fast and reliable model
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024
    };

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 GROQ API RESPONSE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Status Code:', response.status, response.ok ? '✅' : '❌');
    
    if (!response.ok) {
      console.error('❌ ERROR Response Body:', responseText);
      throw new Error(`Groq API error (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const aiMessage = data.choices[0]?.message?.content;
    
    console.log('✅ Success! AI Response Length:', aiMessage?.length || 0, 'characters');
    console.log('💡 AI Response Preview:', aiMessage?.substring(0, 100) + '...');
    console.log('⚡ Tokens Used:', data.usage?.total_tokens || 'N/A');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return aiMessage;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ GROQ API ERROR');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    throw error;
  }
}

// Fallback responses if API fails
const fallbackResponses = [
  "That's a great fitness goal! I recommend starting with 3 sessions per week and gradually increasing intensity.",
  "Remember to stay hydrated during your workouts! Aim for at least 2 liters of water daily, more if you're training intensely.",
  "Progressive overload is key to building muscle. Try increasing the weight by 5-10% each week or adding 1-2 reps.",
  "Rest days are just as important as training days. Your muscles grow during recovery, so don't skip rest!",
  "A balanced diet with adequate protein is crucial for muscle recovery. Aim for 1.6-2.2g protein per kg of body weight.",
  "Focus on compound movements like squats, deadlifts, and bench presses for maximum muscle engagement and results.",
  "HIIT training can boost your metabolism for hours after your workout. Great for fat loss and cardiovascular health!",
  "Consistency beats intensity. Show up regularly, even if some days are lighter, and results will follow.",
  "Don't forget to warm up before your workout (5-10 mins) to prevent injuries and improve performance.",
  "Track your progress with metrics like weight, strength gains, body measurements, and progress photos for motivation!"
];

// GET /api/chat - Get user's chat history
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📖 Fetching chat history for user:', req.user.id);
    
    const chatCollection = req.db.collection('chat_messages');
    const messages = await chatCollection
      .find({ user_id: new ObjectId(req.user.id) })
      .sort({ created_at: 1 })
      .toArray();

    console.log('✅ Retrieved', messages.length, 'messages');

    if (!messages.length) {
      return res.json([]);
    }

    res.json(messages.map(msg => ({
      id: msg._id,
      user_id: msg.user_id,
      message: msg.message,
      is_ai: msg.is_ai,
      created_at: msg.created_at
    })));
  } catch (error) {
    console.error('❌ Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// POST /api/chat/message - Send a message and get AI response
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    console.log('\n🆕 NEW MESSAGE REQUEST');
    console.log('👤 User ID:', req.user.id);
    console.log('💬 Message:', message);

    if (!message || !message.trim()) {
      console.log('❌ Empty message rejected');
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const chatCollection = req.db.collection('chat_messages');
    const userId = new ObjectId(req.user.id);

    // Save user message to database
    console.log('💾 Saving user message to database...');
    await chatCollection.insertOne({
      user_id: userId,
      message: message.trim(),
      is_ai: false,
      created_at: new Date()
    });
    console.log('✅ User message saved');

    // Get recent conversation history for context
    console.log('📚 Fetching conversation history for context...');
    const recentMessages = await chatCollection
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(20) // Last 20 messages (10 exchanges)
      .toArray();

    console.log('📝 Found', recentMessages.length, 'recent messages for context');

    // Convert to format Groq expects
    const conversationHistory = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.is_ai ? 'assistant' : 'user',
        content: msg.message
      }))
      .slice(0, -1); // Remove the last one (current message we just added)

    let aiResponse;
    let usedFallback = false;
    
    try {
      console.log('🤖 Calling Groq API...');
      aiResponse = await getGroqResponse(message, conversationHistory);
      console.log('✅ Groq API call successful!');
    } catch (error) {
      console.error('⚠️  Groq API failed, using fallback response');
      console.error('Error details:', error.message);
      usedFallback = true;
      aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      console.log('🔄 Fallback response selected:', aiResponse.substring(0, 50) + '...');
    }

    // Save AI response to database
    console.log('💾 Saving AI response to database...');
    await chatCollection.insertOne({
      user_id: userId,
      message: aiResponse,
      is_ai: true,
      created_at: new Date()
    });
    console.log('✅ AI response saved');

    // Get the last 2 messages to return
    const messages = await chatCollection
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(2)
      .toArray();

    console.log('📤 Sending response to client');
    console.log('🔄 Used Fallback:', usedFallback ? '⚠️  YES' : '✅ NO (API worked)');

    res.json({
      message: 'Message sent successfully',
      usedFallback, // For debugging
      messages: messages.reverse().map(msg => ({
        id: msg._id,
        message: msg.message,
        is_ai: msg.is_ai,
        created_at: msg.created_at
      }))
    });

    console.log('✅ Request completed successfully\n');
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ SEND MESSAGE ERROR');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/chat/clear - Clear user's chat history
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    console.log('🗑️  Clearing chat history for user:', req.user.id);
    
    const chatCollection = req.db.collection('chat_messages');
    const userId = new ObjectId(req.user.id);
    
    const result = await chatCollection.deleteMany({ user_id: userId });
    
    console.log('✅ Deleted', result.deletedCount, 'messages');

    res.json({
      success: true,
      message: 'Chat history cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

export default router;