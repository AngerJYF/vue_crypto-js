const CryptoJS = require('crypto-js');

function SourceSDK({ secret = '', aesKey = '' }) {
  this.secret = secret; // 用于签名（HMAC/MD5）
  this.aesKey = aesKey || secret; // 用于 AES 加密（可分离）
}

// 🔒 生成签名（可选用 HMAC-SHA256 或 MD5）
SourceSDK.prototype._sign = function (payload) {
  const message = JSON.stringify(payload);
  return CryptoJS.MD5(message + this.secret).toString(); // 也可换成 HMAC-SHA256
};

// 🔐 加密数据
SourceSDK.prototype._encrypt = function (data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), this.aesKey).toString();
};

// 🔓 解密数据（供调试）
SourceSDK.prototype._decrypt = function (ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, this.aesKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// 🚀 上报事件
SourceSDK.prototype.track = function (event, data = {}) {
  const payload = {
    event,
    data,
    timestamp: Date.now(),
  };

  const sign = this._sign(payload);
  const signedPayload = { ...payload, sign };
  console.log('签名：————————', sign);
  console.log('加密前参数：————————', payload);

  const encrypted = this._encrypt(signedPayload);

  // 示例打印
  console.log('[SDK] Encrypted payload:', encrypted);

  // 可 POST 给服务端
  // fetch('/api/report', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'text/plain' },
  //   body: encrypted
  // });

  return encrypted;
};

// 通用导出（兼容 CommonJS 和 ESModule）
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SourceSDK;
} else {
  window.JYFSDK = SourceSDK;
}