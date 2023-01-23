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
        return await this.post(this.endpoints.participants, { name });
    },
    updateStatus: async function updateStatus(name) {
        return await this.post(this.endpoints.status, { name });
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
function openModal() {
    document.querySelector('#modal-container').classList.remove('hide-modal');
}
function closeModal() {
    document.querySelector('#modal-container').classList.add('hide-modal');
    document.querySelector('input[type=text]').focus();
}
const controller = {
    mountChatPage: function mountChatPage() {
        document.body.innerHTML = `
        <div id="chat-page-container">

        <header>
            <img src="./imgs/logo.svg" alt="logo">
            <ion-icon data-test="open-participants" name="people" onclick='openModal();'></ion-icon>
        </header>
        <main>
        </main>
        <footer>
            <form onsubmit="sendFormMessage(event)" action="post">
                <input data-test="input-message" onfocus="togglePrivateMessage(event)" autocomplete="off" type="text" min='3' placeholder="Escreva aqui..." name="message">
                <button data-test="send-message" type="submit"><ion-icon  name="paper-plane-outline"></ion-icon></button>
            </form>
        </footer>


        <div id="modal-container" class='modal-container hide-modal'>
            <span data-test="overlay" onclick='closeModal();' class="modal-left-side"></span>
            <aside>
            </aside>
        </div>
    </div>`
    },
    setupController: function setupController() {
        this.chatElement = document.querySelector('#chat-page-container main');
    },
    mapMessage: function mapMessage(messages) {
        this.messages = messages.map(message => {
            if (message.type === 'status') {
                return `<div data-test="message" class="status set-opacity">
                            <p class="chat-item status">
                            <span>(${message.time})</span>
                            <span>${message.from}</span>
                            para
                            <span>${message.to}: </span>
                            ${message.text}
                            </p>
                        </div>`;
            } else if (message.type === 'private_message') {
                return `<div data-test="message" class="private-message set-opacity">
                            <p class="chat-item">
                            <span>(${message.time})</span>
                            <span>${message.from}</span>
                            para
                            <span>${message.to}: </span>
                            ${message.text}
                            </p>
                        </div>`;
            } else {
                return `<div data-test="message" class="set-opacity">
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
    },
    mapMessage1: function mapMessage1(messages) {
        let fragment = document.createDocumentFragment()
        let newFrag = messages.reduce((acc, message) => {

            let divNode = document.createElement('div');
            divNode.setAttribute("data-test","message")
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
    setCheckedPersonItem: function setUserName(checkedPersonItem) {
        this.info.checkedPersonItem = checkedPersonItem;
    },
    setCheckedMessageTypeItem: function setUserName(checkedMessageTypeItem) {
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
        div1.setAttribute('data-test',"all")
        div1.append(ionIcon2);
        let participantFrags = createParticipantsFragments(participants);
        newFrag.append(participantFrags);
        newFrag.append(h2);
        newFrag.append(div2);
        newFrag.append(div2);
        div2.append(ionIcon3);
        div2.append(p2);
        div2.setAttribute('data-test',"public")
        div3.setAttribute('data-test',"private")

        div2.append(ionIcon4);
        ionIcon4.setAttribute('data-test',"check")
        ionIcon6.setAttribute('data-test',"check")
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
let userName = ''
function createParticipantsFragments(text) {
    let frag = new DocumentFragment();
    for (let item of text) {
        let divEl = document.createElement('div');
        divEl.setAttribute("data-test","participant")
        divEl.classList.add('participants-item');
        divEl.onclick = (event) => { checkPerson(event) };
        let firstIconEL = document.createElement('ion-icon');
        firstIconEL.setAttribute('name', "person-circle");
        let pEL = document.createElement('p');
        pEL.append(item.name.slice(0, 25));
        let secondIconEL = document.createElement('ion-icon');
        secondIconEL.setAttribute('name', "checkmark-sharp");
        secondIconEL.setAttribute('data-test',"check");
        if (item.name === controller.info.checkedPersonItem) {
            secondIconEL.classList.add("checkedPerson");
        }
        divEl.append(firstIconEL);
        divEl.append(pEL);
        divEl.append(secondIconEL);
        frag.append(divEl);
    };
    return frag;
}
function joinChat(e) {
    e.preventDefault();
    userName = e.target.querySelector('input').value;
    document.querySelector('#spinner-container').classList.toggle('hide');
    e.target.classList.toggle("hide");
    services.joinParticipant(userName)
        .then((response) => {
            if (response.ok) {
                controller.setUserName(userName);
                return services.getMessages();
            }
        })
        .then(messages => messages.json())
        .then(actualMessages => {
            document.querySelector('#join-chat-page-container').remove();
            controller.mountChatPage();
            controller.setupController();
            let newMessages = controller.mapMessage1(actualMessages);
            document.querySelector('main').appendChild(newMessages);
            document.querySelector('main > div').classList.add('set-opacity');

            // primera busca de participantes
            let el = document.querySelector('aside');
            services.getParticipants()
                .then(response => response.json())
                .then(participants => {
                    el.appendChild(controller.createParticipantsTemplate(participants));
                    document.querySelector('aside > div > ion-icon:last-child').classList.add('checkedPerson');
                    let publicElement = el.querySelectorAll('div');
                    publicElement[publicElement.length - 2].lastChild.classList.add('checkedMessageType');
                })



            // primera busca de participantes
            document.querySelector('input[type=text]').focus();
            controller.scrollToLastElement();
        })
        .then(() => {
            setInterval(() => services.updateStatus(controller.info.username).catch(()=>window.location.reload()), 5000);
            setInterval(() => {
                let el = document.querySelector('aside');
                let checkedPersonItem = document.querySelector('.checkedPerson')?.previousElementSibling?.innerText || "Todos";
                let checkedMessageTypeItem = document.querySelector('.checkedMessageType')?.previousElementSibling?.innerText || "Público";
                controller.setCheckedPersonItem(checkedPersonItem);
                controller.setCheckedMessageTypeItem(checkedMessageTypeItem);
                services.getParticipants()
                    .then(response => response.json())
                    .then(participants => {
                        el.innerHTML = '';
                        el.appendChild(controller.createParticipantsTemplate(participants));
                        if (checkedPersonItem === 'Todos') {
                            document.querySelector('aside > div > ion-icon:last-child').classList.add('checkedPerson');
                        } else {
                            controller.setCheckedPersonItem(checkedPersonItem.slice(0, 25));
                        }
                        let publicElement = el.querySelectorAll('div');
                        if (checkedMessageTypeItem === 'Reservadamente') {
                            publicElement[publicElement.length - 1].lastChild.classList.add('checkedMessageType');
                        } else {
                            controller.setCheckedMessageTypeItem("Reservadamente")
                            publicElement[publicElement.length - 2].lastChild.classList.add('checkedMessageType');
                        }
                    })
            }, 10000);
            setInterval(async () => {
                let chatItensDOM = document.querySelectorAll('.chat-item');
                await services.getMessages()
                    .then((messages) => messages.json())
                    .then(messages => {
                        return { chatItensDOM, actualMessages: messages }
                    })
                    .then(({ chatItensDOM, actualMessages }) => {
                        let DomItensArray = [...chatItensDOM];
                        let lastItem = DomItensArray[chatItensDOM.length - 1];
                        let lastMSG = lastItem.lastChild.textContent.trim();
                        let indexToReplace = chatItensDOM.length - 1;
                        for (let i = (chatItensDOM.length - 1); i > -1; i--) {
                            if (actualMessages[i]?.text === lastMSG) {
                                indexToReplace = i;
                                break;
                            }
                        }
                        let newItens = [];
                        if (indexToReplace !== chatItensDOM.length - 1) {
                            newItens = actualMessages.slice(indexToReplace + 1);

                        }
                        if (newItens.length > 0) {
                            let newMessages = controller.mapMessage1(newItens);
                            document.querySelector('main').appendChild(newMessages);
                            document.querySelector('main > div').classList.add('set-opacity');
                        }
                        indexToReplace = chatItensDOM - 1;
                        newItens = [];
                        indexToReplace = 0;
                        controller.scrollToLastElement();
                        document.querySelector('input[type=text]').focus();
                    })
            }, 3000);
        })
        .catch(err => {
            document.querySelector('#spinner-container').classList.toggle('hide');
            e.target.classList.toggle("hide");
            if (e.target.children.length < 3) {
                let el = document.createElement('p');
                el.innerHTML = 'Someone already took this name or is invalid, please choose another!';
                e.target.insertBefore(el, e.target[0]);
            }
            document.querySelector('input').value = '';
        })
}
function sendFormMessage(e) {
    e.preventDefault();
    let chatItensDOM = document.querySelectorAll('.chat-item');
    let target = e.target.querySelector('input[type=text]');
    let checkedPersonItem = document.querySelector('.checkedPerson')?.previousElementSibling?.innerText || "Todos";
    let checkedMessageTypeItem = document.querySelector('.checkedMessageType')?.previousElementSibling?.innerText || "Público";
    let messageTo = checkedPersonItem || "Todos";
    let messageType = checkedMessageTypeItem === "Público" ? "message" : "private_message";

    services.sendMessage(controller.info.username, target.value, messageTo, messageType)
        .then(() => {
            // services.messageAbortController.abort()
            return services.getMessages()
        }, (e) => console.error(e))
        .then((messages) => messages.json())
        .then(messages => {
            return { chatItensDOM, actualMessages: messages }
        })
        .then(({ chatItensDOM, actualMessages }) => {
            let DomItensArray = [...chatItensDOM];
            let lastItem = DomItensArray[chatItensDOM.length - 1];
            let lastMSG = lastItem.lastChild.textContent.trim();
            let indexToReplace = chatItensDOM.length - 1;
            for (let i = (chatItensDOM.length - 1); i > -1; i--) {
                if (actualMessages[i]?.text === lastMSG) {
                    indexToReplace = i;
                    break;
                }
            }
            let newItens = [];
            if (indexToReplace !== chatItensDOM.length - 1) {
                newItens = actualMessages.slice(indexToReplace + 1);

            }
            if (newItens.length > 0) {
                let newMessages = controller.mapMessage1(newItens);
                document.querySelector('main').appendChild(newMessages);
            }
            indexToReplace = chatItensDOM - 1;
            newItens = [];
            indexToReplace = 0;
            controller.scrollToLastElement();
            // document.querySelector('input[type=text]').focus()  //tirei pq do celular
        }).catch(e => {
            console.error(e);
            // window.location.reload()
        })
    target.value = "";
}

function checkPerson(e) {
    document.querySelector('.checkedPerson')?.classList?.remove('checkedPerson');
    e.currentTarget.querySelector('ion-icon:last-child').classList.add('checkedPerson');
    controller.setCheckedPersonItem(e.currentTarget.querySelector('p').innerText);
}
function checkMessageType(e) {
    document.querySelector('.checkedMessageType')?.classList?.remove('checkedMessageType');
    e.currentTarget.querySelector('ion-icon:last-child').classList.add('checkedMessageType');
    controller.setCheckedMessageTypeItem(e.currentTarget.querySelector('p').innerText);
}

function togglePrivateMessage(e) {
    let checkedMessageTypeItem = document.querySelector('.checkedMessageType')?.previousElementSibling?.innerText || "Público";
    let checkedMessagePerson = document.querySelector('.checkedPerson')?.previousElementSibling?.innerText || "Todos";
    let reservadamenteElement = document.querySelector('form p');
    if (reservadamenteElement === null && checkedMessageTypeItem === "Reservadamente") {
        let form = document.querySelector('form')
        let pEl = document.createElement('p')
        pEl.setAttribute('data-test',"recipient")
        console.log(checkedMessagePerson)
        if (checkedMessagePerson.length > 25) {
            checkedMessagePerson = checkedMessagePerson.slice(0, 25)
            pEl.textContent = `Enviando para ${checkedMessagePerson}... (Reservadamente)`
        } else {
            pEl.textContent = `Enviando para ${checkedMessagePerson} (Reservadamente)`
        }
        form.appendChild(pEl)

    } else if (checkedMessageTypeItem === 'Público') {
        reservadamenteElement?.remove()
    }
}