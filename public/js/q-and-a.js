const links = [
    "https://example.com/new-climate-article-1",
    "https://example.com/new-climate-article-2"
];

// const link_articles = [
//     {'title': 'Climate change intensifies La Nina, leading to stronger ...', 'link': 'https://e.vnexpress.net/news/news/environment/climate-change-intensifies-la-nina-leading-to-stronger-storms-experts-4791721.html'}, 
//     {'title': 'Record April Heat Across Asia Intensified by Climate Change', 'link': 'https://e.vnexpress.net/news/news/environment/asia-s-extreme-april-heat-worsened-by-climate-change-scientists-say-4746219.html'}, 
//     {'title': 'Climate change could force Thailand to relocate capital ...', 'link': 'https://e.vnexpress.net/news/news/environment/climate-change-could-force-thailand-to-relocate-capital-bangkok-4746839.html'}, 
//     {'title': 'World warming at record 0.2C per decade, scientists warn', 'link': 'https://e.vnexpress.net/news/world/world-warming-at-record-0-2c-per-decade-scientists-warn-4615206.html'}, 
//     {'title': 'Vietnam needs $35 bln for climate change adaptation: PM', 'link': 'https://e.vnexpress.net/news/news/vietnam-needs-35-bln-for-climate-change-adaptation-pm-4226847.html'}]

// const files_path = ['./storage/pdf_files/67113ed6345737d006d94870/Climate_change_intensifies_La_Nina_leading_to_stronger_.pdf', './storage/pdf_files/67113ed6345737d006d94870/Record_April_Heat_Across_Asia_Intensified_by_Climate_Change.pdf', './storage/pdf_files/67113ed6345737d006d94870/Climate_change_could_force_Thailand_to_relocate_capital_.pdf', './storage/pdf_files/67113ed6345737d006d94870/World_warming_at_record_C_per_decade_scientists_warn.pdf', './storage/pdf_files/67113ed6345737d006d94870/Vietnam_needs__bln_for_climate_change_adaptation_PM.pdf']
const link_articles = []
const files_path = []
var linkSpecific = ""
var topK = 5
var isCrawl = true
var locations = []

async function loadLocations() {
    const conversationId = localStorage.getItem('conversationId');
    try {
        const response = await fetch(`http://localhost:4000/q-and-a/conversations/${conversationId}/locations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching locations: ${response.statusText}`);
        }

        const data = await response.json();
        return data.locations;  // Giả sử API trả về { locations: [...] }
    } catch (error) {
        console.error('Error loading locations:', error);
        return [];  // Trả về mảng rỗng nếu có lỗi
    }
}


async function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,  // Mức thu phóng ban đầu
        center: { lat: 0, lng: 0 }  // Trung tâm bản đồ tại (0, 0)
    });


    const icons = {
        positive: {
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'  // Đánh dấu màu xanh cho cảm xúc tích cực
        },
        negative: {
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'  // Đánh dấu màu đỏ cho cảm xúc tiêu cực
        },
        neutral: {
            icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'  // Đánh dấu màu vàng cho cảm xúc trung tính
        }
    };
    locations = await loadLocations();

    // Thêm các marker cho mỗi địa điểm
    locations.forEach(article => {
        const marker = new google.maps.Marker({
            position: { lat: article.lat, lng: article.lon },
            map: map,
            icon: icons[article.sentiment].icon || 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',  // Đặt màu marker dựa trên cảm xúc
            title: `${article.administrative_area}, ${article.country}`
        });

        // Tạo nội dung cho cửa sổ thông tin
        let contentString = `<b>${article.administrative_area}, ${article.country}</b><br>`;
        article.links.forEach((link, index) => {
            const summary = article.summaries[index] || "No summary";  // Đảm bảo không có lỗi nếu không có tóm tắt
            contentString += `<a href="${link}" target="_blank">${summary}</a><a href="#" data-bs-toggle="tooltip" title="Q & A" onclick="sendMessageFromLocation('${summary}', '${link}')"><i class="bi bi-question-circle"></i></a><br>`;
        });

        const infoWindow = new google.maps.InfoWindow({
            content: contentString
        });

        // Hiển thị cửa sổ thông tin khi nhấp vào marker
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}


// Gọi hàm initMap khi trang được tải
window.onload = initMap;

function mergeLocations(existingLocations, newLocations) {
    // Tạo một map để lưu các vị trí theo key duy nhất
    const locationMap = new Map();

    // Đưa các vị trí hiện có vào map
    existingLocations.forEach(location => {
        const key = `${location.administrative_area}-${location.country}-${location.continent}-${location.lat}-${location.lon}`;
        locationMap.set(key, { ...location }); // Sao chép location để tránh tham chiếu trực tiếp
    });

    // Thêm hoặc gộp các vị trí mới vào map
    newLocations.forEach(newLocation => {
        const key = `${newLocation.administrative_area}-${newLocation.country}-${newLocation.continent}-${newLocation.lat}-${newLocation.lon}`;
        if (locationMap.has(key)) {
            const existingLocation = locationMap.get(key);

            // Gộp links và summaries
            existingLocation.links = Array.from(new Set([...existingLocation.links, ...newLocation.links]));
            existingLocation.summaries = Array.from(new Set([...existingLocation.summaries, ...newLocation.summaries]));
        } else {
            locationMap.set(key, { ...newLocation }); // Thêm vị trí mới nếu chưa tồn tại
        }
    });

    // Chuyển map thành mảng
    return Array.from(locationMap.values());
}

function showSpinner() {
    const spinner = document.getElementById('spinner');
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('d-none'); // Show the overlay
    spinner.classList.remove('d-none'); // Show the spinner
}

function hideSpinner() {
    const spinner = document.getElementById('spinner');
    const overlay = document.getElementById('overlay');
    overlay.classList.add('d-none'); // Hide the overlay
    spinner.classList.add('d-none'); // Hide the spinner
}

async function sendMessage() {
    showSpinner()
    const conversationsessionsID = localStorage.getItem('conversationId');
    var input = document.getElementById('userInput');
    var chatBox = document.getElementById('chatBox');
    var userMessage = input.value.trim();

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Check if userMessage contains a link and separate it
    if (urlRegex.test(userMessage)) {
        linkSpecific = userMessage.match(urlRegex)[0]; // Extract the first URL found
        userMessage = userMessage.replace(urlRegex, "").trim(); // Remove the URL from userMessage
    }

    if (userMessage) {
        // Tạo thẻ chứa tin nhắn của người dùng
        var userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('message', 'user');
        userMessageDiv.innerHTML = '<div class="content">' + userMessage + '</div>';
        chatBox.appendChild(userMessageDiv);

        // Cuộn xuống để xem tin nhắn mới
        chatBox.scrollTop = chatBox.scrollHeight;

        // Xóa nội dung đã nhập
        input.value = '';

        try {
            // Gọi API getResponse
            const response = await fetch('http://localhost:8000/getResponse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: userMessage, isCrawl, linkSpecific, topK, conversationsessionsID })  // Gửi tin nhắn và trạng thái isCrawl
            });

            // Kiểm tra phản hồi từ API
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            // Chờ và lấy dữ liệu JSON
            const data = await response.json();
            locations = mergeLocations(locations, data.locations);
            
            console.log(data.locations)
            await updateLocations()
            // link_articles = data.links;
            // var botMessageDiv = document.createElement('div');
            // botMessageDiv.classList.add('message', 'bot');
            // botMessageDiv.innerHTML = '<div class="content">' + data.textAnswer + '</div>'; // Sử dụng text từ phản hồi
            // chatBox.appendChild(botMessageDiv);

            // // Cuộn xuống để xem tin nhắn mới
            // chatBox.scrollTop = chatBox.scrollHeight;

            // await updateHistory(userMessage, data.textAnswer);
            await loadHistory(conversationsessionsID);
            toggleChatList = document.getElementById('toggleChatList');
            toggleChatList.click();
            await initMap();
            isCrawl = false
            linkSpecific = ""

        } catch (error) {
            console.error('Error fetching response:', error);
        } finally {
            // Hide the spinner
            hideSpinner()
        }
        
    }
}

async function updateLocations() {
    try {
        // Giả sử bạn đã lưu conversationId khi chọn cuộc trò chuyện
        const conversationId = localStorage.getItem('conversationId');

        // Gọi API cập nhật History
        const response = await fetch(`q-and-a/conversations/${conversationId}/updateLocations`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locations })
        });

        // Kiểm tra phản hồi từ API cập nhật History
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        console.log('History updated successfully');
    } catch (error) {
        console.error('Error updating locations:', error);
    }
}

async function updateHistory(userMessage, botMessage) {
    try {
        // Giả sử bạn đã lưu conversationId khi chọn cuộc trò chuyện
        const conversationId = localStorage.getItem('conversationId');

        // Gọi API cập nhật History
        const response = await fetch(`q-and-a/conversations/${conversationId}/updateHistory`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                history: [`User: ${userMessage}`, `System: ${botMessage}`] // Gửi lịch sử cập nhật
            })
        });

        // Kiểm tra phản hồi từ API cập nhật History
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        console.log('History updated successfully');
    } catch (error) {
        console.error('Error updating history:', error);
    }
}

async function sendMessageFromLocation(query, link) {
    isCrawl = true
    linkSpecific = link
    var input = document.getElementById('userInput');
    input.value = query;
    var sendMessageBtn = document.getElementById('sendMessage');
    sendMessageBtn.click();
}


document.getElementById('toggleChatList').addEventListener('click', function() {
    var chatList = document.getElementById('chatList');
    if (chatList.classList.contains('d-none')) {
        chatList.classList.remove('d-none');
    } else {
        chatList.classList.add('d-none');
    }
});

function formatTextToHtml(text) {  
    // Wrap the modified text in <ol> tags if numbered points exist
    if (text.includes("<li><strong>")) {
        text = `<ol>${text}</ol>`;
    }
    
    // Replace markdown-style bold **text** with <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/:\s*-\s*/g, ":<br> - "); 
    text = text.replace(/\.\s*-\s*/g, ".<br> - ");

    // Wrap remaining text in <p> tags to maintain paragraph structure
    text = `<p>${text.replace(/\n\n/g, "</p><p>")}</p>`; // Separate paragraphs

    return text.trim();
}


// Hàm hiển thị lịch sử chỉnh sửa
function showEditHistory(message) {
    const mapContainer = document.querySelector('.map-container');

    mapContainer.innerHTML = `
        <div class="p-4">
            <h3>Edit History</h3>
            <div class="edit-history-box shadow-sm rounded bg-white">
                <div class="border-bottom bg-body-secondary rounded-top"><h6 class="px-3 my-2">Old Content</h6></div>
                <div class="old-content mb-3 p-3">
                    <div>${extractOldContent(message)}</div>
                </div>
                <div class="border-top border-bottom bg-body-secondary"><h6 class="px-3 my-2">New Content</h6></div>
                <div class="new-content p-3"> 
                    <div>${extractNewContent(message)}</div>
                </div>
            </div>
            <button class="btn btn-secondary mt-3" onclick="restoreMap()">Hide edit history</button>
        </div>
    `;
}

function extractPhrases(phraseString) {
    // Tách tất cả các cụm từ nằm trong dấu nháy đơn
    const matches = phraseString.match(/''(.*?)''/g);
    return matches ? matches.map(match => match.replace(/''/g, '').trim()) : [];
}

function highlightPhrases(content, phrases, links, color) {
    phrases.forEach((phrase, index) => {
        const escapedPhrase = escapeRegExp(phrase);
        const url = links[index] || '#';  // Nếu không có link, mặc định là '#'
        const linkTag = `<a href="${url}" target="_blank" style="color: ${color}; font-weight: bold; text-decoration: underline;">${phrase}</a>`;
        
        const regex = new RegExp(escapedPhrase, 'g');
        content = content.replace(regex, linkTag);
    });
    return content;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // Thoát các ký tự đặc biệt để dùng trong Regex
}


function extractOldContent(message) {
    const oldMatch = message.match(/OldMessage:(.*?)HighlightNotCorrect:/s);
    const notCorrectHighlights = message.match(/HighlightNotCorrect:\s*(.*?)LinkNotCorrect:/s);
    const notCorrectLinks = message.match(/LinkNotCorrect:\s*(.*?)HighlightCorrect:/s);
    const correctHighlights = message.match(/HighlightCorrect:\s*(.*?)LinkCorrect:/s);
    const correctLinks = message.match(/LinkCorrect:\s*(.*?)NewMessage:/s);

    if (oldMatch) {
        let oldContent = oldMatch[1].trim();

        // Xử lý Highlight Not Correct
        const incorrectPhrases = extractPhrases(notCorrectHighlights ? notCorrectHighlights[1] : '');
        const incorrectLinks = extractPhrases(notCorrectLinks ? notCorrectLinks[1] : '');
        oldContent = highlightPhrases(oldContent, incorrectPhrases, incorrectLinks, 'red');

        // Xử lý Highlight Correct
        const correctPhrases = extractPhrases(correctHighlights ? correctHighlights[1] : '');
        const correctLinksList = extractPhrases(correctLinks ? correctLinks[1] : '');
        oldContent = highlightPhrases(oldContent, correctPhrases, correctLinksList, 'green');

        return formatTextToHtml(oldContent);
    }

    return 'No old content available.';
}


function extractNewContent(message) {
    const matchResult = message.match(/NewMessage:(.*)/s);
    if (matchResult && matchResult[1]) {
        return formatTextToHtml(matchResult[1].trim());
    } else {
        return 'No new content available.';
    }
}


// Khôi phục lại bản đồ
function restoreMap() {
    const mapContainer = document.querySelector('.map-container');
    mapContainer.innerHTML = `
        <div id="mapControls">
            <h5 class="m-0">Interactive map</h5>
        </div>
        <div id="map"></div>
    `;
    initMap(); // Khởi tạo lại bản đồ
}


async function loadHistory(conversationId) {
    localStorage.setItem('conversationId', conversationId);
    // Gửi yêu cầu để lấy lịch sử cho conversationId
    try {
        const response = await fetch(`http://localhost:4000/q-and-a/conversations/${conversationId}`);
        if (!response.ok) throw new Error(`Network response was not ok:  ${response.statusText}`);

        var chatList = document.getElementById('chatList');
        if (chatList.classList.contains('d-none')) {
            chatList.classList.remove('d-none');
        } else {
            chatList.classList.add('d-none');
        }

        const history = await response.json();

        // Lấy phần tử chatBox
        var chatBox = document.getElementById('chatBox');
        chatBox.innerHTML = ''; // Xóa nội dung hiện tại

        // Lặp qua lịch sử và thêm vào chatBox
        history.forEach(function(message) {
            var messageDiv = document.createElement('div');
            
            // Kiểm tra xem tin nhắn từ người dùng hay bot
            if (message.startsWith('User:')) {
                messageDiv.classList.add('message', 'user'); // Thêm lớp cho tin nhắn của người dùng
                messageDiv.innerHTML = '<div class="content">' + message.replace('User: ', '') + '</div>'; // Loại bỏ "User: "
            } else if (message.startsWith('System:')) {
                editedDiv = document.createElement('div');
                editedDiv.onclick = function() {
                    showEditHistory(message);
                };
                editedDiv.innerHTML = '<div class="btn btn-link">Edited</div>';
                chatBox.appendChild(editedDiv)
                messageDiv.classList.add('message', 'bot'); // Thêm lớp cho tin nhắn của bot
                messageDiv.innerHTML = '<div class="content">' + formatTextToHtml(message.match(/NewMessage:(.*)/s)[1].trim()) + '</div>'; // Loại bỏ "System: "
            } else if (message.startsWith('Ref:') && message.length > 6) {
                messageDiv.classList.add('message', 'bot'); // Thêm lớp cho tin nhắn của bot
                messageDiv.innerHTML = '<div class="content">' + message.replace('Ref: ', '') + '</div>'; // Loại bỏ "System: "
            }


            // Thêm messageDiv vào chatBox
            chatBox.appendChild(messageDiv);
        });

        // Cuộn xuống để xem tin nhắn mới
        chatBox.scrollTop = chatBox.scrollHeight;

        await initMap();

    } catch (error) {
        console.error('Error loading history:', error);
    }
}

async function createNewChat(userID) {
    var chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = ''; // Clear current chat content

    try {
        // Send request to create a new conversation
        const response = await fetch('http://localhost:4000/q-and-a/conversations/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                UserID: userID,
                Title: 'New Chat',
                History: []
            }),
        });

        if (!response.ok) {
            throw new Error('Error creating new chat: ' + response.statusText);
        }

        const data = await response.json(); // Get response data from server

        // Create a new chat item and add it to the top of the chat list
        const chatList = document.querySelector('.list-group');

        const newChatItem = document.createElement('div');
        newChatItem.classList.add('d-flex', 'justify-content-between', 'list-group-item', 'list-group-item-action');

        // Title display and inline editing setup
        const titleContainer = document.createElement('div');

        const newChatLink = document.createElement('a');
        newChatLink.href = '#';
        newChatLink.classList.add('chat-list-item');
        newChatLink.setAttribute('data-id', data._id);
        newChatLink.onclick = () => loadHistory(data._id); // Load history on click

        const titleDisplay = document.createElement('span');
        titleDisplay.classList.add('title-display');
        titleDisplay.id = `titleDisplay-${data._id}`;
        titleDisplay.textContent = data.Title;

        // Append title display to link
        newChatLink.appendChild(titleDisplay);
        titleContainer.appendChild(newChatLink);

        // Editable input for renaming
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.classList.add('edit-input', 'd-none');
        editInput.id = `editInput-${data._id}`;
        editInput.value = data.Title;

        // On key down, handle renaming
        editInput.onkeydown = (event) => {
            renameConversation(event, data._id)
        };

        titleContainer.appendChild(editInput);

        // Append titleContainer to newChatItem
        newChatItem.appendChild(titleContainer);

        // Rename and Delete actions
        const actionContainer = document.createElement('div');

        const renameIcon = document.createElement('a');
        renameIcon.href = '#';
        renameIcon.classList.add('my-auto', 'mx-2', 'rename-title');
        renameIcon.setAttribute('data-bs-toggle', 'tooltip');
        renameIcon.setAttribute('title', 'Rename');
        renameIcon.setAttribute('data-id', data._id);
        renameIcon.onclick = () => showRenameInput(data._id); // Show input for renaming
        renameIcon.innerHTML = '<i class="bi bi-pencil"></i>';

        const deleteIcon = document.createElement('a');
        deleteIcon.href = '#';
        deleteIcon.classList.add('mx-2', 'my-auto', 'text-danger', 'delete-history');
        deleteIcon.setAttribute('data-bs-toggle', 'tooltip');
        deleteIcon.setAttribute('title', 'Delete');
        deleteIcon.setAttribute('data-id', data._id);
        deleteIcon.onclick = () => deleteConversation(data._id); // Call delete function
        deleteIcon.innerHTML = '<i class="bi bi-trash"></i>';

        // Append icons to actionContainer
        actionContainer.appendChild(renameIcon);
        actionContainer.appendChild(deleteIcon);

        // Append actionContainer to newChatItem
        newChatItem.appendChild(actionContainer);

        // Insert the new chat item at the top of the list
        chatList.insertBefore(newChatItem, chatList.firstChild);

        // Automatically click on the new chat item to load it
        newChatLink.click();

        // Toggle chat list visibility and initialize map
        document.getElementById('toggleChatList').click();
        locations = [];
        await initMap();
    } catch (error) {
        console.error('Error creating new chat:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var firstChatItem = document.querySelector('.chat-list-item');
    var chatList = document.getElementById('toggleChatList');
    if (firstChatItem) {
        // Tự động kích hoạt click vào phần tử đầu tiên
        firstChatItem.click();
        chatList.click();
    }
    else {
        var newChat = document.getElementById('newChat');
        newChat.click();
    }
});

async function deleteConversation(id) {
    try {
        let res = await fetch(`/q-and-a/conversations/${id}`, {
            method: "DELETE",
        });

        if (res.status == 200) {
            location.reload();
        } else {
            let resText = await res.text();
            throw new Error(resText);
        }
    } catch (error) {
        let toast = new bootstrap.Toast(document.querySelector(".toast"), {});
        let toastBody = document.querySelector(".toast .toast-body");

        toastBody.innerHTML = "Can not delete conversation";
        toastBody.classList.add("text-danger");
        toast.show();

        console.log(error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-history');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            const conversationID = this.getAttribute('data-id');
            console.log(conversationID)
            // const options = {
            //     title: "Are you sure?",
            //     type: "danger",
            //     btnOkText: "Yes",
            //     btnCancelText: "No",
            //     onConfirm: () => {
            //         // console.log(id);
            //         deleteConversation(conversationID);
            //     },
            //     onCancel: () => {
            //         console.log("Deletion canceled.");
            //     },
            // };
    
            // const { el, content, options: confirmedOptions } = bs5dialog.confirm(
            //     "Do you really want to delete this conversation?",
            //     options
            // );
            deleteConversation(conversationID);
        });
    });
});

// Function to display the input field for renaming
function showRenameInput(id) {
    const titleDisplay = document.getElementById(`titleDisplay-${id}`);
    const editInput = document.getElementById(`editInput-${id}`);

    // Hide the display title and show the edit input
    titleDisplay.classList.add('d-none');
    editInput.classList.remove('d-none');
    editInput.focus(); // Focus on the input field for immediate editing
}

// Function to rename the title and send request on Enter
async function renameConversation(event, id) {
    if (event.key === 'Enter') {
        const editInput = document.getElementById(`editInput-${id}`);
        const newTitle = editInput.value.trim();

        // Send the update request if the title is changed
        if (newTitle) {
            try {
                const response = await fetch(`/q-and-a/conversations/${id}/renameConversation`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: newTitle })
                });

                if (!response.ok) throw new Error('Failed to update title');

                // Update the display with the new title
                document.getElementById(`titleDisplay-${id}`).innerText = newTitle;
            } catch (error) {
                console.error('Error renaming title:', error);
            }
        }

        // Hide the input and show the title display again
        editInput.classList.add('d-none');
        document.getElementById(`titleDisplay-${id}`).classList.remove('d-none');
    }
}

document.getElementById('userInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault(); // Prevents adding a newline
            sendMessage(); // Calls the sendMessage function
        }
    }
});
