// 门禁 PIN 初始化：如果数据目录里还没有 auth.json，就从环境变量 GATE_PIN 建一个。
// 这样部署方不用通过网页表单设定 PIN，代码里也不会出现明文。
// 已有 PIN 时什么都不做，避免覆盖用户自己设过的。
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = process.env.DUETTO_DATA_DIR || path.join(path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), 'data');
const authFile = path.join(dataDir, 'auth.json');

try {
  const pin = String(process.env.GATE_PIN || '').trim();
  if (!pin) {
    // 没配就静默，走原先前端设定流程
  } else if (fs.existsSync(authFile)) {
    // 已经设过，不动
  } else if (pin.length < 4) {
    console.log('[gate-init] GATE_PIN 少于 4 位，跳过');
  } else {
    fs.mkdirSync(dataDir, { recursive: true });
    const salt = crypto.randomBytes(16).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    const hash = crypto.scryptSync(pin, salt, 32).toString('hex');
    const payload = JSON.stringify({ salt, hash, secret, created: Date.now() });
    const tmp = authFile + '.tmp';
    fs.writeFileSync(tmp, payload, { mode: 0o600 });
    fs.renameSync(tmp, authFile);
    console.log('[gate-init] 已从 GATE_PIN 建好门禁 PIN');
  }
} catch (e) {
  console.log('[gate-init] 初始化失败：', e.message);
}
