# フィードバック生成メカニズムの設計

## 1. フィードバックテンプレートの設計

### 基本フィードバックテンプレート

```
以下のプロンプトを分析した結果、次のフィードバックを提供します：

【強み】
- [プロンプトの良い点1]
- [プロンプトの良い点2]
- [プロンプトの良い点3]

【改善点】
- [改善すべき点1]
- [改善すべき点2]
- [改善すべき点3]

【最適化バージョン】
[改善を反映した最適化プロンプト]

【解説】
[なぜこの最適化が効果的かの説明]
```

### 詳細フィードバックテンプレート

```
# プロンプト分析レポート

## 評価サマリー
- 明確さ: [1-5の評価] - [コメント]
- 具体性: [1-5の評価] - [コメント]
- 構造化: [1-5の評価] - [コメント]
- 文脈提供: [1-5の評価] - [コメント]
- 制約設定: [1-5の評価] - [コメント]

## 詳細分析

### 強み
1. [強み1]: [説明]
2. [強み2]: [説明]
3. [強み3]: [説明]

### 改善機会
1. [改善点1]: [説明と具体的な改善方法]
2. [改善点2]: [説明と具体的な改善方法]
3. [改善点3]: [説明と具体的な改善方法]

## 最適化プロンプト
```
[最適化されたプロンプト全文]
```

## 改善ポイント解説
- [改善ポイント1]: [なぜ効果的か]
- [改善ポイント2]: [なぜ効果的か]
- [改善ポイント3]: [なぜ効果的か]

## 追加アドバイス
[プロンプト作成に関する一般的なアドバイスや特記事項]
```

### カテゴリ別フィードバックテンプレート

特定のカテゴリや用途に特化したフィードバックテンプレートも用意します：

#### 創作系プロンプト用

```
# 創作プロンプト分析

## 創造性評価
- オリジナリティ: [1-5の評価]
- 表現力: [1-5の評価]
- 構造: [1-5の評価]

## 強みと魅力
[プロンプトの創造的な強みについての分析]

## 発展の可能性
[プロンプトをさらに発展させる方向性の提案]

## 最適化バージョン
[改善を反映した最適化プロンプト]

## クリエイティブアドバイス
[創作プロンプトを作成する際の一般的なアドバイス]
```

#### 技術系プロンプト用

```
# 技術プロンプト分析

## 技術的正確性
- 専門用語の適切さ: [1-5の評価]
- 技術的文脈: [1-5の評価]
- 実装可能性: [1-5の評価]

## 技術的強み
[プロンプトの技術的な強みについての分析]

## 技術的改善点
[技術的な観点からの改善提案]

## 最適化バージョン
[改善を反映した最適化プロンプト]

## 技術的アドバイス
[技術系プロンプトを作成する際の一般的なアドバイス]
```

## 2. 改善提案の生成方法

### 分析アプローチ

プロンプトの改善提案を生成するために、以下の分析アプローチを採用します：

1. **構造分析**
   - プロンプトの構成要素の確認
   - 情報の順序と論理的な流れの評価
   - 段落分けや箇条書きなどの形式的な構造の評価

2. **内容分析**
   - 指示の明確さと具体性の評価
   - 必要な文脈情報の有無の確認
   - 制約条件や期待する出力形式の明示性の評価

3. **言語分析**
   - 使用されている言葉の適切さの評価
   - 曖昧な表現や冗長な部分の特定
   - 専門用語の適切な使用の確認

4. **目的適合性分析**
   - プロンプトの目的に対する適合度の評価
   - 目的達成のための必要要素の有無の確認
   - 目的に対する効率性の評価

### 改善提案の生成ステップ

1. **プロンプトの分類**
   - プロンプトのカテゴリや目的を特定
   - 適切なフィードバックテンプレートの選択

2. **強みの特定**
   - プロンプトの効果的な部分を特定
   - なぜその部分が効果的かを説明

3. **改善点の特定**
   - 構造、内容、言語、目的適合性の観点から改善点を特定
   - 各改善点に対する具体的な修正案を提案

4. **最適化バージョンの作成**
   - 特定された改善点を反映した最適化プロンプトを作成
   - オリジナルの意図を保ちながら改善を加える

5. **解説の追加**
   - 各改善がなぜ効果的かを説明
   - 一般的なプロンプト作成のアドバイスを追加

### メタプロンプトの設計

ChatGPTに効果的なフィードバックを生成させるためのメタプロンプトを設計します：

```
あなたはプロンプトエンジニアリングの専門家です。以下のプロンプトを詳細に分析し、改善のためのフィードバックを提供してください。

【分析対象プロンプト】
{{prompt}}

【分析手順】
1. プロンプトの目的とカテゴリを特定する
2. 構造、内容、言語、目的適合性の観点から分析する
3. プロンプトの強みを3つ以上特定する
4. 改善点を3つ以上特定し、具体的な修正案を提案する
5. 改善を反映した最適化バージョンを作成する
6. 各改善点がなぜ効果的かを説明する

【フィードバック形式】
以下のテンプレートに従ってフィードバックを構成してください：

# プロンプト分析レポート

## 評価サマリー
- 明確さ: [1-5の評価] - [コメント]
- 具体性: [1-5の評価] - [コメント]
- 構造化: [1-5の評価] - [コメント]
- 文脈提供: [1-5の評価] - [コメント]
- 制約設定: [1-5の評価] - [コメント]

## 詳細分析

### 強み
1. [強み1]: [説明]
2. [強み2]: [説明]
3. [強み3]: [説明]

### 改善機会
1. [改善点1]: [説明と具体的な改善方法]
2. [改善点2]: [説明と具体的な改善方法]
3. [改善点3]: [説明と具体的な改善方法]

## 最適化プロンプト
```
[最適化されたプロンプト全文]
```

## 改善ポイント解説
- [改善ポイント1]: [なぜ効果的か]
- [改善ポイント2]: [なぜ効果的か]
- [改善ポイント3]: [なぜ効果的か]

## 追加アドバイス
[プロンプト作成に関する一般的なアドバイスや特記事項]
```

## 3. フィードバック保存と活用の仕組み

### フィードバック保存機能

プロンプト管理システムに以下のフィードバック保存機能を追加します：

```javascript
// フィードバックの保存
function saveFeedback(promptId, feedback) {
    const prompts = getPrompts();
    const index = prompts.findIndex(p => p.id === promptId);
    
    if (index === -1) return false;
    
    prompts[index].feedback = feedback;
    savePrompts(prompts);
    return true;
}

// フィードバック入力フォームの表示
function showFeedbackForm(promptId) {
    const prompts = getPrompts();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (!prompt) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">フィードバックの保存</h3>
                <button class="modal-close">&times;</button>
            </div>
            
            <div class="form-group">
                <label for="feedback-text">フィードバック</label>
                <textarea id="feedback-text" rows="10">${prompt.feedback || ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button id="save-feedback" class="btn btn-primary">保存</button>
                <button id="cancel-feedback" class="btn btn-secondary">キャンセル</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // イベントリスナーの設定
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#cancel-feedback').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#save-feedback').addEventListener('click', () => {
        const feedback = document.getElementById('feedback-text').value;
        if (saveFeedback(promptId, feedback)) {
            showNotification('フィードバックを保存しました', true);
        } else {
            showNotification('フィードバックの保存に失敗しました', false);
        }
        document.body.removeChild(modal);
    });
}
```

### フィードバック活用機能

保存されたフィードバックを活用するための機能を追加します：

```javascript
// フィードバックの表示
function viewFeedback(promptId) {
    const prompts = getPrompts();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (!prompt || !prompt.feedback) {
        showNotification('フィードバックがありません', false);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">フィードバック</h3>
                <button class="modal-close">&times;</button>
            </div>
            
            <div class="form-group">
                <label>プロンプト</label>
                <div style="white-space: pre-wrap; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">${prompt.prompt}</div>
            </div>
            
            <div class="form-group">
                <label>フィードバック</label>
                <div style="white-space: pre-wrap; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">${prompt.feedback}</div>
            </div>
            
            <div class="form-actions">
                <button id="apply-feedback" class="btn btn-primary">最適化プロンプトを適用</button>
                <button id="close-feedback" class="btn btn-secondary">閉じる</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // イベントリスナーの設定
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#close-feedback').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#apply-feedback').addEventListener('click', () => {
        // フィードバックから最適化プロンプトを抽出して適用する機能
        // （実装は省略）
        document.body.removeChild(modal);
    });
}

// フィードバック統計の表示
function showFeedbackStats() {
    const prompts = getPrompts();
    const promptsWithFeedback = prompts.filter(p => p.feedback);
    
    if (promptsWithFeedback.length === 0) {
        showNotification('フィードバックがありません', false);
        return;
    }
    
    // フィードバック統計の計算と表示
    // （実装は省略）
}
```

## 4. フィードバック生成メカニズムの統合

プロンプト管理システムのHTMLファイルに、上記のフィードバック生成メカニズムを統合します。具体的には：

1. 「プロンプト分析」タブに詳細なメタプロンプトテンプレートを追加
2. フィードバック保存機能を実装
3. フィードバック表示・活用機能を実装
4. フィードバック統計機能を実装（オプション）

これにより、ユーザーは保存したプロンプトを分析し、改善フィードバックを得て、それを保存・活用できるようになります。

## 5. 実装上の注意点

1. フィードバックの保存はローカルストレージの容量制限に注意
2. 長文のフィードバックは分割して保存することも検討
3. フィードバックの構造化保存（JSON形式など）も将来的に検討
4. ユーザーの利便性を考慮したUI/UXの設計
5. プライバシーに配慮した実装（センシティブな情報を含むプロンプトの扱い）

以上の設計に基づき、フィードバック生成メカニズムを実装することで、ユーザーはより効果的なプロンプトを作成・改善できるようになります。
