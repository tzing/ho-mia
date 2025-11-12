# Agent 規則與偏好設定

此文件用於記錄專案開發過程中的規則、偏好設定和重要決策。

## 規則記錄原則

- 當用戶要求記住某些規則時，必須更新此文件
- 所有規則都應該清楚明確地記錄在此文件中
- 在執行任何任務時，應該參考此文件中的規則
- **規則時間戳記**：不在此文件中記錄時間，時間資訊依賴 Git 版本控制
- **規則累加**：所有規則必須累加記錄，不得刪除舊規則
- **規則衝突處理**：當新規則與現有規則發生衝突時，必須向用戶提出並進行釋義，不得自行決定

## 已記錄的規則

### 規則記錄機制
- **規則**：當用戶要求記住某些規則時，必須更新 `AGENTS.md` 文件
- **來源**：用戶明確要求
- **適用範圍**：整個開發工作流程

### 專案架構維護規範
- **規則**：必須在 `AGENTS.md` 內維護現行的專案框架於元件間的關係，這些說明要足以讓開發者僅依靠該文件判斷各種不同的功能會被實作於哪裡，當發生各種重構，需要即時更新該框架說明
- **來源**：用戶明確要求
- **適用範圍**：整個專案開發
- **詳細說明**：
  - 專案架構說明應包含：專案結構、模組職責說明、資料流向、功能實作位置判斷指南、模組間依賴關係、重構注意事項
  - 當進行重構時，必須同步更新架構說明文件
  - 架構說明應足夠詳細，讓開發者能夠快速定位功能的實作位置

### 模組架構審查規範
- **規則**：當在各個模組內發生編輯時，被鼓勵於隨時回顧該模組內的架構，被鼓勵於提出意見表達哪些函數應該被重構，進而減少複雜性
- **來源**：用戶明確要求
- **適用範圍**：整個專案開發
- **詳細說明**：
  - 在編輯模組時，應主動審查該模組的架構設計
  - 識別可以重構的函數或邏輯，特別是複雜度較高的部分
  - 提出重構建議，以降低複雜性、提高可維護性
  - 重構應遵循單一職責原則，確保模組職責清晰

## 專案特定規則

### 程式碼與 UI 語言規範
- **規則**：所有程式碼和註解必須使用英文，UI 上的內容/描述必須使用台灣繁體中文
- **來源**：用戶明確要求
- **適用範圍**：整個專案開發
- **詳細說明**：
  - 程式碼變數、函數名稱、註解、錯誤訊息等必須使用英文
  - HTML 中顯示給使用者看的文字內容必須使用台灣繁體中文
  - JSON 資料檔案中的資料內容使用繁體中文（若為使用者可見內容）
  - 程式碼註解使用英文
  - 說明文件（如 README）使用台灣繁體中文
  - **程式碼中避免使用中文混雜**：程式碼中不得出現中文字符，包括變數名、函數名、註解等
  - **術語翻譯規範**：當命令語句中出現中文詞彙時，必須向開發者詢問並記錄適當的英語翻譯
  - **術語對照表**：所有中英文術語對照應記錄在「術語對照表」區段中，以供後續開發參考

### 名字輸入設計規範
- **規則**：預設名字為 3 個字，必須能夠處理 2 字或 4 字的狀況
- **來源**：用戶明確要求
- **適用範圍**：名字輸入介面設計
- **詳細說明**：
  - 多數情況下使用者只輸入姓氏 1 字
  - 輸入框右方保有代位符作為視覺引導
  - 輸入 1 字跟輸入 3 字時佔據的畫面是相同的
  - 名字輸入框是網頁的核心，之後會追加各種引導

### 輸入驗證與錯誤處理規範
- **規則**：不直接拒絕使用者輸入，顯示錯誤提示讓使用者自己刪除文字；當有驗證錯誤發生時不開始計算
- **來源**：用戶明確要求
- **適用範圍**：名字輸入驗證與計算功能
- **詳細說明**：
  - 當使用者輸入非中文字符時，顯示錯誤提示但不自動刪除
  - 錯誤提示需要維持久一點（至少 5 秒）
  - 後續進行計算時，必須先驗證輸入是否有效，有驗證錯誤則不開始計算
  - 需要處理 IME 輸入法組合輸入狀態，避免在輸入過程中觸發錯誤提示

### 姓名結構解析規範
- **規則**：根據輸入字數判斷姓名結構
- **來源**：用戶明確要求
- **適用範圍**：姓名結構解析與標注功能
- **詳細說明**：
  - 當輸入字數為 1 時，視為 1 字姓氏已輸入，但名字尚未輸入完整（視為 3 字結構的單姓雙名，但名字部分待輸入）
  - 當輸入字數為 2 時，視為 1 字姓氏 + 1 字名字（單姓單名）
  - 當輸入字數為 3 時，視為 1 字姓氏 + 2 字名字（單姓雙名）
  - 當輸入字數為 4 時，視為 2 字姓氏 + 2 字名字（複姓雙名）
  - 單一數字輸入：當使用者僅輸入單一數字（如 "1"）時，視為不合格輸入，此情況需要透過後續 UI 設計來避免發生

### 名字位置數字輸入規範
- **規則**：主要輸入框允許使用者在名字位置輸入數字，數字視為該位置的筆畫數
- **來源**：用戶明確要求
- **適用範圍**：名字輸入與筆畫數處理功能
- **詳細說明**：
  - 姓氏位置：只允許輸入中文字符，不允許輸入數字
  - 名字位置：允許輸入中文字符或數字
  - 數字輸入：當名字位置輸入數字時，該數字視為該位置的筆畫數
  - 多位數筆畫數：系統需要考慮筆畫數可能為雙位數（如 10、15、20 等）的情況
  - 連續數字識別：連續的數字字符應被識別為一個筆畫數單位（如 "15" 表示 15 筆畫）
  - 中間位置修改：系統應考慮到使用者可能會修改中間位置內容的行為，確保在修改時能正確解析數字序列
  - 數字與中文混合：名字位置可以混合輸入中文字和數字（例如："王 12 3" 表示姓氏"王"，名字第一個字為12筆畫，第二個字為3筆畫，每個位置對應一個中文字符或一個數字序列）
  - 輸入解析：系統需要將輸入解析為姓名結構，其中每個位置對應一個中文字符或一個數字序列（多位數）
  - 數字輸入情境：目前尚未實作如何產生這種輸入方式（如空格分隔的數字），但需要預先考慮並準備處理這種情境

### 響應式網頁設計規範（RWD）
- **規則**：專案需要考慮 RWD（Responsive Web Design，響應式網頁設計）
- **來源**：用戶明確要求
- **適用範圍**：整個專案開發
- **詳細說明**：
  - 所有 UI 元件必須支援響應式設計，確保在不同裝置和螢幕尺寸下都能正常顯示和使用
  - 使用 CSS Media Queries 實作響應式佈局
  - 優先考慮行動裝置體驗（Mobile First），然後擴展到平板和桌面裝置
  - 響應式斷點建議：
    - 手機（小螢幕）：< 480px
    - 平板（中等螢幕）：480px - 768px
    - 桌面（大螢幕）：> 768px
  - 字體大小應使用相對單位（rem、em）或 clamp() 函數，確保在不同裝置上可讀性
  - 圖片和媒體內容應使用響應式屬性（如 max-width: 100%）
  - 觸控裝置需要考慮適當的點擊目標大小（建議至少 44x44px）
  - 輸入框和互動元素在不同螢幕尺寸下應保持易用性
  - 測試時需要考慮橫向和縱向螢幕方向

## 技術決策記錄

### 開發工具選擇
- **Vite**：用於開發伺服器，支持 HMR（熱模塊替換）
- **版本**：7.2.2
- **原因**：
  - 原生支持 ES Modules，便於模組化開發
  - 支持 HMR（熱模塊替換），按模組更新，開發體驗佳
  - 不需要框架或特殊配置，適合 Vanilla JS 專案
  - 構建輸出為靜態檔案，部署簡單
  - 開發伺服器啟動快速，熱更新響應快
  - 使用 esbuild 進行快速構建和壓縮
  - 自動處理靜態資源（public 目錄）
- **配置最佳實踐**：
  - 使用 `public/` 目錄存放靜態資源（如 JSON 資料檔案）
  - 啟用 source maps 以便生產環境除錯
  - 使用 esbuild 進行代碼壓縮（比 terser 更快）
  - 配置適當的 chunk size 警告限制

### 核心技術
- **HTML5 + CSS3 + Vanilla JavaScript**：不使用前端框架
- **原因**：輕量、靜態部署友好、計算需求簡單

### 程式碼組織規範
- **規則**：程式碼必須有妥善的分層與功能分組，避免所有邏輯集中在單一檔案
- **來源**：用戶明確要求
- **適用範圍**：整個專案開發
- **詳細說明**：
  - 使用 ES Modules 進行模組化
  - 按功能劃分模組（輸入處理、驗證、顯示、UI 互動等）
  - 工具函數獨立成工具模組
  - 主入口檔案（main.js）僅負責初始化與模組協調
  - 每個模組職責單一，便於維護與測試

### 資料與樣式處理規範
- **規則**：專案偏好儘量使用原生的方式保有資料，及當一段 layout 可以單純 HTML 及 CSS 時就保留於 HTML 端而非實時生成；當一個物件有需要被重新渲染的時候可以 JS 產出但仍使用 CSS class 控制外觀，而非透過 JS 計算
- **來源**：用戶明確要求
- **適用範圍**：整個專案開發
- **詳細說明**：
  - 優先使用 HTML 和 CSS 實作靜態 layout，避免不必要的 JavaScript 生成
  - 資料應儲存在 DOM 元素的原生屬性中（如 data-* 屬性、input.value 等）
  - 當需要動態生成元素時，使用 JavaScript 創建，但外觀控制應透過 CSS class 而非 JavaScript 計算樣式
  - 避免使用 JavaScript 直接設置 style 屬性（如 element.style.width = '100px'），應使用 class 切換（如 element.classList.add('active')）
  - 樣式計算應在 CSS 中完成，JavaScript 僅負責添加/移除 class 來觸發樣式變化
  - 保持 HTML 結構清晰，CSS 負責視覺呈現，JavaScript 負責互動邏輯

### 資料存儲
- **JSON 檔案**：用於參數資料表
- **位置**：`public/data/` 目錄（Vite 會自動複製到 `dist/` 目錄）
- **原因**：
  - 靜態、易維護、版本控制友好
  - 使用 `public/` 目錄確保生產環境可以正常訪問
  - 通過 `fetch` 實現懶加載，不影響初始載入速度
- **訪問方式**：透過 `/data/characters.json` 路徑訪問（開發和生產環境一致）

## 術語對照表

本節記錄專案中涉及的中英文術語對照，用於確保程式碼中使用的英文術語一致且正確。

### 五格相關術語

| 中文 | 英文 | 備註 |
|------|------|------|
| 五格 | five grids | 姓名學中的五個格位 |
| 天格 | Heaven Grid | |
| 人格 | Personality Grid | |
| 地格 | Earth Grid | |
| 總格 | Total Grid | |
| 外格 | Outer Grid | |

### 五行相關術語

| 中文 | 英文 | 備註 |
|------|------|------|
| 五行 | five elements | 五種基本元素 |
| 金 | metal | |
| 木 | wood | |
| 水 | water | |
| 火 | fire | |
| 土 | earth | |

**注意**：當開發過程中遇到新的中文術語需要翻譯時，應向開發者詢問並將對照關係記錄在此表中。

## 專案架構說明

本節說明專案的整體架構、模組間的關係與資料流向，用於判斷各種功能的實作位置。

### 專案結構

```
chinese-nameology/
├── public/              # 靜態資源目錄（Vite 會自動複製到 dist/）
│   └── data/           # 資料檔案目錄
│       └── characters.json  # 字符筆畫與五行資料
├── scripts/            # JavaScript 程式碼目錄
│   ├── main.js        # 應用程式入口點
│   ├── modules/       # 功能模組
│   │   ├── display.js      # 顯示邏輯
│   │   ├── inputHandler.js # 輸入處理
│   │   ├── annotationSetup.js # 基礎註釋線初始化
│   │   ├── fiveGridsCoordinator.js # 五格計算協調器
│   │   ├── ui.js           # UI 元件
│   │   └── annotationLine.js # 註釋線元件
│   └── utils/         # 工具函數
│       ├── chinese.js      # 中文字符處理
│       ├── strokes.js      # 筆畫數查詢
│       ├── fiveGrids.js     # 五格計算與 entry 解析工具
│       └── validation.js   # 輸入驗證
├── styles/            # CSS 樣式目錄
│   └── main.css      # 主樣式檔案
├── dist/              # 構建輸出目錄（自動生成）
├── index.html         # 應用程式 HTML 入口
├── vite.config.js     # Vite 配置檔案
└── package.json       # 專案依賴與腳本
```

### 模組職責說明

- **main.js**：應用程式入口點，負責初始化所有模組並協調應用程式啟動
- **modules/display.js**：負責名字顯示邏輯，處理字符槽位的更新
- **modules/inputHandler.js**：處理使用者輸入事件，維護 `entries` 序列狀態（包含代位符與文字），協調輸入驗證、顯示更新並提供 `insertPlaceholder`、`getEntries`、`onEntriesChange` 等 API
- **modules/annotationSetup.js**：監聽 `InputHandler` 的 entries 變化，透過 `AnnotationManager` 建立並維護基礎註釋線範圍，同步觸發五格計算並更新線上 badge，對外暴露 `window.getFiveGridResult`
- **modules/grids/**：五格 Grid 類別，定義總格/外格/天格/地格/人格的匡選範圍解析與計算入口
- **modules/fiveGridsPanel.js**：管理五格分析面板，綁定徽章區塊並顯示筆畫、五行與吉凶資訊
- **modules/fiveGridsCoordinator.js**：五格計算協調器，維護計算結果快取與全域存取，透過 `modules/grids/` 的 Grid 類別協調範圍與 `utils/fiveGrids.js` 的工具函式執行各格計算（目前為總格、天格）
- **modules/threeTalentsPanel.js**：負責三才（天、人、地）五行徽章展示，訂閱輸入變化並根據最新五格結果更新 badge
- **modules/ui.js**：UI 元件（錯誤訊息、輸入提示等）
- **modules/annotationLine.js**：註釋線管理元件，負責註釋線的建立、堆疊與位置更新
- **utils/chinese.js**：中文字符處理工具函數
- **utils/strokes.js**：筆畫數與五行查詢，從 `public/data/characters.json` 載入資料
- **utils/fiveGrids.js**：五格計算與 entry 解析工具，提供可計算條目判斷、姓氏拆分、筆畫加總、陰陽五行推導等共用函式
- **utils/validation.js**：輸入驗證邏輯，註冊全域驗證函數
- **utils/placeholders.js**：管理代位符專用的 PUA 字元常數、判斷工具與 metadata 序列化邏輯
- **函數精簡規則**：避免建立僅包裝其他函數呼叫或簡單回傳物件的極短函數（如只呼叫一次 `createResult`），改於呼叫端直接建立結果物件

### 資料流向

1. **資料載入**：`utils/strokes.js` 透過 `fetch('/data/characters.json')` 載入字符資料
2. **使用者輸入**：`inputHandler.js` 接收使用者輸入事件並同步更新 `entries` 序列（代位符會以 PUA 字元儲存在 `<input>`，並於 `entries` 中保留 metadata）
3. **輸入驗證**：`validation.js` 驗證輸入是否為有效的中文字符或專案定義的代位符
4. **資料查詢**：`strokes.js` 查詢字符的筆畫數與五行屬性，`display.js` 與 `inputHandler.js` 於需要時呼叫
5. **顯示更新**：`display.js` 讀取 `entries`，以 data-* 屬性掛載 metadata 並套用 placeholder 樣式
6. **註釋線與五格更新**：`annotationSetup.js` 透過 `inputHandler.onEntriesChange` 取得最新 entries，先用 `utils/fiveGrids.js` 解析可計算條目與姓氏資訊，再交給 `FiveGridsCoordinator` 執行各格計算（透過 `modules/grids/` 與 `utils/fiveGrids.js`），最後同步 `annotationLine.js` 的註釋線範圍與 badge
7. **三才徽章呈現**：`threeTalentsPanel.js` 透過 `window.getFiveGridResult` 取得天格、人格、地格的最新五行元素，更新三才徽章並顯示於內容區塊
8. **資料輸出**：外部模組可透過 `window.getNameEntries()`（代理 `inputHandler.getEntries()`）取得含 metadata 的物件陣列，亦可使用 `window.getFiveGridResult(gridKey)` 取得單一格局的最新計算結果

### 功能實作位置判斷指南

- **輸入處理**：`modules/inputHandler.js`
- **輸入驗證**：`scripts/utils/validation.js`
- **字符顯示**：`modules/display.js`
- **註釋線控制**：`modules/annotationLine.js`
- **基礎註釋線同步**：`modules/annotationSetup.js`
- **筆畫數查詢**：`scripts/utils/strokes.js`
- **UI 元件**：`modules/ui.js`
- **中文字符處理**：`scripts/utils/chinese.js`
- **資料檔案**：`public/data/characters.json`

### 模組間依賴關係

- `main.js` → `modules/*`、`utils/*`
- `main.js` → `modules/annotationLine.js`、`modules/annotationSetup.js`、`modules/fiveGridsPanel.js`、`modules/threeTalentsPanel.js`
- `inputHandler.js` → `utils/validation.js`、`modules/display.js`、`modules/ui.js`、`utils/placeholders.js`、`utils/strokes.js`
- `display.js` → `utils/strokes.js`、`utils/chinese.js`、`utils/placeholders.js`
- `annotationSetup.js` → `modules/annotationLine.js`、`modules/inputHandler.js`、`modules/fiveGridsCoordinator.js`、`modules/grids/`、`utils/fiveGrids.js`
- `modules/fiveGridsCoordinator.js` → `modules/grids/`、`utils/fiveGrids.js`
- `modules/grids/*` → `utils/fiveGrids.js`
- `modules/fiveGridsPanel.js` → `utils/numerology.js`、`window.getFiveGridResult`
- `modules/threeTalentsPanel.js` → `window.getFiveGridResult`
- `strokes.js` → `public/data/characters.json`（透過 fetch）

### 重構注意事項

- **模組職責單一**：每個模組應只負責一個明確的功能領域
- **依賴方向**：工具模組（utils）不應依賴功能模組（modules）
- **資料流**：資料應透過函數參數傳遞，避免全域狀態
- **DOM 資料**：字符資料儲存在 DOM 屬性中（包含代位符 metadata），五格實例儲存在 Annotation 類別中
- **代位符狀態**：代位符使用 `\uE000`（PUA）作為內部儲存字元，所有 metadata 需透過 `entries` 與 `data-*` 屬性同步；新增或刪除代位符須透過 `InputHandler` API，避免遺失 metadata
