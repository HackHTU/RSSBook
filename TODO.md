BOOKS
Parse
test suits

- **`src/books/index.ts`**
  - **Issue**: `getCachedBooksData` 中有 `// TODO:` 注释，未说明缓存策略（key 命名、TTL、缓存失效与错误回退）。
  - **Impact**: 缓存不明确可能导致过期数据、内存泄漏或不可控刷新时机。
  - **Fix**: 明确缓存键、添加 TTL 参数或 expose 配置；在 fetch 或 parse 失败时实现回退（例如返回上次成功值或部分可用数据）；补充注释并编写测试。
  - **Priority**: 高


