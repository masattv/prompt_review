javascript:(function(){
  const STORAGE_KEY = 'chatgpt_prompts';
  const MAX_PROMPTS = 100;
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2,5);
  }
  function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = '#fff';
    notification.style.backgroundColor = isSuccess ? '#4caf50' : '#f44336';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.zIndex = '10000';
    notification.style.transition = 'opacity 0.5s';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
  function extractConversation() {
    try {
      let threadContainer = document.querySelector('[data-testid="conversation-turn-list"]');
      if (!threadContainer) {
        threadContainer = document.querySelector('main');
      }
      if (!threadContainer) {
        throw new Error('会話コンテナが見つかりません。ChatGPTのページで実行してください。');
      }
      // threadContainer 内、または全体からユーザー・アシスタントの発言要素を取得
      let conversationTurns = threadContainer.querySelectorAll('[data-message-author-role]');
      if (conversationTurns.length < 1) {
        conversationTurns = document.querySelectorAll('[data-message-author-role]');
      }
      if (conversationTurns.length < 1) {
        throw new Error('会話が見つかりません。少なくとも1つの質問と回答が必要です。');
      }
      const conversations = [];
      for (let i = 0; i < conversationTurns.length; i++) {
        const turn = conversationTurns[i];
        let roleElem = turn.querySelector('[data-message-author-role]');
        if (!roleElem && turn.hasAttribute('data-message-author-role')) {
          roleElem = turn;
        }
        if (!roleElem) continue;
        const role = roleElem.getAttribute('data-message-author-role');
        let contentElem = turn.querySelector('[data-message-content-source]') ||
                          turn.querySelector('[data-message-content]') ||
                          turn.querySelector('div.markdown');
        if (!contentElem) {
          const text = turn.innerText.trim();
          if (text) {
            contentElem = { textContent: text };
          } else {
            continue;
          }
        }
        const content = contentElem.textContent.trim();
        if (role === 'user') {
          let assistantContent = '';
          // 後続ターンから最初のアシスタント発言を探索
          for (let j = i + 1; j < conversationTurns.length; j++) {
            const nextTurn = conversationTurns[j];
            let nextRoleElem = nextTurn.querySelector('[data-message-author-role]') ||
                               (nextTurn.hasAttribute('data-message-author-role') ? nextTurn : null);
            if (nextRoleElem) {
              const nextRole = nextRoleElem.getAttribute('data-message-author-role');
              if (nextRole === 'assistant') {
                let nextContentElem = nextTurn.querySelector('[data-message-content-source]') ||
                                      nextTurn.querySelector('[data-message-content]') ||
                                      nextTurn.querySelector('div.markdown');
                if (nextContentElem) {
                  assistantContent = nextContentElem.textContent.trim();
                }
                break;
              }
            }
          }
          conversations.push({ prompt: content, response: assistantContent });
        }
      }
      console.log('抽出された会話:', conversations);
      return conversations;
    } catch (error) {
      console.error('抽出エラー:', error);
      showNotification('エラー: ' + error.message, false);
      return null;
    }
  }
  function saveToLocalStorage(conversations) {
    try {
      let storedPrompts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newPrompts = conversations.map(conv => ({
        id: generateId(),
        prompt: conv.prompt,
        response: conv.response,
        timestamp: new Date().toISOString(),
        tags: [],
        feedback: '',
        category: 'デフォルト'
      }));
      storedPrompts = [...newPrompts, ...storedPrompts];
      if (storedPrompts.length > MAX_PROMPTS) {
        storedPrompts = storedPrompts.slice(0, MAX_PROMPTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPrompts));
      return newPrompts.length;
    } catch (error) {
      console.error('保存エラー:', error);
      showNotification('保存エラー: ' + error.message, false);
      return 0;
    }
  }
  function main() {
    const conversations = extractConversation();
    if (!conversations || conversations.length === 0) {
      showNotification('保存するプロンプトが見つかりませんでした。', false);
      return;
    }
    const savedCount = saveToLocalStorage(conversations);
    if (savedCount > 0) {
      showNotification(savedCount + '件のプロンプトを保存しました。');
    } else {
      showNotification('プロンプトの保存に失敗しました。', false);
    }
  }
  main();
})();
