// types.ts

// Friend type for friends lists and online friends
export interface Friend {
    id: number;
    username: string;
    online: boolean;
  }
  
  // GroupChat type for DMs and Group Chats
  export interface GroupChat {
    id: number;
    public_id: string;
    name: string;
    users?: string[];
    unseen_count?: number;
    last_message?: string;
    last_message_timestamp?: string | null;
    last_message_sender?: string;
  }