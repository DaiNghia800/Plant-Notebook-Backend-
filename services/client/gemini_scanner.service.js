'use strict';

const { GeminiKey } = require('../../models');
const { Op } = require('sequelize');

class GeminiScannerService {
  constructor() {
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.prompt = 
      'Nhan dien va phan tich cay trong anh nay.\n' +
      'Neu khong chac chan ve loai cay, hay ghi ten pho thong la "Chua xac dinh duoc loai cay" va ten khoa hoc la "Khong ro".\n' +
      'Tra ve JSON (KHONG markdown, KHONG text ngoai JSON):\n' +
      '{"ten_pho_thong":"<ten tieng Viet>","ten_khoa_hoc":"<Ten Latin>","tinh_trang_suc_khoe":"<Tot|Kha tot|Trung binh|Dang yeu|Dang mac benh>","benh_dang_gap":"<ten benh + nguyen nhan ngan, hoac Khong phat hien benh>","loi_khuyen_cham_soc":"<2-3 cau cu the: nuoc, anh sang, dat, phan bon>","ban_co_biet":"Ban co biet... <1-2 cau thu vi ve cay nay>"}\n' +
      'TAT CA noi dung PHAI la tieng Viet co dau. KHONG chen bat ky chu nuoc ngoai nao.';
  }

  /**
   * Scan plant image using available Gemini API keys with rotation and error handling
   * @param {Buffer} imageBuffer - The image file buffer
   * @param {string} mimeType - The mime type of the image (e.g. image/jpeg, image/png)
   */
  async scanPlant(imageBuffer, mimeType = 'image/jpeg') {
    const base64Image = imageBuffer.toString('base64');
    
    // 1. Get all available keys
    let availableKeys = await this._getAvailableKeys();
    
    if (availableKeys.length === 0) {
      // Safety valve: If all keys are in cooldown, temporarily reset cooldowns to try again
      console.log('[GeminiScannerService] All keys in cooldown. Resetting cooldowns...');
      await GeminiKey.update({ cooldownUntil: null }, { where: { isBanned: false, isActive: true } });
      availableKeys = await this._getAvailableKeys();
    }

    if (availableKeys.length === 0) {
      throw new Error('all_ai_keys_rate_limited');
    }

    let lastError = null;

    // 2. Loop through keys and retry
    for (const keyRecord of availableKeys) {
      console.log(`[GeminiScannerService] Attempting scan with API key ID: ${keyRecord.id} (used today: ${keyRecord.usedToday})`);
      
      try {
        const result = await this._callGeminiAPI(keyRecord.apiKey, base64Image, mimeType);
        
        // Success: Update usage stats
        await keyRecord.update({
          usedToday: keyRecord.usedToday + 1,
          lastUsed: new Date()
        });
        
        console.log(`[GeminiScannerService] Scan success with key ID: ${keyRecord.id}`);
        return result;
      } catch (err) {
        lastError = err;
        const errMsg = err.message.toLowerCase();
        
        if (this._isBannedError(errMsg)) {
          console.warn(`[GeminiScannerService] Key ID ${keyRecord.id} is permanently banned (403/400). Marking in DB.`);
          await keyRecord.update({ isBanned: true });
        } else if (this._isRateLimitError(errMsg)) {
          console.warn(`[GeminiScannerService] Key ID ${keyRecord.id} hit rate limit (429). Cooling down for 30s.`);
          await keyRecord.update({
            cooldownUntil: new Date(Date.now() + 30 * 1000) // 30 seconds cooldown
          });
        } else {
          console.warn(`[GeminiScannerService] Key ID ${keyRecord.id} encountered generic error: ${err.message}`);
          await keyRecord.update({
            cooldownUntil: new Date(Date.now() + 10 * 1000) // Generic cooldown 10s
          });
        }
      }
    }

    throw lastError || new Error('gemini_unknown');
  }

  /**
   * Run health check ping test on a single key
   * @param {string} apiKey 
   */
  async pingKey(apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:countTokens?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: 'ping' }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    return await response.json();
  }

  // --- Helper Methods ---

  async _getAvailableKeys() {
    return await GeminiKey.findAll({
      where: {
        isActive: true,
        isBanned: false,
        [Op.or]: [
          { cooldownUntil: null },
          { cooldownUntil: { [Op.lt]: new Date() } }
        ]
      },
      order: [
        ['lastUsed', 'ASC'], // Rotate keys fairly
        ['id', 'ASC']
      ]
    });
  }

  async _callGeminiAPI(apiKey, base64Image, mimeType) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [
        {
          parts: [
            { text: this.prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Gemini API error status ${response.status}: ${responseText}`);
    }

    const decoded = JSON.parse(responseText);
    const textContent = decoded.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent || textContent.trim() === '') {
      throw new Error('Gemini returned empty content');
    }

    return this._cleanAndParseJSON(textContent);
  }

  _cleanAndParseJSON(text) {
    let clean = text.trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    
    if (start !== -1 && end !== -1 && end > start) {
      clean = clean.substring(start, end + 1);
    } else {
      clean = clean.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(clean);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Parsed response is not a valid JSON object');
    }
    return parsed;
  }

  _isBannedError(msg) {
    return msg.includes('403') || 
           msg.includes('400') || 
           msg.includes('permission_denied') || 
           msg.includes('api_key_invalid') ||
           msg.includes('api key not valid');
  }

  _isRateLimitError(msg) {
    return msg.includes('429') || 
           msg.includes('rate_limit') || 
           msg.includes('resource_exhausted') || 
           msg.includes('quota');
  }
}

module.exports = new GeminiScannerService();
