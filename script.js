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
    setupController: function setupController() {
        this.chatElement = document.querySelector('#chat-page-container main');
    },mapMessage: function mapMessage(messages) {
        this.messages = messages.map(message => {
            if (message.type === 'status') {
                return `<div class="status set-opacity">
                            <p class="chat-item status">
                            <span>(${message.time})</span>
                            <span>${message.from}</span>
                            para
                            <span>${message.to}: </span>
                            ${message.text}
                            </p>
                        </div>`;
            } else if (message.type === 'private_message') {
                return `<div class="private-message set-opacity">
                            <p class="chat-item">
                            <span>(${message.time})</span>
                            <span>${message.from}</span>
                            para
                            <span>${message.to}: </span>
                            ${message.text}
                            </p>
                        </div>`;
            } else {
                return `<div class="set-opacity">
                    <p class="chat-item">
                    <span>(${message.time})</span>
                    <span>${message.from}</span>
                    para
                    <span>${message.to}: </span>
                    ${message.text}
                    </p>
                </div>`;
            }
        })
    },mapMessage1: function mapMessage1(messages) {
        let fragment = document.createDocumentFragment()
        let newFrag = messages.reduce((acc, message) => {

            let divNode = document.createElement('div');
            let pNode = document.createElement('p');
            pNode.classList.add('chat-item');
            let timeEL = document.createElement('span');
            timeEL.textContent = `(${message.time}) `;
            let fromEL = document.createElement('span');
            fromEL.textContent = `${message.from} `;
            let textEl = document.createTextNode(` para `);
            let toEL = document.createElement('span');
            toEL.textContent = `${message.to}: `;
            let msgEl = document.createTextNode(` ${message.text} `);
            pNode.appendChild(timeEL);
            pNode.appendChild(fromEL);
            pNode.appendChild(textEl);
            pNode.appendChild(toEL);
            pNode.appendChild(msgEl);
            divNode.appendChild(pNode);
            if (message.type === 'private_message' && controller.info.username === message.from) {
                divNode.classList.add('private-message');
                textEl.textContent = ' reservadamente para ';
                fragment.appendChild(divNode);
                return fragment;
            } else if (message.type==='private_message' && message.to!==controller.info.username) {
                divNode.classList.add('hide');
                return fragment;
            }
            else if (message.type==='private_message' && message.to===controller.info.username) {
                divNode.classList.add('private-message');
                textEl.textContent = ' reservadamente para ';
                fragment.appendChild(divNode);
                return fragment;
            }
            else if (message.type === 'status') {
                divNode.classList.add('status');
                fragment.appendChild(divNode);
                return fragment;
            } else {
                fragment.appendChild(divNode);
                return fragment;
            }
        }, fragment);
        return newFrag;
    },
    updateDOM: function updateDOM() {
        this.messages.forEach(element => {
            this.chatElement.innerHTML += element;
        });
    },
    updateDOM1: function updateDOM1(msgs) {
        let messages = document.querySelectorAll('.chat-item');

        let messagearray = [...messages];
        messagearray.map((item, i) => {
            return item = msgs[i];
        });
    },
    scrollToLastElement() {
        const body = document.body;
        const html = document.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);
        window.scrollTo(0, height);
    },
    smoothScrollToLastElement() {
        const body = document.body;
        const html = document.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);
        document.querySelector("main > div:last-child").scrollIntoView({ behavior: "smooth", block: 'end' });
    },
    setUserName: function setUserName(username) {
        this.info.username = username;
    },
    setCheckedPersonItem: function setCheckedPersonItem(checkedPersonItem) {
        this.info.checkedPersonItem = checkedPersonItem;
    },
    setCheckedMessageTypeItem: function setCheckedMessageTypeItem(checkedMessageTypeItem) {
        this.info.checkedMessageTypeItem = checkedMessageTypeItem;
    },
    info: {
        username: '',
        checkedPersonItem: '',
        checkedMessageTypeItem: 'Público'
    },
      
    createParticipantsTemplate: function createParticipantsTemplate(participants) {
        let newFrag = document.createDocumentFragment();
        let h1 = document.createElement('h1');
        h1.innerHTML = "Escolha um contato<br /> para enviar mensagem:";
        let h2 = document.createElement('h2');
        h2.textContent = "Escolha a visibilidade:";
        let div1 = document.createElement('div');
        let div2 = document.createElement('div');
        let div3 = document.createElement('div');
        let ionIcon1 = document.createElement('ion-icon');
        ionIcon1.setAttribute('name', "people");
        let ionIcon2 = document.createElement('ion-icon');
        ionIcon2.setAttribute('name', "checkmark-sharp");
        let ionIcon3 = document.createElement('ion-icon');
        ionIcon3.setAttribute('name', "lock-open");
        let ionIcon4 = document.createElement('ion-icon');
        ionIcon4.setAttribute('name', "checkmark-sharp");
        let ionIcon5 = document.createElement('ion-icon');
        ionIcon5.setAttribute('name', "lock-closed");
        let ionIcon6 = document.createElement('ion-icon');
        ionIcon6.setAttribute('name', "checkmark-sharp");
        let p1 = document.createElement("p");
        p1.textContent = "Todos";
        let p2 = document.createElement("p");
        p2.textContent = "Público";
        let p3 = document.createElement("p");
        p3.textContent = "Reservadamente";
        newFrag.append(h1);
        newFrag.append(div1);
        div1.append(ionIcon1);
        div1.append(p1);
        div1.append(ionIcon2);
        let participantFrags = createParticipantsFragments(participants);
        newFrag.append(participantFrags);
        newFrag.append(h2);
        newFrag.append(div2);
        newFrag.append(div2);
        div2.append(ionIcon3);
        div2.append(p2);
        div2.append(ionIcon4);
        newFrag.append(div3);
        div3.append(ionIcon5);
        div3.append(p3);
        div3.append(ionIcon6);
        if (controller.info.checkedMessageTypeItem === 'Reservadamente') {

            ionIcon6.classList.add('checkedMessageItem');
        } else {
            ionIcon4.classList.add('checkedMessageItem');
        }
        div1.onclick = (event) => { checkPerson(event) };
        div2.onclick = (event) => { checkMessageType(event) };
        div3.onclick = (event) => { checkMessageType(event) };
        return newFrag;
    }

}