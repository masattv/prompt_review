javascript:(function(){
  const STORAGE_KEY = 'chatgpt_prompts';
  const MAX_PROMPTS = 100;
  const DEBUG = true;
  
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2,5);
  }
  
  function log(message, obj) {
    if (DEBUG) {
      console.log(`[ChatGPT Extractor] ${message}`, obj || '');
    }
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
  
  function analyzePageStructure() {
    log('ページ構造を分析します');
    
    // 現在のページのタイトルを確認
    const title = document.title;
    log('ページタイトル:', title);
    
    // ChatGPT関連の要素を探す
    const hasChatGPTElements = 
      document.querySelector('[data-testid*="conversation"]') ||
      document.querySelector('[class*="chat"]') ||
      document.querySelector('[aria-label*="chat"]') ||
      document.querySelector('[placeholder*="Message"]') ||
      document.querySelector('[data-message-author-role]');
    
    log('ChatGPT要素の存在:', !!hasChatGPTElements);
    
    // 代表的なChatGPT要素のクラス名や属性を収集
    const interestingElements = [
      ...document.querySelectorAll('main div'),
      ...document.querySelectorAll('[class*="chat"]'),
      ...document.querySelectorAll('[class*="message"]'),
      ...document.querySelectorAll('[class*="conversation"]')
    ].slice(0, 20);
    
    log('興味深い要素の属性:', interestingElements.map(el => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      dataAttrs: [...el.attributes]
        .filter(attr => attr.name.startsWith('data-'))
        .map(attr => `${attr.name}="${attr.value}"`)
    })));
    
    return hasChatGPTElements;
  }
  
  function extractConversation() {
    try {
      log('会話の抽出を開始します');
      
      // ChatGPTページであるか確認
      if (!analyzePageStructure()) {
        throw new Error('ChatGPTのページではないようです。ChatGPTで開いて実行してください。');
      }
      
      // 様々なセレクタを試す
      const selectors = [
        // 新しいChatGPTインターフェース
        {
          containerSelector: '[data-testid="conversation-turn-list"]',
          turnSelector: '[data-testid^="conversation-turn-"]',
          roleAttribute: 'data-message-author-role',
          contentSelectors: [
            '[data-message-content-source]', 
            '[data-message-content]', 
            'div.markdown',
            '.text-message-content'
          ]
        },
        // 別バージョン
        {
          containerSelector: 'main',
          turnSelector: '[data-message-author-role]',
          roleAttribute: 'data-message-author-role',
          contentSelectors: [
            '.markdown', 
            '[data-message-content]',
            '.whitespace-pre-wrap'
          ]
        },
        // GPT-4バージョン
        {
          containerSelector: '.chat-pg',
          turnSelector: '.chat-message',
          roleClassMap: {
            'chat-message-user': 'user',
            'chat-message-assistant': 'assistant'
          },
          contentSelectors: ['.prose', '.chat-content']
        },
        // Web UI バージョン
        {
          containerSelector: 'main',
          turnSelector: '.group',
          roleClassMap: {
            'bg-gray-50': 'user',
            'markdown': 'assistant'
          },
          contentSelectors: ['.whitespace-pre-wrap', '.markdown']
        },
        // フォールバック - ページ全体から探す
        {
          containerSelector: 'body',
          turnSelector: 'div',
          textBasedRoleDetection: true,
          contentSelectors: ['.whitespace-pre-wrap', '.markdown', 'p', 'div']
        }
      ];
      
      // すべてのセレクタを試す
      let conversations = [];
      for (const selector of selectors) {
        log('セレクタを試行:', selector);
        
        const container = document.querySelector(selector.containerSelector);
        if (!container) {
          log(`コンテナが見つかりません: ${selector.containerSelector}`);
          continue;
        }
        
        log('コンテナが見つかりました:', container);
        
        // ターン要素を取得
        let turns = container.querySelectorAll(selector.turnSelector);
        if (turns.length === 0 && selector.containerSelector !== 'body') {
          // コンテナ内で見つからない場合は、ページ全体から検索
          turns = document.querySelectorAll(selector.turnSelector);
        }
        
        log(`${turns.length}個のターン要素が見つかりました`);
        
        if (turns.length > 0) {
          conversations = extractFromTurns(turns, selector);
          if (conversations.length > 0) {
            log('会話の抽出に成功しました', conversations);
            return conversations;
          }
        }
      }
      
      // テキストベースのフォールバック抽出
      log('テキストベースのフォールバック抽出を試みます');
      conversations = extractByTextPatterns();
      if (conversations.length > 0) {
        return conversations;
      }
      
      throw new Error('会話コンテナが見つかりません。ChatGPTのページで実行してください。');
    } catch (error) {
      console.error('抽出エラー:', error);
      showNotification('エラー: ' + error.message, false);
      return null;
    }
  }
  
  function extractFromTurns(turns, selector) {
    const conversations = [];
    log(`${turns.length}個のターン要素から会話を抽出します`);
    
    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      let role = null;
      
      // 役割の特定
      if (selector.roleAttribute) {
        // 属性ベースの役割特定
        let roleElem = turn.querySelector(`[${selector.roleAttribute}]`);
        if (!roleElem && turn.hasAttribute(selector.roleAttribute)) {
          roleElem = turn;
        }
        if (roleElem) {
          role = roleElem.getAttribute(selector.roleAttribute);
        }
      } else if (selector.roleClassMap) {
        // クラスベースの役割特定
        for (const [className, roleValue] of Object.entries(selector.roleClassMap)) {
          if (turn.classList.contains(className) || turn.querySelector(`.${className}`)) {
            role = roleValue;
            break;
          }
        }
      } else if (selector.textBasedRoleDetection) {
        // テキストベースの役割推測
        const text = turn.textContent.trim().toLowerCase();
        if (text.match(/^(you|user|human):|^me:/)) {
          role = 'user';
        } else if (text.match(/^(chatgpt|assistant|ai):|^gpt:/)) {
          role = 'assistant';
        }
      }
      
      if (!role) {
        log(`ターン${i}の役割を特定できませんでした`, turn);
        continue;
      }
      
      log(`ターン${i}の役割: ${role}`);
      
      // コンテンツの特定
      let content = null;
      for (const contentSelector of selector.contentSelectors) {
        const contentElem = turn.querySelector(contentSelector);
        if (contentElem) {
          content = contentElem.textContent.trim();
          break;
        }
      }
      
      // コンテンツが見つからない場合はターン全体のテキストを使用
      if (!content) {
        content = turn.textContent.trim();
      }
      
      if (!content) {
        log(`ターン${i}のコンテンツが空です`);
        continue;
      }
      
      log(`ターン${i}のコンテンツ: ${content.substring(0, 50)}...`);
      
      if (role === 'user') {
        let assistantContent = '';
        // 後続ターンから最初のアシスタント発言を探索
        for (let j = i + 1; j < turns.length; j++) {
          const nextTurn = turns[j];
          let nextRole = null;
          
          // 次のターンの役割を特定
          if (selector.roleAttribute) {
            let nextRoleElem = nextTurn.querySelector(`[${selector.roleAttribute}]`);
            if (!nextRoleElem && nextTurn.hasAttribute(selector.roleAttribute)) {
              nextRoleElem = nextTurn;
            }
            if (nextRoleElem) {
              nextRole = nextRoleElem.getAttribute(selector.roleAttribute);
            }
          } else if (selector.roleClassMap) {
            for (const [className, roleValue] of Object.entries(selector.roleClassMap)) {
              if (nextTurn.classList.contains(className) || nextTurn.querySelector(`.${className}`)) {
                nextRole = roleValue;
                break;
              }
            }
          }
          
          if (nextRole === 'assistant') {
            // アシスタントの応答コンテンツを取得
            for (const contentSelector of selector.contentSelectors) {
              const contentElem = nextTurn.querySelector(contentSelector);
              if (contentElem) {
                assistantContent = contentElem.textContent.trim();
                break;
              }
            }
            
            if (!assistantContent) {
              assistantContent = nextTurn.textContent.trim();
            }
            
            break;
          }
        }
        
        // プロンプトとレスポンスのペアを追加
        conversations.push({ prompt: content, response: assistantContent });
        log('会話ペアを追加:', { 
          prompt: content.substring(0, 50) + (content.length > 50 ? '...' : ''), 
          response: assistantContent.substring(0, 50) + (assistantContent.length > 50 ? '...' : '') 
        });
      }
    }
    
    return conversations;
  }
  
  function extractByTextPatterns() {
    log('テキストパターンによる抽出を開始');
    const conversations = [];
    
    // ページ全体のテキストを取得
    const text = document.body.innerText;
    
    // ユーザーとアシスタントのパターンを探す
    const userPattern = /(?:User|You):\s*(.*?)(?=\n\s*(?:Assistant|ChatGPT|AI):|$)/gs;
    const assistantPattern = /(?:Assistant|ChatGPT|AI):\s*(.*?)(?=\n\s*(?:User|You):|$)/gs;
    
    let userMatches = Array.from(text.matchAll(userPattern));
    let assistantMatches = Array.from(text.matchAll(assistantPattern));
    
    log(`テキストパターンで${userMatches.length}個のユーザーメッセージと${assistantMatches.length}個のアシスタントメッセージを検出`);
    
    // ユーザーメッセージとそれに対応するアシスタントメッセージをペアにする
    for (let i = 0; i < userMatches.length; i++) {
      const userText = userMatches[i][1].trim();
      let assistantText = '';
      
      if (i < assistantMatches.length) {
        assistantText = assistantMatches[i][1].trim();
      }
      
      if (userText) {
        conversations.push({
          prompt: userText,
          response: assistantText
        });
      }
    }
    
    return conversations;
  }
  
  function saveToLocalStorage(conversations) {
    try {
      log('会話の保存を開始');
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
      log(`${newPrompts.length}件の会話を保存しました`);
      return newPrompts.length;
    } catch (error) {
      console.error('保存エラー:', error);
      showNotification('保存エラー: ' + error.message, false);
      return 0;
    }
  }
  
  function main() {
    log('ブックマークレット実行開始');
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
