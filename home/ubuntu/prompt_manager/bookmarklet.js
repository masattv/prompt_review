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
  const DEBUG_MODE = true; // デバッグモード
  
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
  
  // デバッグ情報を表示する関数
  function debugLog(message, data = null) {
    if (!DEBUG_MODE) return;
    
    console.log(`[ChatGPT Prompt Manager] ${message}`);
    if (data) console.log(data);
  }
  
  // プロンプトとレスポンスの抽出
  function extractConversation() {
    try {
      debugLog('DOM構造の解析を開始');
      
      // 複数のセレクタを試す
      const possibleSelectors = [
        // 新しいChatGPTインターフェースのセレクタ
        {
          container: 'div[data-testid="conversation-turn-"]',
          roleAttr: 'data-message-author-role',
          contentClass: '.markdown'
        },
        {
          container: 'div[data-testid="conversation-turn"]',
          roleAttr: 'data-message-author-role',
          contentClass: '.markdown'
        },
        {
          container: '.chat-message',
          roleClass: {
            user: '.chat-message-user',
            assistant: '.chat-message-assistant'
          },
          contentClass: '.prose'
        },
        {
          container: '.group',
          roleClass: {
            user: '.whitespace-pre-wrap',
            assistant: '.markdown'
          }
        }
      ];
      
      // 各セレクタを試してみる
      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector.container);
        debugLog(`セレクタ ${selector.container} で ${elements.length} 個の要素を検出`);
        
        if (elements && elements.length > 0) {
          const result = processConversationElements(elements, selector);
          if (result && result.length > 0) {
            debugLog('会話の抽出に成功', result);
            return result;
          }
        }
      }
      
      // DOM構造をデバッグ用に出力
      if (DEBUG_MODE) {
        debugLog('現在のDOM構造', {
          body: document.body.innerHTML.substring(0, 500) + '...',
          mainElement: document.querySelector('main')?.outerHTML.substring(0, 500) + '...'
        });
      }
      
      throw new Error('会話コンテナが見つかりません。ChatGPTのページで実行してください。');
    } catch (error) {
      debugLog('エラー発生', error);
      showNotification('エラー: ' + error.message, false);
      return null;
    }
  }
  
  // 会話要素を処理する関数
  function processConversationElements(elements, selector) {
    const conversations = [];
    let currentPrompt = '';
    let currentResponse = '';
    
    debugLog(`${elements.length}個の会話要素を処理中`);
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      let role = null;
      let contentElement = null;
      
      // 役割（ユーザーかアシスタントか）を特定
      if (selector.roleAttr) {
        role = element.getAttribute(selector.roleAttr);
        debugLog(`役割属性 ${selector.roleAttr} から ${role} を検出`);
      } else if (selector.roleClass) {
        if (element.matches(selector.roleClass.user)) {
          role = 'user';
        } else if (element.matches(selector.roleClass.assistant)) {
          role = 'assistant';
        } else if (element.querySelector(selector.roleClass.user)) {
          role = 'user';
        } else if (element.querySelector(selector.roleClass.assistant)) {
          role = 'assistant';
        }
        debugLog(`クラスから役割 ${role} を検出`);
      }
      
      // コンテンツ要素を特定
      if (selector.contentClass) {
        contentElement = element.querySelector(selector.contentClass);
        if (!contentElement && role === 'user') {
          // ユーザーメッセージの場合、要素自体がコンテンツかもしれない
          contentElement = element;
        }
      }
      
      if (!contentElement) {
        debugLog(`要素 ${i} のコンテンツが見つかりません`, element.outerHTML);
        continue;
      }
      
      const text = contentElement.textContent.trim();
      debugLog(`テキスト抽出: ${text.substring(0, 50)}...`);
      
      if (role === 'user') {
        // ユーザーメッセージ（プロンプト）
        currentPrompt = text;
      } else if (role === 'assistant') {
        // AIメッセージ（レスポンス）
        currentResponse = text;
        
        // プロンプトとレスポンスのペアを保存
        if (currentPrompt) {
          conversations.push({
            prompt: currentPrompt,
            response: currentResponse
          });
          debugLog('会話ペアを追加', { prompt: currentPrompt.substring(0, 50) + '...', response: currentResponse.substring(0, 50) + '...' });
        }
        
        // 変数をリセット
        currentPrompt = '';
        currentResponse = '';
      }
    }
    
    return conversations;
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
    debugLog('ブックマークレット実行開始');
    
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
