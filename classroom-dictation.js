// ============================================================================
// Classroom Dictation Feature - 課堂默寫功能
// ============================================================================
// Features:
// 1. View mode: Display dictation sessions by date (descending)
// 2. Edit mode: Add/Edit dictation items with voice input
// 3. Dictation mode: Play audio for practice
// ============================================================================

// Data structure for classroom dictation
let classroomDictations = [];

// Load classroom dictations from localStorage
function loadClassroomDictations() {
    const stored = localStorage.getItem('classroomDictations');
    if (stored) {
        classroomDictations = JSON.parse(stored);
        console.log(`📝 Loaded ${classroomDictations.length} classroom dictation sessions`);
    }
}

// Save classroom dictations to localStorage
function saveClassroomDictations() {
    localStorage.setItem('classroomDictations', JSON.stringify(classroomDictations));
    console.log('💾 Classroom dictations saved');
}

// Open classroom dictation main page
function openClassroomDictation() {
    // Switch to classroom dictation tab
    if (typeof switchTab === 'function') {
        switchTab('classroom-dictation');
    }
    
    // Wait for tab switch to complete
    setTimeout(() => {
        loadClassroomDictations();
        showClassroomDictationList();
    }, 100);
}

// Show classroom dictation list (main view)
function showClassroomDictationList() {
    // Sort by date descending
    classroomDictations.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const container = document.getElementById('classroomDictationContainer');
    
    let html = `
        <div style="padding: 20px; max-width: 900px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #4facfe; margin-bottom: 10px;">📝 課堂默寫</h2>
                <p style="color: #666; font-size: 0.9em;">記錄課堂上要求默寫的詞組和句子</p>
                <button onclick="showAddDictationForm()" style="margin-top: 15px; padding: 12px 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1em; font-weight: bold; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);"
                        onmouseover="this.style.transform='scale(1.05)'"
                        onmouseout="this.style.transform='scale(1)'">
                    ➕ 新增默寫
                </button>
            </div>
    `;
    
    if (classroomDictations.length === 0) {
        html += `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 4em; margin-bottom: 20px;">📝</div>
                <p style="font-size: 1.2em;">暫無默寫記錄</p>
                <p style="font-size: 0.9em; margin-top: 10px;">點擊上方按鈕新增課堂默寫內容</p>
            </div>
        `;
    } else {
        html += `<div style="display: flex; flex-direction: column; gap: 20px;">`;
        
        classroomDictations.forEach((session, index) => {
            const date = new Date(session.date);
            const dateStr = date.toLocaleDateString('zh-HK', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            });
            
            const typeIcon = session.type === 'english' ? '📚' : '📖';
            const typeText = session.type === 'english' ? '英文' : '中文';
            
            // Display title if available, otherwise show date + type
            const displayTitle = session.title ? session.title : `${dateStr} - ${typeText}`;
            
            html += `
                <div style="background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 5px solid #4facfe;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <div style="font-size: 1.1em; font-weight: bold; color: #333; margin-bottom: 5px;">
                                ${typeIcon} ${displayTitle}
                            </div>
                            <div style="font-size: 0.85em; color: #999;">
                                📋 ${session.items.length} 個詞組/句子
                                ${!session.title ? `<span style="margin-left: 10px;">(${dateStr})</span>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="startClassroomDictation(${index})" style="padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9em;"
                                    onmouseover="this.style.transform='scale(1.05)'"
                                    onmouseout="this.style.transform='scale(1)'">
                                ▶️ 聽寫
                            </button>
                            <button onclick="editDictationSession(${index})" style="padding: 8px 16px; background: #f0f4ff; color: #667eea; border: 2px solid #667eea; border-radius: 8px; cursor: pointer; font-size: 0.9em;"
                                    onmouseover="this.style.background='#667eea'; this.style.color='white'"
                                    onmouseout="this.style.background='#f0f4ff'; this.style.color='#667eea'">
                                ✏️ 編輯
                            </button>
                            <button onclick="deleteDictationSession(${index})" style="padding: 8px 16px; background: #ffebee; color: #ff4757; border: 2px solid #ff4757; border-radius: 8px; cursor: pointer; font-size: 0.9em;"
                                    onmouseover="this.style.background='#ff4757'; this.style.color='white'"
                                    onmouseout="this.style.background='#ffebee'; this.style.color='#ff4757'">
                                🗑️ 刪除
                            </button>
                        </div>
                    </div>
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; max-height: 200px; overflow-y: auto;">
                        ${session.items.map((item, idx) => `
                            <div style="padding: 8px 0; border-bottom: ${idx < session.items.length - 1 ? '1px solid #e0e0e0' : 'none'};">
                                <span style="color: #999; margin-right: 10px;">${idx + 1}.</span>
                                <span style="color: #333;">${item.text}</span>
                                ${item.translation ? `<span style="color: #666; margin-left: 10px; font-size: 0.9em;">(${item.translation})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
}

// Show add dictation form
function showAddDictationForm(editIndex = null) {
    const container = document.getElementById('classroomDictationContainer');
    const isEdit = editIndex !== null;
    const session = isEdit ? classroomDictations[editIndex] : null;
    
    let html = `
        <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #4facfe; margin-bottom: 10px;">${isEdit ? '✏️ 編輯默寫' : '➕ 新增默寫'}</h2>
                <p style="color: #666; font-size: 0.9em;">支持語音輸入，英文自動翻譯為粵語繁體</p>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <!-- Title Input -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">📝 默寫標題（選填）</label>
                    <input type="text" id="dictationTitle" value="${session ? (session.title || '') : ''}" 
                           placeholder="例如：第一單元詞彙、期中考試範圍..." 
                           style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                    <p style="font-size: 0.85em; color: #999; margin-top: 5px;">💡 如不填寫，將自動顯示日期和類型</p>
                </div>
                
                <!-- Date Input -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">📅 默寫日期</label>
                    <input type="date" id="dictationDate" value="${session ? session.date : new Date().toISOString().split('T')[0]}" 
                           style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                </div>
                
                <!-- Type Selection -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">🌐 語言類型</label>
                    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 10px; margin-bottom: 10px; font-size: 0.9em; color: #856404;">
                        💡 提示：選擇"英文"時，系統會播放中文翻譯；選擇"中文"時，直接播放中文
                    </div>
                    <div style="display: flex; gap: 15px;">
                        <label style="flex: 1; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.2s;"
                               onmouseover="this.style.borderColor='#4facfe'"
                               onmouseout="if(!document.getElementById('typeEnglish').checked) this.style.borderColor='#e0e0e0'">
                            <input type="radio" name="dictationType" id="typeEnglish" value="english" ${session && session.type === 'english' ? 'checked' : ''} style="margin-right: 10px;">
                            📚 英文
                        </label>
                        <label style="flex: 1; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.2s;"
                               onmouseover="this.style.borderColor='#4facfe'"
                               onmouseout="if(!document.getElementById('typeChinese').checked) this.style.borderColor='#e0e0e0'">
                            <input type="radio" name="dictationType" id="typeChinese" value="chinese" ${session && session.type === 'chinese' ? 'checked' : !session ? 'checked' : ''} style="margin-right: 10px;">
                            📖 中文
                        </label>
                    </div>
                </div>
                
                <!-- Items Input -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">📝 詞組/句子</label>
                    <div id="dictationItemsContainer" style="display: flex; flex-direction: column; gap: 15px;">
                        ${session ? session.items.map((item, idx) => createItemInputHTML(item, idx)).join('') : createItemInputHTML(null, 0)}
                    </div>
                    <button onclick="addDictationItem()" style="margin-top: 15px; padding: 10px 20px; background: #f0f4ff; color: #667eea; border: 2px dashed #667eea; border-radius: 8px; cursor: pointer; font-size: 0.95em; width: 100%;"
                            onmouseover="this.style.background='#667eea'; this.style.color='white'"
                            onmouseout="this.style.background='#f0f4ff'; this.style.color='#667eea'">
                        ➕ 添加更多
                    </button>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <button onclick="saveDictationSession(${editIndex})" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; font-weight: bold; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);"
                            onmouseover="this.style.transform='scale(1.02)'"
                            onmouseout="this.style.transform='scale(1)'">
                        💾 保存
                    </button>
                    <button onclick="showClassroomDictationList()" style="flex: 1; padding: 15px; background: #f0f0f0; color: #666; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em;">
                        ↩️ 取消
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Create item input HTML
function createItemInputHTML(item = null, index = 0) {
    const text = item ? item.text : '';
    const translation = item ? (item.translation || '') : '';
    
    return `
        <div class="dictation-item" style="background: #f8f9fa; border-radius: 10px; padding: 15px; position: relative;">
            <div style="position: absolute; top: 10px; right: 10px;">
                <button onclick="removeDictationItem(this)" style="padding: 5px 10px; background: #ffebee; color: #ff4757; border: none; border-radius: 5px; cursor: pointer; font-size: 0.85em;">
                    🗑️
                </button>
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; color: #666; font-size: 0.9em;">原文</label>
                <div style="display: flex; gap: 10px;">
                    <input type="text" class="item-text" value="${text}" placeholder="輸入詞組或句子..." 
                           style="flex: 1; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                    <button onclick="startVoiceInputForItem(this)" style="padding: 10px 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.2em;"
                            title="語音輸入">
                        🎤
                    </button>
                </div>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; color: #666; font-size: 0.9em;">翻譯（選填）</label>
                <div style="display: flex; gap: 10px;">
                    <input type="text" class="item-translation" value="${translation}" placeholder="自動翻譯或手動輸入..." 
                           style="flex: 1; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                    <button onclick="translateItemText(this)" style="padding: 10px 15px; background: #f0f4ff; color: #667eea; border: 2px solid #667eea; border-radius: 8px; cursor: pointer; font-size: 0.9em;"
                            title="翻譯">
                        🌐 翻譯
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Add new item input
function addDictationItem() {
    const container = document.getElementById('dictationItemsContainer');
    const index = container.children.length;
    const div = document.createElement('div');
    div.innerHTML = createItemInputHTML(null, index);
    container.appendChild(div.firstElementChild);
}

// Remove item input
function removeDictationItem(button) {
    const itemDiv = button.closest('.dictation-item');
    const container = document.getElementById('dictationItemsContainer');
    
    if (container.children.length > 1) {
        itemDiv.remove();
    } else {
        showToast('⚠️ 至少需要保留一個項目', 2000);
    }
}

// Start voice input for item
async function startVoiceInputForItem(button) {
    const itemDiv = button.closest('.dictation-item');
    const textInput = itemDiv.querySelector('.item-text');
    const type = document.querySelector('input[name="dictationType"]:checked').value;
    
    try {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = type === 'english' ? 'en-US' : 'zh-HK';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        button.textContent = '🔴';
        button.style.background = '#ff4757';
        
        recognition.onresult = async (event) => {
            let transcript = event.results[0][0].transcript;
            
            // Format English text based on whether it's a word or phrase/sentence
            if (type === 'english') {
                transcript = formatEnglishText(transcript);
            }
            
            textInput.value = transcript;
            
            // Auto-translate if English
            if (type === 'english') {
                button.textContent = '⏳';
                await autoTranslateToCantonese(textInput, itemDiv.querySelector('.item-translation'));
            }
            
            button.textContent = '🎤';
            button.style.background = '';
        };
        
        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            showToast('❌ 語音識別失敗，請重試', 2000);
            button.textContent = '🎤';
            button.style.background = '';
        };
        
        recognition.onend = () => {
            button.textContent = '🎤';
            button.style.background = '';
        };
        
        recognition.start();
        showToast('🎤 請開始說話...', 1500);
        
    } catch (error) {
        console.error('Voice input error:', error);
        showToast('❌ 瀏覽器不支持語音輸入', 2000);
        button.textContent = '🎤';
        button.style.background = '';
    }
}

// Format English text: words (no space) -> lowercase first letter, phrases/sentences (with space) -> capitalize first letter
function formatEnglishText(text) {
    if (!text || text.trim() === '') return text;
    
    const trimmed = text.trim();
    
    // Check if it contains spaces (phrase or sentence)
    if (trimmed.includes(' ')) {
        // Phrase or sentence: capitalize first letter
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    } else {
        // Single word: lowercase first letter
        return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
    }
}

// Auto translate to Cantonese Traditional Chinese
async function autoTranslateToCantonese(textInput, translationInput) {
    const text = textInput.value.trim();
    if (!text) return;
    
    try {
        translationInput.value = '翻譯中...';
        
        // Use free translation API (you may need to replace with your preferred API)
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-TW`);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
            translationInput.value = data.responseData.translatedText;
            showToast('✅ 翻譯完成', 1500);
        } else {
            translationInput.value = '';
            showToast('⚠️ 翻譯失敗，請手動輸入', 2000);
        }
    } catch (error) {
        console.error('Translation error:', error);
        translationInput.value = '';
        showToast('❌ 翻譯錯誤', 2000);
    }
}

// Manual translate button
function translateItemText(button) {
    const itemDiv = button.closest('.dictation-item');
    const textInput = itemDiv.querySelector('.item-text');
    const translationInput = itemDiv.querySelector('.item-translation');
    
    autoTranslateToCantonese(textInput, translationInput);
}

// Save dictation session
function saveDictationSession(editIndex = null) {
    const title = document.getElementById('dictationTitle').value.trim();
    const date = document.getElementById('dictationDate').value;
    const type = document.querySelector('input[name="dictationType"]:checked').value;
    
    // Collect items
    const itemDivs = document.querySelectorAll('.dictation-item');
    const items = [];
    
    itemDivs.forEach(div => {
        const text = div.querySelector('.item-text').value.trim();
        const translation = div.querySelector('.item-translation').value.trim();
        
        if (text) {
            items.push({ text, translation });
        }
    });
    
    if (items.length === 0) {
        showToast('⚠️ 請至少添加一個詞組或句子', 2000);
        return;
    }
    
    const session = {
        id: editIndex !== null ? classroomDictations[editIndex].id : Date.now(),
        title: title || null,  // Save title if provided, otherwise null
        date,
        type,
        items,
        createdAt: editIndex !== null ? classroomDictations[editIndex].createdAt : new Date().toISOString()
    };
    
    if (editIndex !== null) {
        classroomDictations[editIndex] = session;
        showToast('✅ 更新成功', 2000);
    } else {
        classroomDictations.push(session);
        showToast('✅ 新增成功', 2000);
    }
    
    saveClassroomDictations();
    showClassroomDictationList();
}

// Edit dictation session
function editDictationSession(index) {
    showAddDictationForm(index);
}

// Delete dictation session
function deleteDictationSession(index) {
    if (confirm('確定要刪除此默寫記錄嗎？')) {
        classroomDictations.splice(index, 1);
        saveClassroomDictations();
        showClassroomDictationList();
        showToast('🗑️ 已刪除', 2000);
    }
}

// Start classroom dictation mode
function startClassroomDictation(index) {
    const session = classroomDictations[index];
    
    const container = document.getElementById('classroomDictationContainer');
    
    // Show preparation screen with interval selection
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 4em; margin-bottom: 20px;">📝</div>
            <h2 style="color: #4facfe; margin-bottom: 15px;">準備開始聽寫</h2>
            <p style="color: #666; margin-bottom: 10px; font-size: 1.1em;">共 ${session.items.length} 個項目</p>
            
            <!-- Interval Selection -->
            <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 10px; max-width: 400px; margin-left: auto; margin-right: auto;">
                <p style="font-size: 1.1em; color: #666; margin-bottom: 15px;">每個單詞間隔時間</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <select id="intervalSelect" style="padding: 10px 20px; font-size: 1.2em; border: 2px solid #4facfe; border-radius: 8px; outline: none; cursor: pointer;">
                        <option value="10">10 秒</option>
                        <option value="20">20 秒</option>
                        <option value="30">30 秒</option>
                        <option value="40">40 秒</option>
                    </select>
                </div>
            </div>
            
            <button onclick="beginClassroomDictationWithInterval(${index})" style="padding: 15px 40px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.2em; font-weight: bold; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);"
                    onmouseover="this.style.transform='scale(1.05)'"
                    onmouseout="this.style.transform='scale(1)'">
                ▶️ 開始播放
            </button>
            <button onclick="showClassroomDictationList()" style="margin-left: 15px; padding: 15px 30px; background: #f0f0f0; color: #666; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em;">
                ❌ 取消
            </button>
        </div>
    `;
}

// Begin classroom dictation playback with selected interval
function beginClassroomDictationWithInterval(index) {
    const intervalSeconds = parseInt(document.getElementById('intervalSelect').value);
    beginClassroomDictation(index, intervalSeconds);
}

// Begin classroom dictation playback (called after user clicks start button)
function beginClassroomDictation(index, intervalSeconds = 10) {
    const session = classroomDictations[index];
    
    // Initialize global control
    dictationControl = {
        isPaused: false,
        countdownTimer: null,
        nextItemTimer: null,
        currentIndex: 0,
        session: session,
        intervalSeconds: intervalSeconds
    };
    
    const container = document.getElementById('classroomDictationContainer');
    
    // Play "准备开始" intro first
    const introUtterance = new SpeechSynthesisUtterance('準備開始');
    introUtterance.lang = 'zh-HK';
    introUtterance.rate = 0.8;
    
    introUtterance.onend = () => {
        // After intro finishes, wait a bit then show first item
        setTimeout(() => {
            showNextDictationItem();
        }, 500);
    };
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(introUtterance);
}

// Show next dictation item (global function)
function showNextDictationItem() {
    const { currentIndex, session, intervalSeconds } = dictationControl;
    const container = document.getElementById('classroomDictationContainer');
    let isPlaying = false;  // Local flag to prevent duplicate playback
    
    if (currentIndex >= session.items.length) {
        // Finished
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
                <h2 style="color: #51cf66; margin-bottom: 15px;">聽寫完成！</h2>
                <p style="color: #666; margin-bottom: 30px;">已完成所有 ${session.items.length} 個項目的聽寫</p>
                <button onclick="showClassroomDictationList()" style="padding: 12px 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; font-weight: bold;">
                    ↩️ 返回列表
                </button>
            </div>
        `;
        return;
    }
    
    const item = session.items[currentIndex];
    
    // For English dictation, hide the English text by default
    const showEnglishText = session.type === 'english' ? 'none' : 'block';
    
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 1.2em; color: #999; margin-bottom: 20px;">
                ${currentIndex + 1} / ${session.items.length}
            </div>
            <div style="font-size: 3em; margin-bottom: 30px;">
                ${session.type === 'english' ? '📚' : '📖'}
            </div>
            <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 30px;">
                <!-- Chinese text (hidden by default for Chinese dictation) -->
                ${session.type === 'chinese' ? `
                    <div id="chineseTextDisplay" style="font-size: 1.5em; color: #333; margin-bottom: 20px; cursor: pointer; transition: all 0.2s;" 
                         onclick="playTranslationAudio('${escapeJs(item.text)}')"
                         title="點擊播放發音"
                         onmouseover="this.style.color='#667eea'; this.style.transform='scale(1.05)'"
                         onmouseout="this.style.color='#333'; this.style.transform='scale(1)'">
                        ***
                        <span style="font-size: 0.7em; color: #999; margin-left: 10px;">🔊</span>
                    </div>
                ` : `
                    <!-- For English dictation: show Chinese translation -->
                    <div style="font-size: 1.5em; color: #333; margin-bottom: 20px; cursor: pointer; transition: all 0.2s;" 
                         onclick="playTranslationAudio('${escapeJs(item.translation || item.text)}')"
                         title="點擊播放發音"
                         onmouseover="this.style.color='#667eea'; this.style.transform='scale(1.05)'"
                         onmouseout="this.style.color='#333'; this.style.transform='scale(1)'">
                        ${item.translation || item.text}
                        <span style="font-size: 0.7em; color: #999; margin-left: 10px;">🔊</span>
                    </div>
                `}
                
                <!-- English text (only for English dictation, hidden by default) -->
                ${session.type === 'english' ? `
                    <div id="englishTextDisplay" style="font-size: 1.2em; color: #667eea; margin-top: 15px; font-style: italic; display: ${showEnglishText};">
                        ${item.text}
                    </div>
                ` : ''}
                
                <!-- Control buttons -->
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                    ${session.type === 'english' ? `
                        <button onclick="playHintAudio('${escapeJs(item.text)}')" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95em;"
                                onmouseover="this.style.transform='scale(1.05)'"
                                onmouseout="this.style.transform='scale(1)'">
                            🔊 播放提示
                        </button>
                        <button onclick="toggleEnglishText()" style="padding: 10px 20px; background: #f0f4ff; color: #667eea; border: 2px solid #667eea; border-radius: 8px; cursor: pointer; font-size: 0.95em;"
                                onmouseover="this.style.background='#667eea'; this.style.color='white'"
                                onmouseout="this.style.background='#f0f4ff'; this.style.color='#667eea'">
                            👁️ 顯示提示
                        </button>
                    ` : ''}
                    ${session.type === 'chinese' ? `
                        <button onclick="toggleChineseText('${escapeJs(item.text)}')" style="padding: 10px 20px; background: #f0f4ff; color: #667eea; border: 2px solid #667eea; border-radius: 8px; cursor: pointer; font-size: 0.95em;"
                                onmouseover="this.style.background='#667eea'; this.style.color='white'"
                                onmouseout="this.style.background='#f0f4ff'; this.style.color='#667eea'">
                            👁️ 顯示提示
                        </button>
                    ` : ''}
                    <button id="pauseResumeBtn" onclick="togglePauseResume()" style="padding: 10px 25px; background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95em; font-weight: bold;"
                            onmouseover="this.style.transform='scale(1.05)'"
                            onmouseout="this.style.transform='scale(1)'">
                        ⏸️ 暫停
                    </button>
                    <button onclick="skipToNextItem()" style="padding: 10px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95em; font-weight: bold;"
                            onmouseover="this.style.transform='scale(1.05)'"
                            onmouseout="this.style.transform='scale(1)'">
                        ⏭️ 下一個
                    </button>
                    <button onclick="exitDictation()" style="padding: 10px 25px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 0.95em; font-weight: bold;"
                            onmouseover="this.style.background='#e0e0e0'"
                            onmouseout="this.style.background='#f0f0f0'">
                        🚪 退出
                    </button>
                </div>
                <div style="color: #999; font-size: 0.9em; margin-top: 15px;">
                    <div id="dictationCountdown" style="font-size: 2em; color: #f5576c; font-weight: bold;">${intervalSeconds}</div>
                </div>
        </div>
    `;
    
    // Auto-play Chinese translation, then start countdown after it finishes
    setTimeout(() => {
        // Prevent duplicate playback
        if (isPlaying) {
            console.log('⚠️ Already playing, skipping auto-play');
            return;
        }
        
        isPlaying = true;
        console.log('🔊 Auto-playing audio for', session.type);
        
        // Create utterance for the text
        const textToPlay = item.translation && item.translation !== item.text ? item.translation : item.text;
        const utterance = new SpeechSynthesisUtterance(textToPlay);
        utterance.lang = 'zh-HK';
        utterance.rate = 0.8;
        
        // For both English and Chinese: start countdown AFTER the audio finishes
        utterance.onend = () => {
            console.log('✅ Audio finished, starting countdown');
            isPlaying = false;  // Reset flag
            
            // Start countdown for both English and Chinese
            startEnglishCountdown(intervalSeconds, () => {
                // Countdown finished, move to next item
                dictationControl.currentIndex++;
                showNextDictationItem();
            });
        };
        
        window.speechSynthesis.speak(utterance);
    }, 500);
}

// Play dictation audio
function playDictationAudio(text, type, translation = null) {
    console.log('🎤 playDictationAudio called:');
    console.log('  - text:', text);
    console.log('  - type:', type);
    console.log('  - translation:', translation);
    
    if (!window.speechSynthesis) {
        console.error('❌ Speech synthesis not supported');
        showToast('❌ 瀏覽器不支持語音播放', 2000);
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Smart detection: if there's a translation and text is different, assume it's English dictation
    const hasTranslation = translation && translation !== text;
    const actualType = hasTranslation ? 'english' : type;
    
    console.log('  - hasTranslation:', hasTranslation);
    console.log('  - actualType:', actualType);
    
    if (actualType === 'english') {
        // For English: MUST play the Chinese translation
        if (!translation || translation === text) {
            console.warn('⚠️ No Chinese translation available! Text:', text);
            showToast('⚠️ 此項目沒有中文翻譯，請編輯添加', 3000);
            // Don't play anything if no translation
            return;
        }
        
        console.log('📢 Playing Chinese translation:', translation);
        const cantoneseUtterance = new SpeechSynthesisUtterance(translation);
        cantoneseUtterance.lang = 'zh-HK';
        cantoneseUtterance.rate = 0.8;
        cantoneseUtterance.pitch = 1;
        window.speechSynthesis.speak(cantoneseUtterance);
    } else {
        // For Chinese: play Cantonese
        console.log('📢 Playing Chinese:', text);
        const cantoneseUtterance = new SpeechSynthesisUtterance(text);
        cantoneseUtterance.lang = 'zh-HK';
        cantoneseUtterance.rate = 0.8;
        cantoneseUtterance.pitch = 1;
        window.speechSynthesis.speak(cantoneseUtterance);
    }
}

// Play translation audio (for clickable text)
function playTranslationAudio(text) {
    console.log('👆 Click to play:', text);
    
    if (!window.speechSynthesis) {
        showToast('❌ 瀏覽器不支持語音播放', 2000);
        return;
    }
    
    // Check if already playing (prevent duplicate during auto-play)
    // Note: This is a global function, so we can't access isPlaying directly
    // Instead, we cancel any ongoing speech and play the new one
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-HK';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

// Play hint audio (English pronunciation)
function playHintAudio(text) {
    console.log('🔊 Playing hint (English):', text);
    
    if (!window.speechSynthesis) {
        showToast('❌ 瀏覽器不支持語音播放', 2000);
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

// Toggle English text visibility
function toggleEnglishText() {
    const englishTextEl = document.getElementById('englishTextDisplay');
    if (englishTextEl) {
        if (englishTextEl.style.display === 'none') {
            englishTextEl.style.display = 'block';
            showToast('✅ 已顯示英文', 1500);
        } else {
            englishTextEl.style.display = 'none';
            showToast('🙈 已隱藏英文', 1500);
        }
    }
}

// Toggle Chinese text visibility (for Chinese dictation)
function toggleChineseText(originalText) {
    const chineseTextEl = document.getElementById('chineseTextDisplay');
    if (chineseTextEl) {
        const currentText = chineseTextEl.childNodes[0].textContent.trim();
        if (currentText === '***') {
            // Show original text
            chineseTextEl.childNodes[0].textContent = originalText + ' ';
            showToast('✅ 已顯示中文', 1500);
        } else {
            // Hide with asterisks
            chineseTextEl.childNodes[0].textContent = '*** ';
            showToast('🙈 已隱藏中文', 1500);
        }
    }
}

// Global variables for dictation control
let dictationControl = {
    isPaused: false,
    countdownTimer: null,
    nextItemTimer: null,
    currentIndex: 0,
    session: null,
    intervalSeconds: 10,
    remainingTime: 0  // Track remaining time when paused
};

// Toggle pause/resume
function togglePauseResume() {
    dictationControl.isPaused = !dictationControl.isPaused;
    const btn = document.getElementById('pauseResumeBtn');
    
    if (dictationControl.isPaused) {
        // Pause - save current remaining time
        const countdownEl = document.getElementById('dictationCountdown');
        if (countdownEl && countdownEl.textContent !== 'GO!') {
            dictationControl.remainingTime = parseInt(countdownEl.textContent);
        } else {
            dictationControl.remainingTime = dictationControl.intervalSeconds;
        }
        
        if (btn) {
            btn.innerHTML = '▶️ 繼續';
            btn.style.background = 'linear-gradient(135deg, #2ed573 0%, #7bed9f 100%)';
        }
        // Clear timers
        if (dictationControl.countdownTimer) {
            clearInterval(dictationControl.countdownTimer);
            dictationControl.countdownTimer = null;
        }
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        showToast('⏸️ 已暫停', 1500);
        console.log('⏸️ Dictation paused, remaining time:', dictationControl.remainingTime);
    } else {
        // Resume - continue from saved remaining time
        if (btn) {
            btn.innerHTML = '⏸️ 暫停';
            btn.style.background = 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)';
        }
        // Resume countdown from where it left off
        const resumeTime = dictationControl.remainingTime > 0 ? dictationControl.remainingTime : dictationControl.intervalSeconds;
        startEnglishCountdown(resumeTime, () => {
            // Countdown finished, move to next item
            dictationControl.currentIndex++;
            showNextDictationItem();
        });
        showToast('▶️ 已繼續', 1500);
        console.log('▶️ Dictation resumed from', resumeTime, 'seconds');
    }
}

// Exit dictation mode
function exitDictation() {
    if (confirm('確定要退出默寫模式嗎？')) {
        // Clear all timers
        if (dictationControl.countdownTimer) {
            clearInterval(dictationControl.countdownTimer);
        }
        if (dictationControl.nextItemTimer) {
            clearTimeout(dictationControl.nextItemTimer);
        }
        // Cancel speech
        window.speechSynthesis.cancel();
        // Reset control
        dictationControl.isPaused = false;
        dictationControl.countdownTimer = null;
        dictationControl.nextItemTimer = null;
        // Return to list
        showClassroomDictationList();
        showToast('🚪 已退出默寫模式', 2000);
    }
}

// Skip to next item
function skipToNextItem() {
    // Clear current countdown
    if (dictationControl.countdownTimer) {
        clearInterval(dictationControl.countdownTimer);
        dictationControl.countdownTimer = null;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    // Move to next item
    dictationControl.currentIndex++;
    dictationControl.remainingTime = 0;  // Reset remaining time
    showNextDictationItem();
    showToast('⏭️ 跳到下一個', 1500);
}

// Start countdown for dictation (supports pause/resume)
function startEnglishCountdown(totalSeconds, onComplete) {
    let remaining = totalSeconds;
    const countdownEl = document.getElementById('dictationCountdown');
    
    if (!countdownEl) return;
    
    // Clear any existing countdown
    if (dictationControl.countdownTimer) {
        clearInterval(dictationControl.countdownTimer);
    }
    
    // Show initial value
    countdownEl.textContent = remaining;
    countdownEl.style.color = '#f5576c';
    
    // Flag to track if countdown sound has been played
    let countdownSoundPlayed = false;
    
    console.log('⏱️ Starting countdown from', remaining, 'seconds');
    
    // Update every second
    dictationControl.countdownTimer = setInterval(() => {
        // Check if paused
        if (dictationControl.isPaused) {
            return; // Don't update while paused
        }
        
        remaining--;
        console.log('⏱️ Countdown tick:', remaining);
        
        if (remaining > 3) {
            // Normal countdown
            countdownEl.textContent = remaining;
            countdownEl.style.color = '#f5576c';
        } else if (remaining === 3 && !countdownSoundPlayed) {
            // Last 3 seconds - play "3、2、1" once
            countdownEl.textContent = remaining;
            countdownEl.style.color = '#ff6b6b';
            
            // Play "3、2、1" as a single utterance with slower speed
            const utterance = new SpeechSynthesisUtterance('3、2、1');
            utterance.lang = 'zh-HK';
            utterance.rate = 0.7;  // Slower speed for better timing
            window.speechSynthesis.speak(utterance);
            
            countdownSoundPlayed = true;
        } else if (remaining > 0) {
            // Just update display, no sound
            countdownEl.textContent = remaining;
            countdownEl.style.color = '#ff6b6b';
        } else {
            // Time's up
            countdownEl.textContent = 'GO!';
            countdownEl.style.color = '#51cf66';
            
            console.log('✅ Countdown finished');
            
            // Clear interval
            clearInterval(dictationControl.countdownTimer);
            dictationControl.countdownTimer = null;
            
            setTimeout(() => {
                if (countdownEl) countdownEl.textContent = '';
            }, 500);
            
            // Call completion callback
            if (onComplete) {
                onComplete();
            }
        }
    }, 1000);
    
    console.log('✅ Countdown timer started');
}

// Helper function to escape JavaScript strings
function escapeJs(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadClassroomDictations();
});
