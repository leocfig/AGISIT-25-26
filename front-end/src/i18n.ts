import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { leaveGroupChat } from './api/messaging';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        header: {
          title: "Messaging",
        },
        login: {
          title: "Sign in to your account",
          success: "Successful login!",
          error: "Unable to log in. Invalid username or password."
        },
        register: {
          success: "User registered successfully!",
          error: "Unable to register user. Please check the fields.",
          title: "Create your account",
          email: "Email address",
          username: "Username",
          password: "Password",
          password2: "Confirm password",
          submit: "Register",
          alreadyAccount: "Already have an account?",
          loginHere: "Log in here!"
        },
        form: {
          username: "Username",
          password: "Password",
          forgotPassword: "Forgot password?",
          forgotPasswordNotImplemented: "⚠️ Forgot password is not implemented yet!",
          signIn: "Sign in",
          noAccount: "Don't have an account?",
          createHere: "Create here!"
        },
        friends: {
          addFriendTooltip: "Add New Friend",
          addFriendButton: "Add friend",
          addFriendPlaceholder:"Enter friend's username...",
          success: "{{name}} successfully added as friend!",
          deleteFriendTooltip: "Delete {{name}}"
        },
        selectMessages: {
          welcome: "Welcome back",
          searchPlaceholder: "Search",
          title: "Messages",
          listDirectMessages: "Direct Messages",
          listGroupsChat: "Group Chats",
          newDirectButton: "+ New Direct Message",
          newGroupButton: "+ New Group Chat",
          noMessages: "No messages yet",
          listFriends: "Friends",
          onlineFriends: "Online Friends",
          noFriends: "You don't have friends yet",
          dmTooltip: "Message {{name}}"
        },
        directMessages: {
          emptyFriendsList: "No friends yet",
          chooseFriend: "Choose a Friend",
          friendSelect: "Select",
          friendSelected: "Selected",
          newDirectMessage: "Create direct message",
        },
        groupChat: {
          createTitle: "New Group Chat",
          namePlaceholder: "New group name...",
          select: "Select",
          selected: "Selected",
          createButton: "Create",
          title: "Group Chat: {{roomName}}",
          placeholder: "Type a message...",
          sendButton: "Send",
          addToGroup: "Add friend",
          unknownUser: "Unknown user",
          leaveGroupChat:"Leave Group Chat",
          leaveChat:"Leave Chat"

        },
        time: {
          yesterday: "Yesterday"
        }
      }
    },
    pt: {
      translation: {
        header: {
          title: "Nome da App",
        },
        login: {
          title: "Entre na sua conta",
          success: "Login realizado com sucesso!",
          error: "Não foi possível entrar. Username ou password inválidos."
        },
        register: {
          success: "Utilizador registado com sucesso!",
          error: "Não foi possível registar o utilizador. Verifique os campos.",
          title: "Crie a sua conta",
          email: "Endereço de email",
          username: "Nome de usuário",
          password: "Senha",
          password2: "Confirme a senha",
          submit: "Registar",
          alreadyAccount: "Já tem uma conta?",
          loginHere: "Entre aqui!"
        },
        form: {
          username: "Nome de usuário",
          password: "Senha",
          forgotPassword: "Esqueceu a senha?",
          forgotPasswordNotImplemented: "⚠️ Recuperação de senha ainda não está implementada!",
          signIn: "Entrar",
          noAccount: "Não tem uma conta?",
          createHere: "Crie aqui!"
        },
        friends: {
          addFriendTooltip: "Adicionar novo amigo",
          addFriendButton: "Adicionar amigo",
          addFriendPlaceholder:"Usarname do amigo...",
          success: "{{name}} adicionado com sucesso como amigo!",
          deleteFriendTooltip: "Remover {{name}}"
        },
        selectMessages: {
          welcome: "Bem vindo de volta",
          searchPlaceholder: "Pesquise",
          title: "Mensagens",
          listDirectMessages: "Mensagens diretas",
          listGroupsChat: "Group Chats",
          newDirectButton: "+ Nova mensagem direta",
          newGroupButton: "+ Novo Group Chat",
          noMessages: "Ainda sem mensagens",
          listFriends: "Amigos",
          onlineFriends: "Amigos Online",
          noFriends: "Ainda sem amigos",
          dmTooltip: "Enviar mensagem para {{name}}"
        },
        directMessages: {
          emptyFriendsList: "Ainda sem amigos",
          chooseFriend: "Seleciona um amigo",
          friendSelect: "Selecionar",
          friendSelected: "Selecionado",
          newDirectMessage: "Criar mensagem direta",
        },
        groupChat: {
          createTitle: "Novo group chat",
          namePlaceholder: "Nome do grupo...",
          select: "Selecionar",
          selected: "Selecionado",
          createButton: "Criar",
          title: "Group Chat: {{roomName}}",
          placeholder: "Escreva uma mensagem...",
          sendButton: "Enviar",
          addToGroup: "Adicionar amigo",
          leaveGroupChat:"Sair do Group Chat",
          leaveChat:"Sair do Chat"
        },
        time: {
          yesterday: "Ontem"
        }
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
