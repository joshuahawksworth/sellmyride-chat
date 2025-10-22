<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
    * Get all messages for a conversation
    */
    public function index(Request $request, Conversation $conversation)
    {
        // user is participant
        if (!$conversation->hasParticipant($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('user:id,name,email')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
    * Send a new message
    */
    public function store(Request $request, Conversation $conversation)
    {
        // user is participant
        if (!$conversation->hasParticipant($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        $message->load('user:id,name,email');

        // vroadcast the message
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }
}