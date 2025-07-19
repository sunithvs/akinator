import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  content: string;
  sender_type: 'user' | 'ai';
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, assigned_user_id, conversation_history } = body;

    if (!message || !assigned_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the assigned user's profile and the current user's Gemini API key
    const [assignedUserResult, currentUserResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, description')
        .eq('user_id', assigned_user_id)
        .single(),
      supabase
        .from('profiles')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single()
    ]);

    if (assignedUserResult.error || !assignedUserResult.data) {
      return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 });
    }

    if (currentUserResult.error || !currentUserResult.data) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const assignedUser = assignedUserResult.data;
    const geminiApiKey = currentUserResult.data.gemini_api_key;

    // Build the conversation context for Gemini
    const conversationContext = (conversation_history as ChatMessage[])
      .map(msg => `${msg.sender_type === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Check if the user is trying to guess the name
    console.log('🔍 DEBUG: Starting name detection...');
    console.log('🔍 DEBUG: Original message:', message);
    console.log('🔍 DEBUG: Assigned user display name:', assignedUser.display_name);

    const messageLower = message.toLowerCase();
    const nameWords = assignedUser.display_name.toLowerCase().split(' ');

    console.log('🔍 DEBUG: Message lowercase:', messageLower);
    console.log('🔍 DEBUG: Name words array:', nameWords);

    // Multiple ways to detect name guessing
    const nameGuessPatterns = [
      // Direct name questions
      messageLower.includes('are you') && nameWords.some((name: string) => messageLower.includes(name)),
      messageLower.includes('is your name') && nameWords.some((name: string) => messageLower.includes(name)),
      messageLower.includes('your name is') && nameWords.some((name: string) => messageLower.includes(name)),
      messageLower.includes('called') && nameWords.some((name: string) => messageLower.includes(name)),

      // Question about name in general
      messageLower.includes('what') && messageLower.includes('name'),
      messageLower.includes('tell me your name'),
      messageLower.includes('what do they call you'),
      messageLower.includes('what should i call you'),

      // Direct name mention (might be a guess)
      nameWords.some((name: string) => name.length > 2 && messageLower.includes(name)) &&
      (messageLower.includes('?') || messageLower.includes('are') || messageLower.includes('is'))
    ];

    const isNameGuess = nameGuessPatterns.some(pattern => pattern);

    if (isNameGuess) {
      console.log('🔍 DEBUG: Name guess detected!');
      console.log('🔍 DEBUG: Message:', message);
      console.log('🔍 DEBUG: Assigned user name:', assignedUser.display_name);
      console.log('🔍 DEBUG: Name words:', assignedUser.display_name.toLowerCase().split(' '));

      // Check if they guessed the correct name
      const guessedCorrectly = assignedUser.display_name.toLowerCase().split(' ').some((namePart: string) =>
        message.toLowerCase().includes(namePart.toLowerCase())
      );

      console.log('🔍 DEBUG: Guessed correctly:', guessedCorrectly);

      if (guessedCorrectly) {
        console.log('🎉 DEBUG: Correct guess! Recording to database...');
        console.log('🎉 DEBUG: Guesser ID:', user.id);
        console.log('🎉 DEBUG: Assigned User ID:', assigned_user_id);
        console.log('🎉 DEBUG: User ID type:', typeof user.id);
        console.log('🎉 DEBUG: Assigned User ID type:', typeof assigned_user_id);

        // Record the successful guess in game_results table
        const insertData = {
          guesser_id: user.id,
          assigned_user_id: assigned_user_id,
        };

        console.log('🎉 DEBUG: Data to insert:', insertData);

        const { data: insertResult, error: gameResultError } = await supabase
          .from('game_results')
          .insert(insertData)
          .select(); // Add select to see what was inserted

        console.log('🎉 DEBUG: Insert result:', insertResult);
        console.log('🎉 DEBUG: Insert error:', gameResultError);

        if (gameResultError) {
          console.error('❌ DEBUG: Error recording game result:', gameResultError);
          console.error('❌ DEBUG: Error code:', gameResultError.code);
          console.error('❌ DEBUG: Error message:', gameResultError.message);
          console.error('❌ DEBUG: Error details:', gameResultError.details);
          console.error('❌ DEBUG: Error hint:', gameResultError.hint);
          // Don't fail the response if we can't record the result
        } else {
          console.log('✅ DEBUG: Game result recorded successfully!');
          console.log('✅ DEBUG: Inserted record:', insertResult);
        }

        return NextResponse.json({
          response: "🎉 Congratulations! You guessed correctly! Well done, detective! 🕵️‍♂️",
          correct_guess: true,
          guessed_user: {
            id: assigned_user_id,
            name: assignedUser.display_name
          }
        });
      } else {
        console.log('❌ DEBUG: Wrong guess');
        const funnyResponses = [
          "Nope, that's not me! Nice try though! 😄",
          "Wrong guess! But I appreciate the effort! 🤔",
          "Haha, not quite! Keep trying! 😊",
          "Nah, you're way off! But don't give up! 🎯",
          "Close, but no cigar! Try again! 🚭",
          "Not even close! But I like your confidence! 😂"
        ];
        const randomResponse = funnyResponses[Math.floor(Math.random() * funnyResponses.length)];

        return NextResponse.json({
          response: randomResponse
        });
      }
    }

    // Create the prompt for Gemini
    const prompt = `You are roleplaying as a person with the following description: "${assignedUser.description}". 

IMPORTANT RULES:
1. NEVER reveal your actual name, even if asked directly about your name
2. If asked about your name, deflect creatively (e.g., "That's for you to figure out!", "I'm keeping that a mystery!", "Guess away!")
3. DO NOT ask questions back to the human - only answer their questions
4. Stay in character based on the description provided
5. Be conversational and friendly
6. Don't reveal that you are an AI
7. Don't mention the description directly

Previous conversation:
${conversationContext}
Current 
human message: ${message}

Respond as this person (but remember: never reveal the name, don't ask questions back):`;

    // Call Gemini API
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      return NextResponse.json({ error: 'No response generated' }, { status: 500 });
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;

    return NextResponse.json({
      response: responseText
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}