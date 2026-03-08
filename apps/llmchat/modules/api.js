// llmchat/modules/api.js - ApiClient 类
import Security from '../../_shared/security.js';

class ApiClient {
  constructor(store) {
    this.store = store;
    this.providers = this.loadProviders();
    this.abortController = null;
  }

  loadProviders() {
    return this.store.settings.providers || [
      { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiKey: null, iconLetter: 'O', color: '#10a37f' },
      { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com', apiKey: null, iconLetter: 'A', color: '#c96442' },
      { id: 'google', name: 'Google', baseUrl: 'https://generativelanguage.googleapis.com', apiKey: null, iconLetter: 'G', color: '#4285f4' }
    ];
  }

  async getApiKey(providerId) {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) return null;
    
    if (provider.apiKey) return provider.apiKey;
    
    // 尝试从 secure storage 获取
    return await Security.secureGet(`llmchat_key_${providerId}`, true);
  }

  async setApiKey(providerId, apiKey) {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) return false;
    
    provider.apiKey = apiKey;
    
    // 安全存储
    await Security.secureStore(`llmchat_key_${providerId}`, apiKey, true);
    
    // 更新 settings
    this.store.saveSettings({ providers: this.providers });
    return true;
  }

  addProvider(provider) {
    const newProvider = {
      id: provider.id || Utils.uid('prov'),
      name: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey || null,
      iconLetter: provider.iconLetter || provider.name[0].toUpperCase(),
      color: provider.color || '#6366f1'
    };
    
    this.providers.push(newProvider);
    this.store.saveSettings({ providers: this.providers });
    return newProvider;
  }

  deleteProvider(providerId) {
    const index = this.providers.findIndex(p => p.id === providerId);
    if (index === -1) return false;
    
    this.providers.splice(index, 1);
    this.store.saveSettings({ providers: this.providers });
    return true;
  }

  getProviders() {
    return [...this.providers];
  }

  // ========== API 调用 ==========
  async sendMessage(providerId, model, messages, options = {}) {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) throw new Error(`Provider ${providerId} not found`);
    
    const apiKey = await this.getApiKey(providerId);
    if (!apiKey) throw new Error('API key not configured');
    
    // 中止之前的请求
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    
    try {
      if (providerId === 'openai') {
        return await this.callOpenAI(provider, apiKey, model, messages, options);
      } else if (providerId === 'anthropic') {
        return await this.callAnthropic(provider, apiKey, model, messages, options);
      } else {
        return await this.callGeneric(provider, apiKey, model, messages, options);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { cancelled: true };
      }
      throw error;
    }
  }

  async callOpenAI(provider, apiKey, model, messages, options) {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || this.store.settings.temperature,
        max_tokens: options.maxTokens || this.store.settings.maxTokens,
        stream: options.stream || false
      }),
      signal: this.abortController?.signal
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }

  async callAnthropic(provider, apiKey, model, messages, options) {
    // 转换消息格式
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const response = await fetch(`${provider.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        system: systemMessage?.content,
        messages: userMessages,
        max_tokens: options.maxTokens || this.store.settings.maxTokens,
        temperature: options.temperature || this.store.settings.temperature
      }),
      signal: this.abortController?.signal
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage,
      model: data.model
    };
  }

  async callGeneric(provider, apiKey, model, messages, options) {
    // 通用 OpenAI 兼容接口
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || this.store.settings.temperature,
        max_tokens: options.maxTokens || this.store.settings.maxTokens
      }),
      signal: this.abortController?.signal
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model
    };
  }

  cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // ========== 模拟响应（用于演示）==========
  getSimulatedResponse(userMessage) {
    const responses = [
      `这是一个模拟的 AI 响应，针对你的消息："${userMessage}"`,
      `我理解你说的是 "${userMessage}"。在实际配置 API 后，这里会有真实的 AI 回复。`,
      `这是一个演示。要使用真实的 AI 对话，请在设置中配置你的 API Key。`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default ApiClient;
