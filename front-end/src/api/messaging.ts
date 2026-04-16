import axios from "axios";

const API_URL = "/api/messaging";

// Create group chat
export const createGroupChat = async (token: string, name: string, members: string[]) => {
  const response = await axios.post(
    `${API_URL}/my_groupchats/`,
    { name, members },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Fetch group chats
export const fetchGroupChats = async (token: string) => {
  const response = await axios.get(`${API_URL}/my_groupchats/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Create direct message
export const createDirectMessage = async (token: string, username: string) => {
  const response = await axios.post(
    `${API_URL}/my_directmessages/`,
    { username }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Fetch direct messages
export const fetchDirectMessages = async (token: string) => {
  const response = await axios.get(`${API_URL}/my_directmessages/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Add new friend
export const addNewFriend = async (token: string, username: string) => {
  const response = await axios.post(
    `${API_URL}/my_friends/`,
    { username }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const removeFriend = async (token: string, username: string) => {
  const response = await axios.delete(`${API_URL}/my_friends/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: { username }, 
  });

  return response.data;
};

// Fetch the user's friends
export const fetchFriends = async (token: string) => {
  const response = await axios.get(`${API_URL}/my_friends/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch messages of a specific DM/group chat
export const fetchGroupMessages = async (token: string, groupChatId: string) => {
  const response = await axios.get(`${API_URL}/${groupChatId}/messages/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Add user to an existing group chat
export const addUserToGroupChat = async (
  token: string,
  groupChatId: string,
  username: string
) => {
  const response = await axios.post(
    `${API_URL}/groupchats/${groupChatId}/add_user/`,
    { username },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const leaveGroupChat = async (token: string, publicId: string) => {
  const response = await axios.delete(
    `${API_URL}/my_groupchats/${publicId}/leave/`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
