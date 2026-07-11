#!/bin/bash
# 對開機模擬器內 $wish app 的 watermelon.db 下 SQL。
# 動態定位容器，免手貼路徑。軟刪過濾由呼叫端 SQL 自帶。
#
# 用法：
#   qa_tools/dbq.sh "SELECT * FROM accounts WHERE _status != 'deleted';"
#   qa_tools/dbq.sh --path        只印 db 路徑
#   qa_tools/dbq.sh --tables      列出所有表
#
# 依賴：已開機模擬器、app 至少啟動過一次讓 db 生成。

set -euo pipefail

BUNDLE="com.almightyken0425.susugigiapp"

container=$(xcrun simctl get_app_container booted "$BUNDLE" data 2>/dev/null || true)
if [ -z "$container" ]; then
  echo "找不到 app 容器：模擬器未開機或 app 未安裝" >&2
  exit 1
fi

# -print -quit 找到第一個即停，避免 find | head 在 pipefail 下的 SIGPIPE 中止。
db=$(find "$container/Documents" -name "watermelon.db" -print -quit 2>/dev/null)
if [ -z "$db" ]; then
  echo "找不到 watermelon.db：app 未啟動過或路徑改變" >&2
  exit 1
fi

case "${1:-}" in
  --path)
    echo "$db"
    ;;
  --tables)
    sqlite3 "$db" ".tables"
    ;;
  "")
    echo "缺 SQL 參數。用法見檔頭。" >&2
    exit 1
    ;;
  *)
    sqlite3 "$db" "$1"
    ;;
esac
