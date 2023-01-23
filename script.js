let userName = ''
const services = {
    endpoints: { status: "status", messages: "messages", participants: "participants" },
    createMessageBody: function createMessageBody(userName, message, userToSend, messageType) {
        return {
            from: `${userName}`,
            to: `${userToSend}`,
            text: `${message}`,
            type: `${messageType}`
        }
    },
    joinParticipant: async function joinParticipant(name) {
        return await this.post(this.endpoints.participants, { name })
    },
    updateStatus: async function updateStatus(name) {
        return await this.post(this.endpoints.status, { name })
    },
    getMessages: function getMessages() {
        if (this.oldAbortController === undefined) {
            this.oldAbortController = new AbortController();
        }
        if (this.oldAbortController.signal.aborted === true) {
            this.oldAbortController = new AbortController();
        } else {
            this.oldAbortController.abort();
            this.oldAbortController = new AbortController();
        }
        return this.get(this.endpoints.messages, this.oldAbortController.signal)
    },
    getParticipants: async function getParticipants() {
        return await this.get(this.endpoints.participants);
    },
    sendMessage: async function sendMessage(userName, message, userToSend = "Todos", messageType = "message") {
        await this.post(this.endpoints.messages, this.createMessageBody(userName, message, userToSend, messageType))
    },
    get: async function get(endpoint, signal) {
        const options = { method: "GET", signal };
        let request = new Request(`https://mock-api.driven.com.br/api/v6/uol/${endpoint}`, options);
        return await this.makeRequest(request);
    },
    post: async function post(endpoint, body) {
        const options = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }
        let request = new Request(`https://mock-api.driven.com.br/api/v6/uol/${endpoint}`, options);
        return await this.makeRequest(request);
    },
    makeRequest: async function makeRequest(request) {
        const response = await fetch(request);
        return response;
    },
}


const controller = {
    mountChatPage: function mountChatPage() {
        document.body.innerHTML = `
        <div id="chat-page-container">

        <header>
            <img src="./imgs/logo.svg" alt="logo">
            <ion-icon name="people" onclick='openModal();'></ion-icon>
        </header>
        <main>
        </main>
        <footer>
            <form onsubmit="sendFormMessage(event)" action="post">
                <input onfocus="togglePrivateMessage(event)" autocomplete="off" type="text" min='3' placeholder="Escreva aqui..." name="message">
                <button type="submit"><ion-icon  name="paper-plane-outline"></ion-icon></button>
            </form>
        </footer>


        <div id="modal-container" class='modal-container hide-modal'>
            <span onclick='closeModal();' class="modal-left-side"></span>
            <aside>
            </aside>
        </div>
    </div>`
    },

}