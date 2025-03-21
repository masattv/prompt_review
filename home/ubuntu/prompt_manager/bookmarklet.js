/**
 * ChatGPTプロンプト管理システム - プロンプト収集ブックマークレット
 * 
 * 機能:
 * - ChatGPTのプロンプトと回答を抽出
 * - ローカルストレージに保存
 * - 保存成功時に通知を表示
 */

javascript:(function() {
  // 定数定義
  const STORAGE_KEY = 'chatgpt_prompts';
  const MAX_PROMPTS = 100;
  
  // ユーティリティ関数
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
  
  // プロンプトとレスポンスの抽出
  function extractConversation() {
    try {
      // ChatGPTの会話コンテナを取得
      const conversationContainer = document.querySelector('main > div.flex-1 > div.h-full > div > div');
      
      if (!conversationContainer) {
        throw new Error('会話コンテナが見つかりません。ChatGPTのページで実行してください。');
      }
      
      const conversationElements = conversationContainer.children;
      
      if (conversationElements.length < 3) {
        throw new Error('会話が見つかりません。少なくとも1つの質問と回答が必要です。');
      }
      
      // 会話を抽出（最初の要素はモデル情報、最後の要素は入力欄なので除外）
      const conversations = [];
      let currentPrompt = '';
      let currentResponse = '';
      
      for (let i = 1; i < conversationElements.length - 1; i++) {
        const element = conversationElements[i];
        const text = element.textContent.trim();
        
        // 偶数インデックスはユーザープロンプト、奇数インデックスはAI応答
        if (i % 2 === 1) {
          currentPrompt = text;
        } else {
          currentResponse = text;
          
          // プロンプトとレスポンスのペアを保存
          if (currentPrompt) {
            conversations.push({
              prompt: currentPrompt,
              response: currentResponse
            });
          }
          
          // 変数をリセット
          currentPrompt = '';
          currentResponse = '';
        }
      }
      
      return conversations;
    } catch (error) {
      showNotification('エラー: ' + error.message, false);
      return null;
    }
  }
  
  // ローカルストレージにプロンプトを保存
  function saveToLocalStorage(conversations) {
    try {
      // 既存のプロンプトを取得
      let storedPrompts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      // 新しいプロンプトを追加
      const newPrompts = conversations.map(conv => ({
        id: generateId(),
        prompt: conv.prompt,
        response: conv.response,
        timestamp: new Date().toISOString(),
        tags: [],
        feedback: '',
        category: 'デフォルト'
      }));
      
      // 既存のプロンプトと新しいプロンプトを結合
      storedPrompts = [...newPrompts, ...storedPrompts];
      
      // 上限を超えた場合は古いプロンプトを削除
      if (storedPrompts.length > MAX_PROMPTS) {
        storedPrompts = storedPrompts.slice(0, MAX_PROMPTS);
      }
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPrompts));
      
      return newPrompts.length;
    } catch (error) {
      showNotification('保存エラー: ' + error.message, false);
      return 0;
    }
  }
  
  // メイン処理
  function main() {
    // 会話を抽出
    const conversations = extractConversation();
    
    if (!conversations || conversations.length === 0) {
      showNotification('保存するプロンプトが見つかりませんでした。', false);
      return;
    }
    
    // ローカルストレージに保存
    const savedCount = saveToLocalStorage(conversations);
    
    if (savedCount > 0) {
      showNotification(`${savedCount}件のプロンプトを保存しました。`);
    } else {
      showNotification('プロンプトの保存に失敗しました。', false);
    }
  }
  
  // 実行
  main();
})();
