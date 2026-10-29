# relationship.vip

VIP 感情熱點圖：Lv.50+ VIP 用戶與 7/9 月同樂會到場者，對主播的送禮／私訊關係圖。資料期間 2026/8/1–10/28，來源為 Mixpanel（project 4020883）與同樂會報名表。

## 資料保護

這個 repo 是公開的，所以用戶資料只以加密檔 `data.enc.json` 提交：

- 加密：PBKDF2-SHA256（600,000 次）衍生金鑰 → AES-256-GCM。
- 解密只在瀏覽器裡進行（`index.html`），密碼不會送到任何伺服器，也不在 repo 裡。
- 明文資料放在 `data/`，已被 `.gitignore` 排除，**不要提交**。
- 沒有密碼就無法讀出內容；但拿到密碼的人可以讀全部資料，且無法對單一人撤銷。人員異動時請換密碼（見下方）。

## 更新資料

1. 把新的明文資料存成 `data/heatmap-data.json`（格式：`{ "DATA": {...}, "OLD": [...] }`）。
2. 加密並覆寫 `data.enc.json`：

   ```bash
   HEATMAP_PASSPHRASE='密碼' node scripts/encrypt-data.mjs data/heatmap-data.json data.enc.json
   ```

3. 只提交 `data.enc.json`。

## 更換密碼

用新密碼重新執行上面的加密指令並提交 `data.enc.json`。舊密碼即對新版本失效；但 git 歷史裡的舊加密檔仍可用舊密碼打開，若舊密碼外流，需另外清除歷史或把 repo 改成私人。

## 本機預覽

`index.html` 需要透過 HTTP 讀取 `data.enc.json`，不能直接用 `file://` 開：

```bash
python3 -m http.server 8000
```
