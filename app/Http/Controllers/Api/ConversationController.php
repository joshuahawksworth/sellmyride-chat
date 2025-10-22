<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /**
    * Get all conversations for the authenticated user
    */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne:id,name,email', 'userTwo:id,name,email', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->get()
            ->map(function ($conversation) use ($userId) {
                $otherUser = $conversation->getOtherUser($userId);
                return [
                    'id' => $conversation->id,
                    'other_user' => $otherUser,
                    'last_message' => $conversation->messages->first(),
                    'updated_at' => $conversation->updated_at,
                ];
            });

        return response()->json($conversations);
    }

    /**
    * Start or get existing conversation with another user
    */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user()->id;
        $otherUserId = $request->user_id;

        // don't allow conversation with self
        if ($userId == $otherUserId) {
            return response()->json(['message' => 'Cannot create conversation with yourself'], 400);
        }

        // check if conversation already exists (in either direction)
        $conversation = Conversation::where(function ($query) use ($userId, $otherUserId) {
            $query->where('user_one_id', $userId)->where('user_two_id', $otherUserId);
        })->orWhere(function ($query) use ($userId, $otherUserId) {
            $query->where('user_one_id', $otherUserId)->where('user_two_id', $userId);
        })->first();

        // new conversation if it doesn't exist
        if (!$conversation) {
            $conversation = Conversation::create([
                'user_one_id' => $userId,
                'user_two_id' => $otherUserId,
            ]);
        }

        $conversation->load(['userOne:id,name,email', 'userTwo:id,name,email']);

        return response()->json($conversation, 201);
    }

    /**
    * Get a specific conversation
    */
    public function show(Request $request, Conversation $conversation)
    {
        // user is participant
        if (!$conversation->hasParticipant($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->load(['userOne:id,name,email', 'userTwo:id,name,email']);

        return response()->json($conversation);
    }
}